import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Gmail SMTP Configuration
GMAIL_SENDER = os.getenv("GMAIL_SENDER")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "").replace(" ", "")


def send_verification_code(recipient_email: str, auth_code: str) -> bool:
    """Send an OTP verification code via Gmail SMTP."""
    if not GMAIL_SENDER or not GMAIL_APP_PASSWORD:
        raise RuntimeError("GMAIL_SENDER and GMAIL_APP_PASSWORD must be configured in the runtime environment.")

    msg = MIMEMultipart("alternative")
    msg["From"] = f"Péthar Wallet <{GMAIL_SENDER}>"
    msg["To"] = recipient_email
    msg["Subject"] = "Péthar (ဖေ့သာ) — Your Verification Code"

    # Plain text version
    body = (
        f"Hello,\n\n"
        f"Your Péthar security verification code is: {auth_code}\n\n"
        f"This code will expire in 10 minutes.\n"
        f"If you did not request this verification code, please ignore this email.\n\n"
        f"— Péthar Security Team\n"
        f"{GMAIL_SENDER}\n"
    )
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as server:
            server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
            server.send_message(msg)
        print(f"✅ Code successfully sent to {recipient_email} from {GMAIL_SENDER}")
        return True
    except Exception as e:
        print(f"❌ Failed to send email via Gmail SMTP: {e}")
        return False


if __name__ == "__main__":
    import sys

    if len(sys.argv) < 3:
        raise SystemExit("Usage: send_verification_email.py <recipient-email> <verification-code>")
    to_addr = sys.argv[1]
    code = sys.argv[2]
    send_verification_code(to_addr, code)
