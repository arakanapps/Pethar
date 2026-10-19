import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

# Gmail SMTP Configuration
GMAIL_SENDER = os.getenv("GMAIL_SENDER", "realjackhalder@gmail.com")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", "ympywnzodbshtzoe").replace(" ", "")


def send_verification_code(recipient_email: str, auth_code: str) -> bool:
    """Send an OTP verification code via Gmail SMTP."""
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

    to_addr = sys.argv[1] if len(sys.argv) > 1 else "realjackhalder@gmail.com"
    code = sys.argv[2] if len(sys.argv) > 2 else "582194"
    send_verification_code(to_addr, code)
