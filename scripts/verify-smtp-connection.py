import os
import smtplib
import sys
from email.mime.text import MIMEText

# Auto-load .env if available
_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
if os.path.exists(_env_path):
    with open(_env_path, "r", encoding="utf-8") as _f:
        for _line in _f:
            _line = _line.strip()
            if _line and not _line.startswith("#") and "=" in _line:
                _k, _v = _line.split("=", 1)
                os.environ.setdefault(_k.strip(), _v.strip().strip('"').strip("'"))

sender_email = os.getenv("GMAIL_SENDER", "pethar.wallet@gmail.com")
app_password = os.getenv("GMAIL_APP_PASSWORD", "").replace(" ", "")
recipient_email = sys.argv[1] if len(sys.argv) > 1 else sender_email

msg = MIMEText("This is the body of your email sent from Péthar via Gmail SMTP.")
msg["Subject"] = "Hello from Péthar code!"
msg["From"] = sender_email
msg["To"] = recipient_email

try:
    # Connect to Gmail SMTP server
    with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
        server.login(sender_email, app_password)
        server.sendmail(sender_email, recipient_email, msg.as_string())
    print("Email sent successfully!")
except Exception as e:
    print(f"Error: {e}")
