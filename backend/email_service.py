import os

from dotenv import load_dotenv
import resend

# Load the backend .env file before reading email settings.
load_dotenv()

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "").strip()

EMAIL_FROM = os.getenv(
    "EMAIL_FROM",
    "onboarding@resend.dev"
)


def send_email(to, subject, html):
    if not RESEND_API_KEY:
        print("EMAIL ERROR: RESEND_API_KEY is not configured.")
        return False

    try:
        resend.api_key = RESEND_API_KEY

        params = {
            "from": EMAIL_FROM,
            "to": [to],
            "subject": subject,
            "html": html,
        }

        result = resend.Emails.send(params)

        print(f"EMAIL SENT SUCCESSFULLY to {to}")
        print(f"Resend response: {result}")

        return True

    except Exception as error:
        print(f"EMAIL ERROR sending to {to}: {error}")
        return False


def send_password_reset_email(email, username, reset_url):
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f7f0f5;
        font-family: Arial, sans-serif;
        color: #382532;
    ">

        <div style="
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 35px;
        ">

            <h1 style="color: #6b3f5f;">
                Reset Your Password
            </h1>

            <p>Hello {username},</p>

            <p>
                We received a request to reset the password
                for your Ecltat Vivyanne account.
            </p>

            <p>
                Click the button below to choose a new password.
            </p>

            <p style="text-align: center; margin: 30px 0;">
                <a href="{reset_url}" style="
                    display: inline-block;
                    background-color: #6b3f5f;
                    color: #ffffff;
                    padding: 14px 25px;
                    border-radius: 8px;
                    text-decoration: none;
                    font-weight: bold;
                ">
                    Reset My Password
                </a>
            </p>

            <p>
                This password reset link will expire after
                <strong>1 hour</strong>.
            </p>

            <p>
                If you did not request a password reset,
                you can safely ignore this email.
            </p>

            <hr style="
                border: none;
                border-top: 1px solid #ddcbd7;
                margin: 30px 0;
            ">

            <p style="
                color: #8a7886;
                font-size: 13px;
            ">
                Ecltat Vivyanne<br>
                This is an automated email.
            </p>

        </div>

    </body>
    </html>
    """

    return send_email(
        email,
        "Reset your Ecltat Vivyanne password",
        html
    )


def send_order_confirmation_email(
    email,
    username,
    order_id,
    total,
    location,
    mpesa_till,
    transaction_code
):
    html = f"""
    <!DOCTYPE html>
    <html>
    <body style="
        margin: 0;
        padding: 0;
        background-color: #f7f0f5;
        font-family: Arial, sans-serif;
        color: #382532;
    ">

        <div style="
            max-width: 600px;
            margin: 40px auto;
            background: #ffffff;
            border-radius: 12px;
            padding: 35px;
        ">

            <h1 style="color: #6b3f5f;">
                Order Confirmed
            </h1>

            <p>Hello {username},</p>

            <p>
                Thank you for your order with Ecltat Vivyanne.
                Your order has been received successfully.
            </p>

            <div style="
                background: #f7f0f5;
                padding: 20px;
                border-radius: 8px;
                margin: 25px 0;
            ">

                <p>
                    <strong>Order Number:</strong> #{order_id}
                </p>

                <p>
                    <strong>Total:</strong> KSh {total:,.2f}
                </p>

                <p>
                    <strong>Delivery Location:</strong> {location}
                </p>

                <p>
                    <strong>M-Pesa Till:</strong> {mpesa_till}
                </p>

                <p>
                    <strong>Transaction Code:</strong>
                    {transaction_code or "Not provided"}
                </p>

            </div>

            <p>
                We will process your order and keep you updated
                about its status.
            </p>

            <hr style="
                border: none;
                border-top: 1px solid #ddcbd7;
                margin: 30px 0;
            ">

            <p style="
                color: #8a7886;
                font-size: 13px;
            ">
                Ecltat Vivyanne<br>
                Thank you for shopping with us.
            </p>

        </div>

    </body>
    </html>
    """

    return send_email(
        email,
        f"Ecltat Vivyanne Order #{order_id} Confirmation",
        html
    )
