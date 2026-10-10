## Requirements

- Python 3.x
- pip

## Login sessions and OTP storage

The backend creates a fourth table, `sessions`, on startup using
`migrations/001_sessions.sql`. Creation is idempotent and does not modify the
three existing tables. The database account needs `CREATE TABLE` permission;
alternatively, apply the SQL to `DB_NAME` with a migration account before starting
the new backend. Rebuild and restart both backend and frontend containers for
this change. Existing JWTs must sign in again because they have no stored session.

- Each login creates an independent session that lasts four hours. Logout and
  admin revocation delete the login session row from MySQL and apply to every
  protected backend API. Login session history is not retained. Expired and
  previously revoked login rows are removed on startup, login and session refresh.
- Password recovery creates a five-minute `otp` session. Only a salted bcrypt
  hash is stored; the JWT contains a challenge ID, never the OTP. Challenges are
  single use, replaced on resend, and revoked after five incorrect attempts.
  Successful password recovery also revokes the account's existing logins.
  The reset form can resend through `POST /api/auth/resend` using the recovery
  cookie, without entering the account again. Sending replaces both the OTP and
  JWT with a fresh five-minute challenge. The backend enforces a 60-second wait
  per account and a limit of three resends per hour. The JWT and database challenge
  must both be valid; once the recovery session expires, start again at `/forgot`.
- Admins open `/sessions` to expand users into device rows, search by user, IP or
  browser, and close one session. Logged-out, closed and expired sessions disappear
  from the list. A device is Online only while its token is valid and it has activity
  within the last two minutes. A user is Online if any device is Online.
  The page refreshes every 30 seconds. Visible
  workspace tabs check their session every 30 seconds and on focus, so a revoked
  device returns to login. API access stops on the next request.
- All stored timestamps are UTC; the UI formats them in the viewer's timezone.
  Token validity and presence are separate: an inactive device can be Offline
  while its token is still valid, and administrators can still close that session.
  Device and browser names are inferred from User-Agent, and each login gets a
  separate row, including multiple logins from the same physical device.
- Set `TRUSTED_PROXY_CIDRS` to a comma-separated list of the actual reverse proxy
  and frontend networks. The default trusts loopback and private Docker/LAN
  ranges. Public peers cannot supply trusted forwarding headers; trusted proxy
  chains are inspected from right to left. The ingress proxy must append or
  overwrite `X-Forwarded-For`, and direct access to backend ports should be private.

Run the auth integration tests without Docker or email delivery:

```bash
python -m unittest discover -s tests -v
```

These tests run real Flask routes using an isolated SQLite adapter. Validate the
migration and concurrent InnoDB row locking against MySQL in the Docker environment.

## Installation & Setup

Follow the steps below to set up the project locally:

1. Create a Virtual Environtment

```bash
py -3 -m venv .venv

or

python -m venv .venv
```

2. Activate the Virtual Environtment

Windows:

```bash
.venv\Scripts\activate
```

Mac/Linux:

```bash
source .venv/bin/activate
```

3. Install Dependencies

```bash
pip install -r requirements.txt
```

---

### Running the Application

Start the Flask server with:

1. app.py

```bash
python app.py
```

2. Celery
```bash
celery -A tasks worker --loglevel=info --pool=solo
```
3. Redis
```bash
docker run -d --name redis-server -p 6379:6379 redis
```

Once running, the app will typically be available at:

```bash
http://127.0.0.1:5000/
```
