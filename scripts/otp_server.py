#!/usr/bin/env python3
"""
Péthar OTP Email Dispatch Service
Sends verification codes to users directly via Gmail SMTP (smtp.gmail.com:465 SSL)
Provides an HTTP endpoint accessible from:
- Web app (localhost:3001)
- Android Emulator (10.0.2.2:3001)
"""

import json
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from http.server import BaseHTTPRequestHandler, HTTPServer

PORT = int(os.getenv("OTP_SERVER_PORT", "3001"))
GMAIL_SENDER = os.getenv("GMAIL_SENDER", "realjackhalder@gmail.com")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "ympywnzodbshtzoe").replace(" ", "")


def send_email_via_gmail(recipient: str, code: str, purpose: str = "SIGN_UP") -> dict:
    """Sends an OTP email via Gmail SMTP SSL."""
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
            self.send_response(200)
            self._send_cors_headers()
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"status": "ok", "sender": GMAIL_SENDER, "provider": "gmail"}).encode("utf-8"))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        if self.path == "/api/send-otp":
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            try:
                data = json.loads(body_bytes.decode("utf-8"))
            except Exception:
                data = {}

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
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        print(f"[OTP-Server] {self.address_string()} - {args[0]}")


def run_server():
    server_address = ("0.0.0.0", PORT)
    httpd = HTTPServer(server_address, OtpHandler)
    print(f"🚀 Péthar OTP Email Server running on http://0.0.0.0:{PORT}...")
    print(f"   Provider: Gmail SMTP (smtp.gmail.com:465 SSL)")
    print(f"   Sender: {GMAIL_SENDER}")
    httpd.serve_forever()


if __name__ == "__main__":
    run_server()
