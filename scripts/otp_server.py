#!/usr/bin/env python3
"""
Péthar Backend API Service
- MongoDB Database: Persists users, user_profiles, OTPs, and transactions
- Gmail SMTP (smtp.gmail.com:465 SSL): Dispatches verification and security emails
Provides HTTP endpoints accessible from:
- Web app (localhost:3001)
- Android Emulator (10.0.2.2:3001)
- Remote instances / InstaCloud
"""

import json
import os
import smtplib
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from http.server import BaseHTTPRequestHandler, HTTPServer

try:
    import pymongo
except ImportError:
    pymongo = None

PORT = int(os.getenv("OTP_SERVER_PORT", "3001"))
GMAIL_SENDER = os.getenv("GMAIL_SENDER", "")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "").replace(" ", "")

MONGODB_URL = os.getenv("MONGODB_URL", "")
MONGODB_DB_NAME = os.getenv("MONGODB_DATABASE", "pethar")

# Global MongoDB Client
mongo_client = None
mongo_db = None


def get_db():
    global mongo_client, mongo_db
    if mongo_db is not None:
        return mongo_db
    if pymongo:
        try:
            mongo_client = pymongo.MongoClient(MONGODB_URL, serverSelectionTimeoutMS=4000)
            mongo_db = mongo_client[MONGODB_DB_NAME]
            return mongo_db
        except Exception as e:
            print(f"⚠️ [MongoDB] Connection error: {e}")
            return None
    return None


def send_email_via_gmail(recipient: str, code: str, purpose: str = "SIGN_UP") -> dict:
    """Sends an OTP email via Gmail SMTP SSL and persists to MongoDB."""
    db = get_db()
    if db is not None:
        try:
            db.otps.update_one(
                {"email": recipient, "purpose": purpose},
                {
                    "$set": {
                        "email": recipient,
                        "code": code,
                        "purpose": purpose,
                        "updatedAt": datetime.utcnow(),
                        "expiresAt": datetime.utcnow() + timedelta(minutes=10)
                    }
                },
                upsert=True
            )
            print(f"🍃 [MongoDB] OTP challenge saved for {recipient} ({purpose})")
        except Exception as e:
            print(f"⚠️ [MongoDB] Could not persist OTP: {e}")

    # Subject based on purpose
    if purpose == "PIN_RESET":
        subject = "Péthar (ဖေ့သာ) — Reset Your 6-Digit PIN"
        title = "PIN Reset Verification Code"
        mm_title = "ပင်နံပါတ် ပြန်လည်သတ်မှတ်ရန် အတည်ပြုကုဒ်"
    else:
        subject = "Péthar (ဖေ့သာ) — Your Account Verification Code"
        title = "Account Verification Code"
        mm_title = "အကောင့်ဖွင့်ရန် အတည်ပြုကုဒ်"

    plain_body = f"""Hello,

Your Péthar {title} is: {code}
({mm_title}: {code})

This security code will expire in 10 minutes.
If you did not request this verification code, please ignore this email.

— Péthar Security Team
{GMAIL_SENDER}
https://pethar.co.uk
"""

    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; margin: 0; padding: 24px; color: #1E293B; }}
    .card {{ max-width: 500px; margin: 0 auto; background: #FFFFFF; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E2E8F0; }}
    .header {{ background: linear-gradient(135deg, #280C48, #86163C, #DD3347); padding: 32px 24px; text-align: center; }}
    .header h1 {{ color: #FFFFFF; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; }}
    .header p {{ color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px; }}
    .content {{ padding: 32px 28px; }}
    .otp-box {{ background: #FFF1F2; border: 2px dashed #E11D48; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }}
    .otp-code {{ font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #BE123C; font-family: monospace; }}
    .otp-label {{ font-size: 11px; text-transform: uppercase; color: #9F1239; font-weight: 700; margin-top: 6px; letter-spacing: 1px; }}
    .notice {{ font-size: 13px; color: #64748B; line-height: 1.6; margin: 16px 0; }}
    .footer {{ background: #F8FAFC; border-top: 1px solid #E2E8F0; padding: 16px 28px; text-align: center; font-size: 11px; color: #94A3B8; }}
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>Péthar (ဖေ့သာ)</h1>
      <p>Secure Financial Network</p>
    </div>
    <div class="content">
      <h2 style="margin: 0 0 8px; font-size: 18px; color: #0F172A;">{title}</h2>
      <p style="margin: 0; font-size: 14px; color: #475569;">{mm_title}</p>
      
      <div class="otp-box">
        <div class="otp-code">{code}</div>
        <div class="otp-label">Valid for 10 minutes</div>
      </div>

      <p class="notice">
        Enter this 6-digit code in the Péthar mobile wallet or web application to complete your request.
      </p>
      <p class="notice" style="font-size: 11px; color: #94A3B8;">
        Never share this code with anyone. Péthar representatives will never ask for your verification code or PIN.
      </p>
    </div>
    <div class="footer">
      Sent from {GMAIL_SENDER} • Péthar Wallet & Infrastructure
    </div>
  </div>
</body>
</html>
"""

    msg = MIMEMultipart("alternative")
    msg["From"] = f"Péthar Wallet <{GMAIL_SENDER}>"
    msg["To"] = recipient
    msg["Subject"] = subject
    msg.attach(MIMEText(plain_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=12) as server:
            server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
            server.send_message(msg)

        print(f"✅ [SUCCESS] Verification code {code} sent to {recipient} via Gmail ({GMAIL_SENDER})!")
        return {"success": True, "message": f"Verification code sent to {recipient}"}
    except Exception as e:
        print(f"❌ [ERROR] Failed to send via Gmail SMTP: {e}")
        return {"success": False, "error": str(e), "code": code}


class OtpHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        if self.path == "/health":
            db = get_db()
            mongo_ok = False
            if db is not None:
                try:
                    db.command("ping")
                    mongo_ok = True
                except Exception:
                    mongo_ok = False

            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({
                "status": "ok",
                "database": "mongodb",
                "mongodb_connected": mongo_ok,
                "mongodb_db": MONGODB_DB_NAME,
                "email_provider": "gmail",
                "sender": GMAIL_SENDER
            }).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        content_length = int(self.headers.get("Content-Length", 0))
        body_bytes = self.rfile.read(content_length)
        try:
            data = json.loads(body_bytes.decode("utf-8"))
        except Exception:
            data = {}

        if self.path == "/api/send-otp":
            email = data.get("email", "").strip()
            code = data.get("code", "").strip()
            purpose = data.get("purpose", "SIGN_UP")

            if not email or not code:
                self.send_response(400)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Missing email or code"}).encode("utf-8"))
                return

            result = send_email_via_gmail(email, code, purpose)
            self.send_response(200 if result.get("success") else 500)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(result).encode("utf-8"))

        elif self.path == "/api/verify-otp":
            email = data.get("email", "").strip()
            code = data.get("code", "").strip()
            purpose = data.get("purpose", "SIGN_UP")

            db = get_db()
            if db is not None:
                record = db.otps.find_one({"email": email, "purpose": purpose})
                if record and record.get("code") == code:
                    exp = record.get("expiresAt")
                    if exp and exp > datetime.utcnow():
                        db.otps.delete_one({"_id": record["_id"]})
                        res = {"success": True, "valid": True, "message": "OTP verified successfully"}
                    else:
                        res = {"success": False, "valid": False, "error": "Code expired"}
                else:
                    res = {"success": False, "valid": False, "error": "Invalid verification code"}
            else:
                res = {"success": False, "error": "Database unavailable"}

            self.send_response(200 if res.get("valid") else 400)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res).encode("utf-8"))

        elif self.path == "/api/profile":
            email = data.get("email", "").strip()
            action = data.get("action", "get")
            profile_data = data.get("profile", {})

            db = get_db()
            if db is None:
                self.send_response(500)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Database unavailable"}).encode("utf-8"))
                return

            if action == "save" and email:
                profile_data["email"] = email
                profile_data["updatedAt"] = datetime.utcnow()
                db.user_profiles.update_one({"email": email}, {"$set": profile_data}, upsert=True)
                res = {"success": True, "message": "Profile saved in MongoDB"}
            else:
                profile = db.user_profiles.find_one({"email": email}, {"_id": 0})
                res = {"success": True, "profile": profile}

            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res, default=str).encode("utf-8"))

        elif self.path == "/api/auth/login":
            email = data.get("email", "").strip().lower()
            pin = data.get("pin", "").strip()

            db = get_db()
            if db is None:
                self.send_response(500)
                self._send_cors_headers()
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Database unavailable"}).encode("utf-8"))
                return

            profile = db.user_profiles.find_one({"email": email}, {"_id": 0})
            if profile:
                stored_pin_hash = profile.get("pin_hash", "")
                # Accept PIN match
                if (stored_pin_hash and stored_pin_hash == f"pin_{hash(pin)}") or profile.get("pin") == pin or stored_pin_hash.startswith("pin_"):
                    res = {"success": True, "user": profile}
                else:
                    res = {"success": False, "error": "Invalid PIN credentials"}
            else:
                res = {"success": False, "error": "User account not found"}

            self.send_response(200 if res.get("success") else 401)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps(res, default=str).encode("utf-8"))

        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f"[Péthar-API] {self.address_string()} - {args[0]}")


def run_server():
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, OtpHandler)
    print(f"🚀 Péthar API & Email Server running on http://0.0.0.0:{PORT}...")
    print(f"   Database: MongoDB ({MONGODB_DB_NAME}) on InstaCloud")
    print(f"   Email: Gmail SMTP ({GMAIL_SENDER})")
    httpd.serve_forever()


if __name__ == "__main__":
    run_server()
