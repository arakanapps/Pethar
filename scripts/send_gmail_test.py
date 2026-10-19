import os
import smtplib
import sys
from email.mime.text import MIMEText

sender_email = os.getenv("GMAIL_SENDER", "realjackhalder@gmail.com")
app_password = os.getenv("GMAIL_APP_PASSWORD", "ympy wnzo dbsh tzoe").replace(" ", "")
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
