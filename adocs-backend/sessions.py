"""Persistent login sessions and single-use password recovery challenges."""

import hashlib
import ipaddress
import math
import os
import re
from datetime import datetime, timedelta, timezone
from pathlib import Path

from flask import Blueprint, g, jsonify, request
from flask_jwt_extended import get_jwt, get_jwt_identity, jwt_required
from werkzeug.exceptions import ServiceUnavailable

OTP_RESEND_COOLDOWN = 60


def otp_retry_after(challenge, now=None):
    remaining = (challenge["created_at"] + timedelta(seconds=OTP_RESEND_COOLDOWN)
                 - (now or utcnow())).total_seconds()
    return max(0, math.ceil(remaining))


def utcnow():
    # MySQL DATETIME is timezone-free; all stored timestamps are UTC.
    return datetime.now(timezone.utc).replace(tzinfo=None)


def token_hash(payload):
    return hashlib.sha256(payload["jti"].encode()).hexdigest()


def client_ip():
    trusted = [ipaddress.ip_network(value.strip()) for value in os.getenv(
        "TRUSTED_PROXY_CIDRS", "127.0.0.0/8,::1/128,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16"
    ).split(",") if value.strip()]

    def parse(value):
        try:
            return ipaddress.ip_address(value.strip())
        except ValueError:
            return None

    peer = parse(request.remote_addr or "")
    if peer and any(peer in network for network in trusted):
        forwarded = request.headers.get("X-Forwarded-For", "").split(",")
        for value in reversed(forwarded):
            candidate = parse(value)
            if candidate is None:
                continue
            peer = candidate
            if not any(peer in network for network in trusted):
                break
    return str(peer) if peer else "Unknown"


def client_metadata():
    agent = request.headers.get("User-Agent", "")[:512]
    browser = "Unknown browser"
    for pattern, name in [
        (r"Edg(?:A|iOS)?/([\d.]+)", "Edge"),
        (r"OPR/([\d.]+)", "Opera"),
        (r"SamsungBrowser/([\d.]+)", "Samsung Internet"),
        (r"(?:Firefox|FxiOS)/([\d.]+)", "Firefox"),
        (r"(?:Chrome|CriOS)/([\d.]+)", "Chrome"),
        (r"Version/([\d.]+).*Safari/", "Safari"),
    ]:
        match = re.search(pattern, agent)
        if match:
            browser = f"{name} {match.group(1)}"[:128]
            break
    if "iPad" in agent or ("Macintosh" in agent and "Mobile" in agent):
        device, system = "iPad / Tablet", "iPadOS"
    elif "iPhone" in agent:
        device, system = "iPhone / Mobile", "iOS"
    elif "Android" in agent:
        device, system = ("Android / Mobile" if "Mobile" in agent else "Android / Tablet"), "Android"
    elif "Windows" in agent:
        device, system = "Desktop", "Windows"
    elif "Macintosh" in agent:
        device, system = "Mac", "macOS"
    elif "CrOS" in agent:
        device, system = "Chromebook", "ChromeOS"
    elif "Linux" in agent:
        device, system = "Desktop", "Linux"
    else:
        device, system = "Unknown device", "Unknown OS"
    return client_ip(), agent, browser, device, system


def iso_timestamp(value):
    return value.isoformat(timespec="seconds") + "Z" if value else None


def session_presence(session, now):
    active = session["revoked_at"] is None and session["expires_at"] > now
    online = active and session["last_seen_at"] >= now - timedelta(minutes=2)
    return {"status": "online" if online else "offline", "can_revoke": active}


class SessionStore:
    def __init__(self, get_connection):
        self.get_connection = get_connection

    def initialize(self):
        conn = self.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(Path(__file__).with_name("migrations").joinpath("001_sessions.sql").read_text())
                self.cleanup_logins(cursor)
            conn.commit()
        finally:
            conn.close()

    def create(self, cursor, payload, user_id, otp_hash=None):
        now = utcnow()
        if payload["purpose"] == "login":
            self.cleanup_logins(cursor, now)
        cursor.execute(
            """INSERT INTO sessions
               (id, user_id, kind, token_hash, otp_hash, ip_address, user_agent,
                browser, device, os, created_at, last_seen_at, expires_at)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
            (payload["sid"], user_id, payload["purpose"], token_hash(payload), otp_hash,
             *client_metadata(), now, now,
             datetime.fromtimestamp(payload["exp"], timezone.utc).replace(tzinfo=None)),
        )

    def cleanup_logins(self, cursor, now=None):
        cursor.execute(
            "DELETE FROM sessions WHERE kind = 'login' AND (expires_at <= %s OR revoked_at IS NOT NULL)",
            (now or utcnow(),),
        )

    def revoke_user(self, cursor, user_id, kind=None):
        if kind in (None, "login"):
            cursor.execute("DELETE FROM sessions WHERE user_id = %s AND kind = 'login'", (user_id,))
        if kind in (None, "otp"):
            cursor.execute(
                "UPDATE sessions SET revoked_at = %s, otp_hash = NULL WHERE user_id = %s AND kind = 'otp' AND revoked_at IS NULL",
                (utcnow(), user_id),
            )

    def validate(self, payload):
        purpose = payload.get("purpose")
        if purpose not in ("login", "otp") or not payload.get("sid"):
            return None
        # Recovery JWTs cannot authorize ordinary APIs, even for admin accounts.
        if purpose == "otp" and request.endpoint not in ("forgot_repassword", "resend_otp", "sessions.otp_status"):
            return None
        conn = self.get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """SELECT s.*, u.username, u.role, u.status AS user_status
                       FROM sessions s JOIN users u ON u.id = s.user_id
                       WHERE s.id = %s AND s.token_hash = %s AND s.user_id = %s
                         AND s.kind = %s AND s.revoked_at IS NULL AND s.expires_at > %s""",
                    (payload["sid"], token_hash(payload), payload["sub"], purpose, utcnow()),
                )
                session = cursor.fetchone()
                if not session or session["user_status"] == "DELETING":
                    return None
                if purpose == "login":
                    if session["role"] != payload.get("role") or session["username"] != payload.get("username"):
                        return None
                    now = utcnow()
                    if request.endpoint == "sessions.current_session" or session["last_seen_at"] < now - timedelta(seconds=60):
                        cursor.execute(
                            "UPDATE sessions SET last_seen_at = %s WHERE id = %s AND revoked_at IS NULL",
                            (now, session["id"]),
                        )
                        conn.commit()
                return session
        finally:
            conn.close()


def register_sessions(app, jwt, get_connection):
    store = SessionStore(get_connection)
    store.initialize()
    routes = Blueprint("sessions", __name__)

    @jwt.token_in_blocklist_loader
    def check_session(_header, payload):
        try:
            g.auth_session = store.validate(payload)
            return g.auth_session is None
        except Exception:
            app.logger.exception("Unable to verify session")
            raise ServiceUnavailable("Unable to verify session. Please try again.")

    @app.errorhandler(ServiceUnavailable)
    def session_unavailable(error):
        return jsonify({"error": error.description}), 503

    @jwt.revoked_token_loader
    def revoked_session(_header, _payload):
        return jsonify({"error": "Session expired or revoked. Please sign in again."}), 401

    @jwt.expired_token_loader
    def expired_session(_header, _payload):
        return jsonify({"error": "Session expired. Please sign in again."}), 401

    @routes.get("/api/auth/session")
    @jwt_required()
    def current_session():
        return jsonify({"id": g.auth_session["id"], "role": g.auth_session["role"]})

    @routes.get("/api/auth/otp-session")
    @jwt_required()
    def otp_status():
        if get_jwt()["purpose"] != "otp":
            return jsonify({"error": "Invalid recovery session"}), 403
        return jsonify({"valid": True, "retry_after": otp_retry_after(g.auth_session),
                        "expires_at": iso_timestamp(g.auth_session["expires_at"])})

    @routes.delete("/api/auth/logout")
    @jwt_required()
    def logout():
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "DELETE FROM sessions WHERE id = %s AND user_id = %s AND kind = 'login'",
                    (get_jwt()["sid"], get_jwt_identity()),
                )
            conn.commit()
            return jsonify({"message": "Logout successful."})
        except Exception:
            conn.rollback()
            app.logger.exception("Unable to log out session")
            return jsonify({"error": "Unable to log out. Please try again."}), 503
        finally:
            conn.close()

    @routes.get("/api/sessions")
    @jwt_required()
    def list_sessions():
        if get_jwt().get("role") != "admin":
            return jsonify({"error": "Permission Denied Admin Only"}), 403
        conn = get_connection()
        try:
            now = utcnow()
            with conn.cursor() as cursor:
                store.cleanup_logins(cursor, now)
                # Only select display fields: never expose OTP hashes or token hashes.
                cursor.execute(
                    """SELECT s.id, s.user_id, u.username, u.email, u.role,
                              s.ip_address, s.user_agent, s.browser, s.device, s.os,
                              s.created_at, s.last_seen_at, s.expires_at, s.revoked_at
                       FROM sessions s JOIN users u ON u.id = s.user_id
                       WHERE s.kind = 'login'
                         AND (u.status IS NULL OR u.status <> 'DELETING')
                       ORDER BY u.username, s.last_seen_at DESC""",
                )
                records = cursor.fetchall()
            conn.commit()
            for record in records:
                record.update(session_presence(record, now))
                record["user_id"] = str(record["user_id"])
                record["is_current"] = record["id"] == get_jwt()["sid"]
                for field in ("created_at", "last_seen_at", "expires_at", "revoked_at"):
                    record[field] = iso_timestamp(record[field])
            return jsonify(records)
        except Exception:
            app.logger.exception("Unable to list sessions")
            return jsonify({"error": "Unable to load sessions"}), 503
        finally:
            conn.close()

    @routes.delete("/api/sessions/<session_id>")
    @jwt_required()
    def revoke_session(session_id):
        if get_jwt().get("role") != "admin":
            return jsonify({"error": "Permission Denied Admin Only"}), 403
        conn = get_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id FROM sessions WHERE id = %s AND kind = 'login' FOR UPDATE", (session_id,))
                session = cursor.fetchone()
                if not session:
                    return jsonify({"error": "Session not found"}), 404
                cursor.execute(
                    "DELETE FROM sessions WHERE id = %s AND kind = 'login'",
                    (session_id,),
                )
            conn.commit()
            return jsonify({"message": "Session closed.", "is_current": session_id == get_jwt()["sid"]})
        except Exception:
            conn.rollback()
            app.logger.exception("Unable to revoke session")
            return jsonify({"error": "Unable to close session"}), 503
        finally:
            conn.close()

    app.register_blueprint(routes)
    return store
