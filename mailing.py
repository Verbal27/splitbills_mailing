import os
import requests
from schema import ContactForm
from dotenv import load_dotenv


load_dotenv()


def send_email(form: ContactForm):
    response = requests.post(
        "https://api.resend.com/emails",
        headers={"Authorization": f"Bearer {os.getenv('RESEND_API_KEY')}"},
        json={
            "from": "portfolio@splitbills.org",
            "to": "ionganea@splitbills.org",
            "subject": f"New message from {form.name}",
            "reply_to": form.email,
            "text": f"Name: {form.name}\nEmail: {form.email}\n\n{form.message}",
        },
    )
    response.raise_for_status()
