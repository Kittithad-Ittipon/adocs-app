# 1. Standard Library Imports (Python built-in modules)
import os
import random
import shutil
import subprocess
import time
import zipfile
from datetime import timedelta

# 2. External Library Imports (pip install packages)

# 2.1 Web Framework
from flask import Flask, jsonify, request, render_template
from werkzeug.utils import secure_filename

# 2.2 Security and Authentication
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, get_jwt, verify_jwt_in_request
from flask_jwt_extended.exceptions import JWTExtendedException
from flask_bcrypt import Bcrypt
from flask_limiter import Limiter

# 2.3 Database Management
import pymysql
from dbutils.pooled_db import PooledDB

# 2.4 Utilities & Tools
from dotenv import load_dotenv
from flask_mail import Mail, Message
import requests
import yaml
import psutil

# 2.5 Background Tasks
from celery.result import AsyncResult

# 3. Local Application Imports (file from the same project)
from tasks import celery_app

# Load environment variables from .env file
load_dotenv()

# Flask Application Setup
app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")
app.config["JWT_DECODE_LEEWAY"] = timedelta(minutes=5)
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(hours=4)
app.config["MAIL_SERVER"] = "smtp.gmail.com"
app.config["MAIL_PORT"] = 587
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USE_SSL"] = False
app.config["MAIL_USERNAME"] = os.getenv("MAIL_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("MAIL_PASSWORD")
app.config["MAIL_DEFAULT_SENDER"] = os.getenv("MAIL_USERNAME")
base_path = os.getenv("BASE_PATH")

# Start Application With app.run() at the end of the file
bcrypt = Bcrypt(app)
jwt = JWTManager(app)
mail = Mail(app)

# Nginx Proxy Manager (NPM) Token Caching Variables
NPM_TOKEN = None
NPM_EXPIRED = 0

# Database Connection Pool Setup
POOL = PooledDB(
    creator=pymysql,  # Database adapter
    maxconnections=50,  # Max Connections in the pool
    mincached=5,  # Idle connections to keep in the pool
    blocking=True,  # Block if no connections are available
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASS"),
    database=os.getenv("DB_NAME"),
    cursorclass=pymysql.cursors.DictCursor,  # Return results as dictionaries
    ping=1,  # Check if connection is alive before using
    connect_timeout=5,  # Connection timeout in seconds
)

# Rate Limiting Setup Response for Too Many Requests
@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({"error": f"Too Many Requests {e.description}"}), 429

def get_rate_limit_key():
    try:
        verify_jwt_in_request(optional=True) 
        identity = get_jwt_identity()
        if identity:
            return identity
    except JWTExtendedException:
        pass 
    forwarded_for = request.headers.get("X-Forwarded-For")
    if forwarded_for:
        return f"ip:{forwarded_for.split(',')[0].strip()}"
    return f"ip:{request.remote_addr}"

limiter = Limiter(
    key_func=get_rate_limit_key,
    app=app,
    storage_uri="redis://redis-broker:6379/3",  # Use Redis Production Database for Rate Limiting
    # storage_uri="redis://localhost:6379/3",  # Use Redis Development Database for Rate Limiting
)
# Function to get a database connection from the pool
def get_db_connection():
    return POOL.connection()

# Function to get NPM token
def get_npm_token():

    global NPM_TOKEN
    global NPM_EXPIRED

    now = time.time()

    if NPM_TOKEN and now < NPM_EXPIRED:
        return NPM_TOKEN

    url = f"{os.getenv('NPM_URL')}/api/tokens"
    payload = {
        "identity": os.getenv("NPM_EMAIL"),
        "secret": os.getenv("NPM_PASSWORD")
    }
    response = requests.post(url, json=payload, verify=False)
    if response.status_code == 200:
        NPM_TOKEN = response.json().get("token")
        NPM_EXPIRED = now + 3600
        return NPM_TOKEN
    return None

# Function to update NPM proxy host
def nginx_update_proxy(npm_id, domain, container_name, port, protocol):
    token = get_npm_token()
    if not token:
        return False, "NPM Auth Failed"

    url = f"{os.getenv('NPM_URL')}/api/nginx/proxy-hosts/{npm_id}"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

    payload = {
        "domain_names": [domain],
        "forward_scheme": protocol,
        "forward_host": container_name,
        "forward_port": int(port),
        "access_list_id": 0,
        "certificate_id": os.getenv("NPM_CERT_ID"),
        "ssl_forced": True,
        "caching_enabled": False,
        "block_exploits": True,
        "allow_websocket_upgrade": True,
        "http2_support": True,
        "hsts_enabled": True,
        "hsts_subdomains": False
    }

    try:
        response = requests.put(
            url, json=payload, headers=headers, verify=False, timeout=30)
        if response.status_code == 200:
            return True, "Proxy Host Updated Successfully"
        else:
            error_msg = response.json().get("error", {}).get("message", "Unknown Error")
            return False, f"NPM Update Failed: {error_msg}"
    except Exception as e:
        return False, f"Connection Error: {str(e)}"

# Function to unzip uploaded file
def unzip_here(zip_path, target_dir):
    try:
        target_dir = os.path.abspath(target_dir)
        os.makedirs(target_dir, exist_ok=True)

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(target_dir)

        while True:
            items = os.listdir(target_dir)
            if len(items) != 1:
                break

            nested = os.path.join(target_dir, items[0])
            if not os.path.isdir(nested):
                break

            temp_dir = os.path.join(target_dir, "temp_nested_dir")
            os.rename(nested, temp_dir)

            for item in os.listdir(temp_dir):
                src = os.path.join(temp_dir, item)
                dst = os.path.join(target_dir, item)
                if os.path.exists(dst):
                    if os.path.isdir(dst):
                        shutil.rmtree(dst)
                    else:
                        os.remove(dst)
                shutil.move(src, dst)
            os.rmdir(temp_dir)
    except Exception as e:
        print(f"Unzip Error: {e}")

# Function to validate docker-compose.yml file and check user quota before deployment
def validate_docker_compose(project_path, username, container_name):
    ram = psutil.virtual_memory()
    MAX_RAM_PERCENT = 85.0
    if ram.percent > MAX_RAM_PERCENT:
        available_gb = ram.available / (1024 ** 3)
        return f"Server is at capacity (RAM usage: {ram.percent}%). Only {available_gb:.2f} GB available. Please try again later.", None, None, None

    conn = None
    img_names_dict = {}
    try:
        compose_file = None
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user_data = cursor.fetchone()
        max_containers = user_data["max_containers"]
        current_usage = int(user_data["container"])
        for fname in ["docker-compose.yml", "docker-compose.yaml"]:
            path = os.path.join(project_path, fname)
            if os.path.exists(path):
                compose_file = path
                break

        if not compose_file:
            return "docker-compose.yml file not found", None, None, None

        try:
            with open(compose_file, "r") as f:
                compose = yaml.safe_load(f)
        except Exception as e:
            return f"docker-compose.yml Syntax Error: {str(e)}", None, None, None

        if "services" not in compose:
            return "No Services Defined in docker-compose.yml", None, None, None

        services = compose["services"]

        value_container = len(services)
        cursor.execute(
            "SELECT COUNT(*) as count FROM containers WHERE project_path = %s AND owner = %s", (project_path, username))
        container_data = cursor.fetchone()
        old_stack_count = 0

        if not container_data:
            old_stack_count = 0
        else:
            old_stack_count = container_data['count']

        predicted_usage = (current_usage - old_stack_count) + value_container

        if int(predicted_usage) > int(max_containers):
            return f"Quota Exceeded! You have {current_usage}. This stack is {value_container}. Total would be {predicted_usage} (Max: {max_containers})", None, None, None

        if len(services) == 0:
            return "No Service Found"

        main_service_found = False

        for service_name, service in services.items():
            if service_name == container_name:
                main_service_found = True

            img_name = None

            if "image" in service:
                img_name = service["image"]
            elif "build" in service and isinstance(service["build"], dict) and "dockerfile_inline" in service["build"]:
                dockerfile_inline = service["build"]["dockerfile_inline"]
                for line in dockerfile_inline.splitlines():
                    line = line.strip()
                    if line.upper().startswith("FROM"):
                        img_name = line.split()[1]
                        break
            else:
                return f"Service '{service_name}' must have an 'image' or 'build' with 'dockerfile_inline' defined.", None, None, None

            if not img_name:
                return f"Service '{service_name}' Dockerfile_inline must contain FROM !", None, None, None

            img_names_dict[service_name] = img_name

            if "container_name" in service:
                return f"service '{service_name}' cannot define container_name", None, None, None

            service["container_name"] = f"{username}_{container_name}_{service_name}"

            if "image" not in service and "build" not in service:
                return f"Service '{service_name}' Must Have Either 'image' or 'build' Defined.", None, None, None

            if "ports" in service:
                return f"service '{service_name}' Not Allowed To Map Ports", None, None, None

            if "volumes" in service:
                paths = service["volumes"]
                for path in paths:
                    parts = path.split(":")
                    host_path = parts[0].strip()
                    if ".." in host_path or host_path.startswith("/") or host_path.startswith("~"):
                        return f"Invalid volume path '{host_path}'. Use relative paths starting with './' only.", None, None, None

                    if not host_path.startswith("./"):
                        return f"Volume path '{host_path}' must be relative (start with './')", None, None, None

            value_img = img_name.lower()
            if "mysql" in value_img or "postgres" in value_img or "mariadb" in value_img:
                return f"service '{service_name}' is Database (Not Allowed) Please Connect Your Database", None, None, None

            if "labels" in service:
                service["labels"] = {"user": username,
                                     "container": container_name}
            else:
                service["labels"] = {"user": username,
                                     "container": container_name}

            if "restart" not in service:
                service["restart"] = "unless-stopped"
            else:
                allowed_restarts = "unless-stopped"
                if service["restart"] != allowed_restarts:
                    return f"service '{service_name}' has invalid restart policy. Allowed values are: {allowed_restarts}", None, None, None

            if "networks" in service:
                nets = service["networks"]

                if isinstance(nets, list):
                    for n in nets:
                        if n != "lan-net":
                            return f"service '{service_name}' must use lan-net only", None, None, None

                elif isinstance(nets, dict):
                    for n in nets.keys():
                        if n != "lan-net":
                            return f"service '{service_name}' must use lan-net only", None, None, None

        if not main_service_found:
            return f"Main service '{container_name}' not found in docker-compose.yml. Please ensure the service name matches your main service.", None, None, None

        if "networks" not in compose:
            return "docker-compose.yml must define networks", None, None, None

        networks = compose["networks"]
        if "lan-net" not in networks:
            return "lan-net network must be defined", None, None, None

        if not networks["lan-net"].get("external"):
            return "lan-net must be external network", None, None, None

        try:
            with open(compose_file, "w") as f:
                yaml.safe_dump(
                    compose, f, default_flow_style=False, sort_keys=False)
        except Exception as e:
            return f"Failed to save updated docker-compose file: {str(e)}", None, None, None

        return True, value_container, services, img_names_dict

    except Exception as e:
        return f"Error processing docker-compose.yml: {str(e)}", None, None, None
    finally:
        if conn:
            conn.close()

# API Endpoint for User Login, JWT Token Generation
@app.route("/api/auth/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    data = request.json
    username = data.get("username")
    password = data.get("password")
    conn = None
    username_add_token = None
    role = None
    password_hashed = None
    user_id = None

    try:
        if not username or not password:
            return jsonify({"error": "missing data"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM users WHERE email=%s OR username=%s", (username, username))
        user_data = cursor.fetchone()

        if not user_data:
            return jsonify({"error": "Invalid Username Or Email Or Password !"}), 401

        if user_data:
            username_add_token = user_data["username"]
            role = user_data["role"]
            password_hashed = user_data["password"]
            user_id = user_data["id"]

        password_verify = bcrypt.check_password_hash(password_hashed, password)
        if password_verify:
            token = create_access_token(
                identity=str(user_id),
                additional_claims={
                    "username": username_add_token, "role": role},
            )

            return (
                jsonify(
                    {"message": "Login Success", "token": token}
                ),
                200,
            )
        else:
            return jsonify({"error": "Login Failed Invalid Username or Password"}), 401

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint for Forgot Password Functionality with OTP Generation, Email Sending, and JWT Token Creation for OTP Validation
@app.route("/api/auth/forgot", methods=["POST"])
@limiter.limit("3 per hour")
def forgot():
    conn = None
    try:
        data = request.json
        username = data["username"]
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM users WHERE username = %s OR email = %s", (username, username))
        user_data = cursor.fetchone()
        if not user_data:
            return jsonify({"error": "Username Or Email Not Found"}), 401

        email = user_data["email"]
        username_send = user_data["username"]
        otp = f"{random.randint(0, 9)}{random.randint(0, 9)}{random.randint(0, 9)}{random.randint(0, 9)}{random.randint(0, 9)}{random.randint(0, 9)}"
        token = create_access_token(
            identity=user_data["username"],
            additional_claims={
                "otp": otp,
                "role": user_data["role"],
                "email": user_data["email"],
            },
            expires_delta=timedelta(minutes=5),
        )
        mail_otp = Message(
            subject="Adocs",
            recipients=[f"{email}"],
        )
        mail_otp.html = render_template(
            "/mail.html", otp=otp, username=username_send)

        mail.send(mail_otp)
        return jsonify({"message": "Get OTP on Your Mail", "token": token}), 200

    except Exception as e:
        print("Fetch Data Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint for Resetting Password Using OTP with JWT Validation, Optional Database Password Update
@app.route("/api/auth/reset", methods=["PATCH"])
@limiter.limit("3 per hour")
@jwt_required()
def forgot_repassword():
    conn = None
    try:
        data = request.json
        data_token = get_jwt()
        username_token = get_jwt_identity()
        otp_token = data_token["otp"]
        otp = data["otpValue"]
        password = data["password"]
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s",
                       (username_token,))
        user_data = cursor.fetchone()

        if otp_token != otp:
            return jsonify({"error": "Wrong OTP Please Check Your Mail!"}), 401

        hashed = bcrypt.generate_password_hash(password).decode()
        cursor.execute(
            "UPDATE users SET password = %s WHERE username = %s",
            (hashed, username_token),
        )

        if user_data["db"] == 1:
            cursor.execute("ALTER USER %s@'%%' IDENTIFIED BY %s",
                           (username_token, password))
            cursor.execute("FLUSH PRIVILEGES")

        conn.commit()
        return jsonify({"message": "Change Password Success"}), 200

    except Exception as e:
        print("Fetch Data Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint to Fetch Container Data for the Logged-In User with Role-Based Access Control
@app.route("/api/containers", methods=["GET"])
@jwt_required()
@limiter.limit("20 per minute")
def container_data():
    conn = None
    try:
        data = get_jwt()
        username = data["username"]
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT * FROM containers WHERE owner = %s", (username,))
        containers_data = cursor.fetchall()

        if not containers_data:
            return jsonify({"error": "No Containers Data"}), 401

        return jsonify(containers_data), 200

    except Exception as e:
        print("Fetch Data Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint for Uploading a Zip File, Validating Docker Compose, Deploying with Celery Background Task,
# and Handling Both New Deployments and Updates with Full Cleanup on Failure
@app.route("/api/containers", methods=["POST"])
@jwt_required()
@limiter.limit("5 per minute")
def upload():
    conn = None
    raw_save_path = os.getenv("BASE_PATH")
    if not raw_save_path:
        return jsonify({"error": "BASE_PATH not set in .env"}), 500

    path_to_clean_folder = None
    path_to_clean_zip = None
    task_started = False
    save_path = os.path.normpath(raw_save_path)

    try:
        data_token = get_jwt()
        username = data_token["username"]
        file = request.files["file"]
        raw_container_name = request.form.get("serviceName")
        container_name = secure_filename(raw_container_name)
        port = request.form.get("port")
        domain_name = request.form.get("domain")
        domain = f"{domain_name}.addp.site"
        newfile = request.form.get("uploadType")
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM containers WHERE domain = %s", (domain,))
        domain_exists = cursor.fetchone()

        if not domain_exists:
            domain_exists = None

        if newfile == "deploy" and domain_exists is not None:
            return jsonify({"error": "Domain Already Exists Please Use Other Domain"}), 400

        user_path = os.path.abspath(os.path.join(save_path, username))
        os.makedirs(user_path, exist_ok=True)

        filename = secure_filename(file.filename)
        ext = os.path.splitext(filename)[1]
        if not ext == ".zip":
            return jsonify({"error": ".zip File Only"}), 401

        if newfile == "deploy":
            action = "DEPLOY"
            new_filename = f"{container_name}{ext}"
            full_path = os.path.abspath(os.path.join(user_path, new_filename))
            full_path_floder = os.path.abspath(
                os.path.join(user_path, container_name))

            path_to_clean_zip = full_path
            path_to_clean_folder = full_path_floder

            if os.path.exists(full_path) or os.path.exists(full_path_floder):
                return jsonify({"error": f"Project '{container_name}' Already Exists Please Change Service Name"}), 400

            file.save(full_path)

            try:
                unzip_here(full_path, full_path_floder)

                compose = os.path.join(full_path_floder, "docker-compose.yml")
                if not os.path.exists(compose):
                    return jsonify({"error": f"Project '{container_name}' Not Found Cannot Deploy Please Check Service Name"}), 400

                validate_result, value_container, services, img_names_dict = validate_docker_compose(
                    full_path_floder, username, container_name)

                if validate_result != True:
                    shutil.rmtree(full_path_floder)
                    os.remove(full_path)
                    return jsonify({"error": f"docker-compose.yml Validation Failed: {validate_result}"}), 400

                docker_project_name = f"{username}_{container_name}"

                from tasks import docker_deploy
                task = docker_deploy.delay(full_path, full_path_floder, docker_project_name, action, username,
                                           container_name, port, domain, img_names_dict, services, domain_name, value_container)
                task_started = True
                print(task.id)
                return jsonify({"message": f"Deploying Project '{container_name}' Wait for Background Task", "taskID": task.id}), 200

            except Exception as e:
                print("Fetch Data Error:", e)

                if full_path_floder and os.path.exists(full_path_floder):
                    shutil.rmtree(full_path_floder)

                if full_path and os.path.exists(full_path):
                    os.remove(full_path)

                return jsonify({"error": f"Extract or Deploy failed: {str(e)}"}), 500

        elif newfile == "update":
            action = "UPDATE"

            if domain_exists is None:
                return jsonify({"error": f"Domain '{domain}' not found in system"}), 404

            if domain_exists["domain"] != domain:
                return jsonify({"error": f"Your Input Domain is {domain} Not Match Your System Domain {domain_exists['domain']} "}), 400

            new_path_filename = f"{container_name}{ext}"
            new_full_path = os.path.join(user_path, new_path_filename)
            new_full_path_floder = os.path.join(user_path, container_name)
            path_to_clean_zip = new_full_path
            path_to_clean_folder = new_full_path_floder

            compose = os.path.join(new_full_path_floder, "docker-compose.yml")
            if not os.path.exists(compose):
                return jsonify({"error": f"Project '{container_name}' Not Found Cannot Update Please Check Service Name"}), 400

            if os.path.exists(new_full_path) or os.path.exists(new_full_path_floder):
                file.save(new_full_path)
                try:
                    shutil.rmtree(new_full_path_floder)
                    os.makedirs(new_full_path_floder)
                    unzip_here(new_full_path, new_full_path_floder)

                    if not os.path.exists(os.path.join(new_full_path_floder, "docker-compose.yml")):
                        return jsonify({"error": "docker-compose.yml Not Found in Update Zip"}), 400

                    validate_result, value_container, services, img_names_dict = validate_docker_compose(
                        new_full_path_floder, username, container_name)
                    if validate_result != True:
                        shutil.rmtree(new_full_path_floder)
                        os.remove(new_full_path)
                        return jsonify({"error": f"docker-compose.yml Validation Failed: {validate_result}"}), 400

                    docker_project_name = f"{username}_{container_name}"
                    npm_id = domain_exists["npm_id"]

                    from tasks import docker_update
                    task = docker_update.delay(new_full_path, new_full_path_floder, docker_project_name, action, username, container_name, port, domain, img_names_dict, services, domain_name, npm_id, value_container)
                    task_started = True

                    return jsonify({"message": f"Updating Project '{container_name}' Wait for Background Task", "taskID": task.id}), 200

                except Exception as e:
                    print("Fetch Data Error:", e)
                    if new_full_path_floder and os.path.exists(new_full_path_floder):
                        shutil.rmtree(new_full_path_floder)

                    if new_full_path and os.path.exists(new_full_path):
                        os.remove(new_full_path)

                    return jsonify({"error": f"Extract or Deploy failed: {str(e)}"}), 500
            else:
                return jsonify({"error": f"Project '{container_name}' Not Found Cannot Update Please Check Container Name"}), 400
        else:
            return jsonify({"error": f"Error Can't Save"}), 401

    except Exception as e:
        print(f"Deployment Error: {e}")

        if conn:
            conn.rollback()

        if not task_started:
            if path_to_clean_folder and os.path.exists(path_to_clean_folder):
                try:
                    shutil.rmtree(path_to_clean_folder)
                except Exception as ex:
                    print(f"Failed to cleanup folder: {ex}")

            if path_to_clean_zip and os.path.exists(path_to_clean_zip):
                try:
                    os.remove(path_to_clean_zip)
                except Exception as ex:
                    print(f"Failed to cleanup zip: {ex}")

        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint to Fetch Active and Published Container Data
@app.route("/api/containers/active", methods=["GET"])
@limiter.limit("25 per minute")
def active_site():
    conn = None
    try:
        username = "admin"
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM containers WHERE owner != %s AND publish = 1 ORDER BY updated_at DESC",(username,))
        system_data = cursor.fetchall()

        if not system_data:
            return jsonify({"error": "No System Data"}) , 401
        
        return jsonify(system_data) , 200

    except Exception as e:
        print("Fetch Data Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint for updating Container Port and Publish Status
@app.route("/api/containers/<projectName>", methods=["PATCH"])
@jwt_required()
@limiter.limit("10 per minute")
def port_update(projectName):
    conn = None
    try:
        data_token = get_jwt()
        username = data_token["username"]
        data = request.json
        port = data["port"]
        container_name = projectName
        protocol = data["protocol"]
        pub = data["publish"]
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM containers WHERE container_name = %s", (container_name,))
        user_data = cursor.fetchone()
        domain = user_data["domain"]
        port_internal = user_data["port_internal"]
        forward_scheme = user_data["forward_scheme"]


        if not domain:
            try:
                if port == "" or port is None:
                    cursor.execute("UPDATE containers SET port_internal = NULL, publish = %s WHERE container_name = %s AND owner = %s", (pub, container_name, username))
                else:
                    cursor.execute("UPDATE containers SET port_internal = %s, publish = %s WHERE container_name = %s AND owner = %s", (port, pub, container_name, username))
                conn.commit()
                return jsonify({"message": "Update Port Success"}) , 201
            except Exception as e:
                if conn:
                    conn.rollback()
                print("Fetch Data Error:", e)
                return jsonify({"error": "Failed to fetch data"}), 500
            
        elif domain:
            if port_internal == port and forward_scheme == protocol or port is None or port == "":
                if port == "" or port is None:
                    port = int(port_internal)
                try:
                    cursor.execute("UPDATE containers SET publish = %s WHERE container_name = %s", (pub, container_name))
                    conn.commit()
                    return jsonify({"message": "Update Publish Status Success"}), 201
                except Exception as e:
                    return jsonify({"error": "Failed to Update Publish Status"}), 500
            else:                
                if port == "" or port is None:
                    port = int(port_internal)
                try:
                    status , msg_npm = nginx_update_proxy(user_data["npm_id"], domain, user_data["container_name"], port, protocol)
                    if status:
                        cursor.execute("UPDATE containers SET port_internal = %s, forward_scheme = %s, 	publish = %s WHERE container_name = %s", (port, protocol, pub, container_name))
                        conn.commit()
                        return jsonify({"message": "Update Port Proxy Host and Publish Status Success"}), 201
                    else:
                        return jsonify({"error": f"NPM Update Failed: {msg_npm}"}), 500
                    
                except Exception as e:
                    if conn:
                        conn.rollback()
                    print("Internal Error:", e)
                    return jsonify({"error": "Failed to update proxy or database"}), 500

        else:
            return jsonify({"error": "Data Error"}) , 400

    except Exception as e:
        if conn:
            conn.rollback()
        print("Fetch Data Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint for Deleting a Stack with Pending Status Check, Docker Container Cleanup, Database Update, and Activity Logging with Full Logs
@app.route("/api/containers/<projectName>", methods=["DELETE"])
@jwt_required()
@limiter.limit("3 per minute")
def del_stack(projectName):
    conn = None
    container_list = []
    result = None
    try:
        data_token = get_jwt()
        username = data_token["username"]
        data = request.json
        project_path = data.get("projectPath")
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user_data = cursor.fetchone()
        user_id = user_data['id']
        container_value = int(user_data['container'])

        if not user_data:
            return jsonify({"error": "Users Data Not Found"}), 400

        cursor.execute("SELECT * FROM containers WHERE project_path = %s AND owner = %s", (project_path,username))
        container_user_data = cursor.fetchall()
        if not container_user_data:
            return jsonify({"error": "No Stack Found"}), 404

        cursor.execute("SELECT * FROM containers WHERE project_path = %s AND owner = %s AND status = %s", (project_path,username,"pending"))
        pending_data = cursor.fetchall()
        if pending_data:
            return jsonify({"error": "This Stack is already being deleted. Please wait."}), 429
        
        folder_name = os.path.basename(project_path) 
        docker_project_name = f"{username}_{folder_name}"

        for container in container_user_data:
            container_list.append(container["container_name"])

        full_c_name = f"STACK : {folder_name}"
        full_log = (
            f"------------[DELETE STACK]------------ \n\n"
            f"[CMD]:\n  {docker_project_name}\n\n\n"
            f"[STDOUT]:\n   - PENDING -\n\n\n"
            f"[STDERR]:\n   - PENDING -\n\n\n"
            f"[NPM]:\n   - PENDING -\n\n\n"
            f"[CONTAINER NAME]:\n  -PENDING- \n"
            )
        
        cursor.execute("UPDATE containers SET status = %s WHERE project_path = %s AND owner = %s", ("pending", project_path, username))
        cursor.execute("INSERT INTO activity_logs (user_id, username, container_name, action, status, details) VALUES (%s, %s, %s, %s, %s, %s)", (user_id, username, full_c_name, "DELETE", "PENDING", full_log))      
        conn.commit()
        log_id = cursor.lastrowid

        from tasks import docker_delstack
        task = docker_delstack.delay(project_path, docker_project_name, folder_name, username, user_id, container_list, container_value, container_user_data, log_id)

        return jsonify({"message": "Stack deleted successfully", "taskID": task.id}), 200
    
    except Exception as e:
        if conn:
            conn.rollback()
        print("Fetch Data Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint for Start Stop Container
@app.route("/api/containers/<projectName>/status", methods=["PATCH"])
@jwt_required()
@limiter.limit("3 per minute")
def status_container(projectName):
    conn = None
    cmd = []
    result_action = ""
    try:
        data_token = get_jwt()
        username = data_token["username"]
        data = request.json
        project_path = data.get("projectPath")
        action = data.get("containerStatus")

        if not project_path or not action:
            return jsonify({"error": "Missing stack path or status"}), 400

        conn = get_db_connection()
        cursor = conn.cursor()

        folder_name = os.path.basename(project_path)
        docker_project_name = f"{username}_{folder_name}"

        if action == "running":
            cmd = ["docker", "compose", "-p", docker_project_name, "stop"]
            result_action = "stopped"
        elif action == "stopped":
            cmd = ["docker", "compose", "-p", docker_project_name, "up", "-d"]
            result_action = "running"
        else:
            return jsonify({"error": "Invalid status action"}), 400

        cursor.execute("SELECT * FROM containers WHERE project_path = %s AND owner = %s",(project_path, username))
        containers = cursor.fetchall()
        
        if not containers:
            return jsonify({"error": "Stack Not Found or Permission Denied"}), 404


        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user_data = cursor.fetchone()
        user_id = user_data['id']

        log_content = (
            f"------------[{result_action.upper()} LOGS]------------ \n\n"
            f"[CMD]:\n  {cmd}\n\n\n"
            f"[STDOUT]:\n   - PENDING -\n\n\n"
            f"[STDERR]:\n   - PENDING -\n"
        )
        full_c_name = f"STACK : {folder_name}"

        cursor.execute("UPDATE containers SET status = %s WHERE project_path = %s AND owner = %s",("pending", project_path, username))
        cursor.execute("INSERT INTO activity_logs (user_id, username, container_name, action, status, details) VALUES (%s, %s, %s, %s, %s, %s)", (user_id, username, full_c_name, result_action.upper(), "PENDING", log_content))
        log_id = cursor.lastrowid

        conn.commit()

        from tasks import docker_start_stop
        task = docker_start_stop.delay(result_action, folder_name, project_path, docker_project_name, cmd, username, log_id)

        return jsonify({"message": f"Container {result_action} Pending", "taskID": task.id }), 200

    except Exception as e:
        if conn:
            conn.rollback()
        print(f"Status Change Error: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint to Fetch Dashboard Data Including User Info, Total Users, Container Usage, and Activity Logs with Role-Based Access Control
@app.route("/api/dashboard", methods=["GET"])
@jwt_required()
@limiter.limit("15 per minute")
def dashboard_data():
    try:
        data = get_jwt()
        user_username = data["username"]
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM users")
        user_total = cursor.fetchone()
        user_total = user_total["total"]
        cursor.execute("SELECT * FROM users WHERE username = %s", (user_username,))
        user_data = cursor.fetchone()
        cursor.execute("SELECT COUNT(req_db) as total FROM users WHERE req_db = 1")
        req_total = cursor.fetchone()

        action = "DEPLOY"
        cursor.execute("SELECT COUNT(*) as total FROM activity_logs WHERE action = 'DEPLOY'")
        upload_total = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total FROM activity_logs WHERE action = 'DEPLOY' AND username = %s", (user_username,))
        user_upload_total = cursor.fetchone()

        return (
            jsonify(
                {
                    "username": user_username,
                    "user_total": user_total,
                    "upload_total": upload_total["total"],
                    "email": user_data["email"],
                    "database": user_data["db"],
                    "req_total": req_total["total"],
                    "user_upload_total": user_upload_total["total"],
                    "max_containers": user_data["max_containers"],
                    "container_used": user_data["container"],
                    "role": user_data["role"],
                }
            ),
            200,
        )

    except Exception as e:
        print("Dashboard Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500

    finally:
        if conn:
            conn.close()

# API Endpoint to Fetch Activity Logs with Role-Based Access Control for Admins (All Logs) and Users (Own Logs Only)
@app.route("/api/logs", methods=["GET"])
@jwt_required()
@limiter.limit("20 per minute")
def logs():
    conn = None
    try:
        data = get_jwt()
        username = data["username"]
        role = data["role"]
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if role == "admin":
            cursor.execute("SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 200")
            logs_data = cursor.fetchall()
            if not logs_data:
                return jsonify({"error": "No Logs Data"}) , 401
            return jsonify(logs_data) , 200
        elif role == "user":
            cursor.execute("SELECT * FROM activity_logs WHERE username = %s ORDER BY created_at DESC LIMIT 100",(username,))
            logs_data = cursor.fetchall()
            if not logs_data:
                return jsonify({"error": "No Logs Data"}) , 401
            return jsonify(logs_data) , 200
        else:
            return jsonify({"error": "Fetch Logs Error"}) , 401
    except Exception as e:
        print("Fetch Data Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint to Check Celery Task Status and Return Logs or Errors
@app.route("/api/tasks/<taskID>", methods=["GET"])
@jwt_required()
@limiter.limit("30 per minute")
def get_task_status(taskID):
    task = celery_app.AsyncResult(taskID)

    if task.state in ['PENDING', 'STARTED']:
        return jsonify({"message": "working"}), 202

    elif task.state == 'SUCCESS':
        result = task.result
        
        if result.get("error"):
            return jsonify({"error": result["error"]}), 500
            
        return jsonify({"message": result["message"]}), 200

    else:
        return jsonify({"error": str(task.result)}), 500

# API Endpoint for User Registration with Optional Database Creation, Password Hashing
@app.route("/api/users", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    data = request.json
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")
    create_db = data.get("dbState")
    conn = None

    try:
        if not username or not email or not password:
            return jsonify({"error": "missing data"}), 400

        hashed = bcrypt.generate_password_hash(password).decode()
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute(
            "SELECT id FROM users WHERE username=%s OR email=%s", (username, email)
        )
        if cursor.fetchone():
            return jsonify({"error": "Username Or Email Already Exists"}), 409

        if create_db:
            db_name = f"db_{username}"
            cursor.execute(f"CREATE DATABASE {db_name}")
            cursor.execute(f"CREATE USER '{username}'@'%' IDENTIFIED BY '{password}'")
            cursor.execute(f"GRANT ALL PRIVILEGES ON {db_name}.* TO '{username}'@'%'")
            cursor.execute("FLUSH PRIVILEGES")

        cursor.execute(
            "INSERT INTO users (username, email, password, db) VALUES (%s, %s, %s, %s)",
            (username, email, hashed, create_db),
        )
        conn.commit()
        return jsonify({"message": "register success"}), 201
    except Exception as e:
        conn.rollback()
        print("Error:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint to Fetch All Users with Role-Based Access Control for Admins Only
@app.route("/api/users", methods=["GET"])
@jwt_required()
@limiter.limit("10 per minute")
def users_table():
    conn = None
    try:
        data = get_jwt()
        username = data["username"]
        role = data["role"]
        get_role = "user"
        conn = get_db_connection()
        cursor = conn.cursor()

        if role != "admin":
            return jsonify({"error": "Permission Denied Admin Only"}), 403

        cursor.execute("SELECT * FROM users WHERE role = %s", (get_role,))
        users_data = cursor.fetchall()
        return jsonify(users_data), 200

    except Exception as e:
        print("Fetch Data Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint to Fetch Profile Data Including User Info, Total Users, Container Usage, and Activity Logs with Role-Based Access Control
@app.route("/api/users/profile", methods=["GET"])
@jwt_required()
@limiter.limit("15 per minute")
def profile_data():
    try:
        data = get_jwt()
        user_username = data["username"]
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) as total FROM users")
        user_total = cursor.fetchone()
        user_total = user_total["total"]
        cursor.execute("SELECT * FROM users WHERE username = %s", (user_username,))
        user_data = cursor.fetchone()
        cursor.execute("SELECT COUNT(req_db) as total FROM users WHERE req_db = 1")
        req_total = cursor.fetchone()

        action = "DEPLOY"
        cursor.execute("SELECT COUNT(*) as total FROM activity_logs WHERE action = 'DEPLOY'")
        upload_total = cursor.fetchone()

        cursor.execute("SELECT COUNT(*) as total FROM activity_logs WHERE action = 'DEPLOY' AND username = %s", (user_username,))
        user_upload_total = cursor.fetchone()

        return (
            jsonify(
                {
                    "username": user_username,
                    "user_total": user_total,
                    "upload_total": upload_total["total"],
                    "email": user_data["email"],
                    "database": user_data["db"],
                    "req_total": req_total["total"],
                    "user_upload_total": user_upload_total["total"],
                    "max_containers": user_data["max_containers"],
                    "container_used": user_data["container"],
                    "role": user_data["role"],
                }
            ),
            200,
        )

    except Exception as e:
        print("Dashboard Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500

    finally:
        if conn:
            conn.close()

# API Endpoint for Changing User Password with Current Password Verification, Optional Database Password Update, and Role-Based Access Control
@app.route("/api/users/<userName>/password", methods=["PATCH"])
@jwt_required()
@limiter.limit("3 per minute")
def re_password(userName):
    data = get_jwt()
    username = data["username"]
    password_data = request.json
    password = password_data.get("password")
    new_password = password_data.get("newPassword")
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user_data = cursor.fetchone()

        password_hashed = user_data["password"]
        db = user_data["db"]
        password_verify = bcrypt.check_password_hash(password_hashed, password)
        if not password_verify:
            return jsonify({"error": "Invalid Password Please Try Again"}), 401

        if db and user_data["role"] == "user":
            cursor.execute("ALTER USER %s@'%%' IDENTIFIED BY %s", (username, new_password))
            cursor.execute("FLUSH PRIVILEGES")

        hashed = bcrypt.generate_password_hash(new_password).decode()
        cursor.execute("UPDATE users SET password = %s WHERE username = %s",(hashed, username),)
        conn.commit()
        return jsonify({"message": "Change Password Success"}), 200

    except Exception as e:
        print("Reset Password Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint for Requesting Database Access Change request database = 1
@app.route("/api/users/<userName>/requestDB", methods=["PATCH"])
@jwt_required()
@limiter.limit("3 per minute")
def req_db(userName):
    conn = None
    try:
        data_token = get_jwt()
        username = data_token["username"]
        data = request.json
        req_db = data["requestDB"]
        conn = get_db_connection()
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user_data = cursor.fetchone()
        db_status = user_data["db"]
        req_status = user_data["req_db"]

        if db_status == 1:
            return jsonify({"error": "Already Database Account"}), 401

        if req_status == 1:
            return jsonify({"error": "Request Already Pending"}), 400

        cursor.execute("UPDATE users SET req_db = 1 WHERE username = %s", (username,))
        conn.commit()
        return jsonify({"message": "Request Success Please Wait Admin Approve"}), 200

    except Exception as e:
        print("Fetch Data Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint for Deleting User Account with Role-Based Access Control, Optional Database Deletion, Docker Container Cleanup, and Activity Logging with Full Logs
@app.route("/api/users/<userName>", methods=["DELETE"])
@jwt_required()
@limiter.limit("3 per minute")
def deluser(userName):
    data_token = get_jwt()
    id_users = get_jwt_identity()
    username_token = data_token["username"]
    role_token = data_token["role"]
    username = userName
    conn = None
    n = 0

    if role_token != "admin" and username_token != username:
        return jsonify({"error": "Permission Denied"}), 403
        
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user_data = cursor.fetchone()
        
        if not user_data:
            return jsonify({"error": "User Not Found"}), 404
        
        all_docker_logs = [f"[DELETE]:\n USERNAME: {username} \n ID: {user_data["id"]} \n\n\n"]
        db_name = f"db_{username}"

        cursor.execute("SELECT * FROM users WHERE status = %s AND username = %s", ("DELETING", username))  
        is_processing = cursor.fetchone()
        if is_processing and is_processing["status"] == "DELETING":
            return jsonify({"message": "This user is already being deleted. Please wait."}), 429

        cursor.execute("SELECT * FROM containers WHERE owner = %s", (username,))
        container_user_data = cursor.fetchall()
        
        full_log = "\n".join(all_docker_logs)
        cursor.execute("UPDATE users SET status = 'DELETING' WHERE username = %s", (username,))
        cursor.execute("INSERT INTO activity_logs (user_id, username, container_name, action, status, details) VALUES (%s, %s, %s, %s, %s, %s)", (id_users, username_token, f"ACCOUNT: {username}", "DELETE", "PENDING", full_log))
        conn.commit()

        log_id = cursor.lastrowid
        from tasks import docker_deluser
        task = docker_deluser.delay(username, container_user_data, db_name, all_docker_logs, id_users, username_token, log_id)

        return jsonify({"message": "Delete Success", "taskID": task.id}), 200
    except Exception as e:
        if conn:
            conn.rollback()
        print("Fetch Data Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# API Endpoint for Changing User's Maximum Container Limit with Validation, Optional Database Creation/Deletion
@app.route("/api/users/<userName>", methods=["PATCH"])
@jwt_required()
@limiter.limit("3 per minute")
def max_container(userName):
    data_token = get_jwt()
    username_token = data_token["username"]
    role_token = data_token["role"]
    data = request.json
    username = userName
    max_containers = data["maxContainers"]
    db_mode = data["useDB"]
    conn = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        container_count = int(max_containers)
    
        if container_count < 5 or container_count > 10:
            return jsonify({"error": "Out of Range Must be between 5 and 10"}), 400
        
        cursor.execute("UPDATE users SET max_containers = %s WHERE username = %s",(max_containers, username),)
        db_name = f"db_{username}"

        if role_token == "admin":
            if db_mode:
                cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
                cursor.execute(
                    f"CREATE USER IF NOT EXISTS '{username}'@'%' IDENTIFIED BY 'password'"
                )
                cursor.execute(
                    f"GRANT ALL PRIVILEGES ON {db_name}.* TO '{username}'@'%'"
                )
                cursor.execute("FLUSH PRIVILEGES")
                cursor.execute(
                    "UPDATE users SET db = 1 WHERE username = %s", (username,)
                )
                cursor.execute(
                    "UPDATE users SET req_db = 0 WHERE username = %s", (username,)
                )
                conn.commit()
                return (
                    jsonify(
                        {"message": "Updated Containers or Created Database Success"}
                    ),
                    200,
                )
            else:
                cursor.execute(f"DROP DATABASE IF EXISTS {db_name}")
                cursor.execute(f"DROP USER IF EXISTS '{username}'@'%';")
                cursor.execute("FLUSH PRIVILEGES")
                cursor.execute(
                    "UPDATE users SET db = 0 WHERE username = %s", (username,)
                )
                cursor.execute(
                    "UPDATE users SET req_db = 0 WHERE username = %s", (username,)
                )
                conn.commit()
                return jsonify({"message": "Updated Containers Success"}), 200
        else:
            return jsonify({"error": "Permission Denied Admin Only"}), 403
    except Exception as e:
        print("Change Max Container Error:", e)
        return jsonify({"error": "Failed to fetch data"}), 500
    finally:
        if conn:
            conn.close()

# Run the Flask app on host
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)