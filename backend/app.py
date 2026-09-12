from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity,
)
from werkzeug.security import generate_password_hash, check_password_hash

from database import db
from models import User, Service, Booking

import json
import os
import base64
import urllib.request
import urllib.error
import secrets
import hashlib
import smtplib

from email.message import EmailMessage
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import text, inspect


# ============================================================
# LOAD ENVIRONMENT VARIABLES
# ============================================================

try:
    from dotenv import load_dotenv

    load_dotenv()

except ImportError:
    print("python-dotenv is not installed.")
    print("Install it with: pip install python-dotenv")


# ============================================================
# APPLICATION
# ============================================================

app = Flask(__name__)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "sqlite:///service.db"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


# ============================================================
# JWT CONFIGURATION
# ============================================================

app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "change-this-secret-key-in-production"
)

app.config["JWT_TOKEN_LOCATION"] = ["headers"]

app.config["JWT_HEADER_NAME"] = "Authorization"

app.config["JWT_HEADER_TYPE"] = "Bearer"


# ============================================================
# CORS
# ============================================================

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
                "https://ramon-services-1.onrender.com",

                os.getenv("FRONTEND_URL", ""),
            ],
            "methods": [
                "GET",
                "POST",
                "PUT",
                "DELETE",
                "OPTIONS",
            ],
            "allow_headers": [
                "Content-Type",
                "Authorization",
            ],
            "expose_headers": [
                "Content-Type",
            ],
        }
    },
    supports_credentials=True,
)


# ============================================================
# INITIALIZE EXTENSIONS
# ============================================================

db.init_app(app)

jwt = JWTManager(app)


# ============================================================
# JWT ERROR HANDLERS
# ============================================================

@jwt.unauthorized_loader
def unauthorized_callback(error):

    print("======================================")
    print("JWT UNAUTHORIZED")
    print("ERROR:", error)
    print("======================================")

    return jsonify({
        "message": "Authentication required. Please log in again.",
        "error": str(error),
    }), 401


@jwt.invalid_token_loader
def invalid_token_callback(error):

    print("======================================")
    print("JWT INVALID TOKEN")
    print("ERROR:", error)
    print("======================================")

    return jsonify({
        "message": "Invalid authentication token. Please log in again.",
        "error": str(error),
    }), 401


@jwt.expired_token_loader
def expired_token_callback(jwt_header, jwt_payload):

    print("======================================")
    print("JWT EXPIRED")
    print("PAYLOAD:", jwt_payload)
    print("======================================")

    return jsonify({
        "message": "Your session has expired. Please log in again.",
    }), 401


@jwt.revoked_token_loader
def revoked_token_callback(jwt_header, jwt_payload):

    return jsonify({
        "message": "Your authentication token has been revoked.",
    }), 401


@jwt.needs_fresh_token_loader
def needs_fresh_token_callback(jwt_header, jwt_payload):

    return jsonify({
        "message": "A fresh authentication token is required.",
    }), 401


@jwt.token_verification_failed_loader
def token_verification_failed_callback(
    jwt_header,
    jwt_payload
):

    return jsonify({
        "message": "Token verification failed.",
    }), 401


# ============================================================
# CATEGORY NAMES
# ============================================================

CATEGORY_NAMES = {

    # CLEANING
    101: "House Cleaning",
    102: "Office Cleaning",
    103: "Window Cleaning",
    104: "Carpet Cleaning",
    105: "Sofa Cleaning",

    # LAUNDRY
    201: "Wash & Fold",
    202: "Ironing",
    203: "Dry Cleaning",

    # PLUMBING
    301: "Leak Repair",
    302: "Blocked Drain",
    303: "Pipe Installation",

    # ELECTRICAL
    401: "Electrical Repair",
    402: "Socket Installation",
    403: "Lighting Installation",

    # GARDEN
    501: "Lawn Maintenance",
    502: "Garden Cleaning",
    503: "Landscaping",

    # PAINTING
    601: "Interior Painting",
    602: "Exterior Painting",
    603: "Room Painting",

    # MOVING
    701: "House Moving",
    702: "Office Moving",
    703: "Packing Service",
}


def get_category_name(category_id):

    try:

        return CATEGORY_NAMES.get(
            int(category_id),
            str(category_id)
        )

    except (TypeError, ValueError):

        if category_id is None:
            return "Unknown Category"

        return str(category_id)


# ============================================================
# AUTHENTICATION HELPER
# ============================================================

def get_current_user():

    identity = get_jwt_identity()

    print("====================================")
    print("JWT IDENTITY:", identity)
    print("JWT IDENTITY TYPE:", type(identity))
    print("====================================")

    if not identity:
        return None

    if isinstance(identity, dict):
        user_id = identity.get("id")
    else:
        user_id = identity

    print("USER ID FROM JWT:", user_id)

    if not user_id:
        return None

    try:
        user_id = int(user_id)
    except (TypeError, ValueError):
        return None

    user = db.session.get(User, user_id)

    print("USER FOUND:", user)
    print("====================================")

    return user

# ============================================================
# ADMIN CHECK
# ============================================================

def admin_required():

    user = get_current_user()

    if not user:

        return None, (
            jsonify({
                "message":
                    "User not found. Please log in again.",
            }),
            404,
        )

    if str(user.role or "").lower() != "admin":

        return None, (
            jsonify({
                "message":
                    "Admin access required.",
            }),
            403,
        )

    return user, None


# ============================================================
# PARSE EXTRAS
# ============================================================

def parse_extras(extras_value):

    if not extras_value:
        return []

    if isinstance(extras_value, list):
        return extras_value

    try:

        parsed = json.loads(
            extras_value
        )

        if isinstance(parsed, list):
            return parsed

        return []

    except (
        json.JSONDecodeError,
        TypeError
    ):

        return []


# ============================================================
# PASSWORD RESET CONFIGURATION
# ============================================================

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
).rstrip("/")


try:

    RESET_TOKEN_MINUTES = int(
        os.getenv(
            "RESET_TOKEN_MINUTES",
            "30"
        )
    )

except ValueError:

    RESET_TOKEN_MINUTES = 30


SMTP_HOST = os.getenv(
    "SMTP_HOST",
    "smtp.gmail.com"
)

try:

    SMTP_PORT = int(
        os.getenv(
            "SMTP_PORT",
            "587"
        )
    )

except ValueError:

    SMTP_PORT = 587


SMTP_USERNAME = os.getenv(
    "SMTP_USERNAME",
    ""
)

SMTP_PASSWORD = os.getenv(
    "SMTP_PASSWORD",
    ""
)

SMTP_FROM_EMAIL = os.getenv(
    "SMTP_FROM_EMAIL",
    SMTP_USERNAME
)

SMTP_USE_TLS = (
    os.getenv(
        "SMTP_USE_TLS",
        "true"
    ).lower() == "true"
)


# ============================================================
# PASSWORD VALIDATION
# ============================================================

def validate_password(password):

    if not password:

        return "New password is required."

    if len(password) < 8:

        return (
            "Password must be at least "
            "8 characters long."
        )

    return None


# ============================================================
# CREATE RESET TOKEN
# ============================================================

def create_reset_token():

    return secrets.token_urlsafe(48)


# ============================================================
# HASH RESET TOKEN
# ============================================================

def hash_reset_token(token):

    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def send_password_reset_email(email, reset_link):

    print("")
    print("======================================")
    print("STARTING EMAIL SEND")
    print("======================================")

    print("Recipient:", email)
    print("SMTP Host:", SMTP_HOST)
    print("SMTP Port:", SMTP_PORT)
    print(
        "SMTP Username:",
        SMTP_USERNAME if SMTP_USERNAME else "NOT CONFIGURED"
    )
    print(
        "SMTP Password:",
        "CONFIGURED" if SMTP_PASSWORD else "NOT CONFIGURED"
    )

    # ------------------------------------------
    # NO SMTP CONFIGURATION
    # ------------------------------------------

    if not SMTP_USERNAME or not SMTP_PASSWORD:

        print("")
        print("SMTP EMAIL IS NOT CONFIGURED.")
        print("")
        print("USE THIS RESET LINK:")
        print(reset_link)
        print("")
        print("======================================")

        return False

    # ------------------------------------------
    # CREATE EMAIL
    # ------------------------------------------

    message = EmailMessage()

    message["Subject"] = (
        "Ramon's Marketplace - Password Reset"
    )

    message["From"] = (
        SMTP_FROM_EMAIL or SMTP_USERNAME
    )

    message["To"] = email

    message.set_content(
        f"""Hello,

A password reset was requested for your
Ramon's Marketplace account.

Click the link below to reset your password:

{reset_link}

This link expires in {RESET_TOKEN_MINUTES} minutes.

If you did not request this reset, you can ignore this email.

Regards,
Ramon's Marketplace
"""
    )

    # ------------------------------------------
    # CONNECT TO GMAIL
    # ------------------------------------------

    try:

        print("")
        print("Connecting to SMTP server...")

        with smtplib.SMTP(
            SMTP_HOST,
            SMTP_PORT,
            timeout=30
        ) as server:

            print("SMTP CONNECTION SUCCESSFUL")

            if SMTP_USE_TLS:

                print("Starting TLS...")

                server.starttls()

                print("TLS STARTED")

            print("Logging into Gmail...")

            server.login(
                SMTP_USERNAME,
                SMTP_PASSWORD
            )

            print("GMAIL LOGIN SUCCESSFUL")

            print("Sending email...")

            server.send_message(
                message
            )

            print("")
            print("======================================")
            print("EMAIL SENT SUCCESSFULLY")
            print("TO:", email)
            print("======================================")
            print("")

            return True

    except Exception as e:

        print("")
        print("======================================")
        print("EMAIL SENDING FAILED")
        print("ERROR TYPE:", type(e).__name__)
        print("ERROR:", str(e))
        print("======================================")
        print("")

        # Still show the link during development
        print("DEVELOPMENT RESET LINK:")
        print(reset_link)
        print("")

        raise


# ============================================================
# M-PESA CONFIGURATION
# ============================================================

MPESA_BASE_URL = os.getenv(
    "MPESA_BASE_URL",
    "https://sandbox.safaricom.co.ke"
).rstrip("/")


MPESA_CONSUMER_KEY = os.getenv(
    "MPESA_CONSUMER_KEY",
    ""
)


MPESA_CONSUMER_SECRET = os.getenv(
    "MPESA_CONSUMER_SECRET",
    ""
)


MPESA_SHORTCODE = os.getenv(
    "MPESA_SHORTCODE",
    ""
)


MPESA_PASSKEY = os.getenv(
    "MPESA_PASSKEY",
    ""
)


MPESA_CALLBACK_URL = os.getenv(
    "MPESA_CALLBACK_URL",
    ""
)


MPESA_ACCOUNT_REFERENCE = os.getenv(
    "MPESA_ACCOUNT_REFERENCE",
    "RAMONS-MARKETPLACE"
)


MPESA_TRANSACTION_DESCRIPTION = os.getenv(
    "MPESA_TRANSACTION_DESCRIPTION",
    "Ramon's Marketplace Booking"
)


# ============================================================
# USER DATABASE MIGRATION
# ============================================================

def ensure_user_columns():

    try:

        inspector = inspect(
            db.engine
        )

        tables = inspector.get_table_names()

        # ----------------------------------------------------
        # Your original SQLAlchemy User model normally creates
        # a table called "user".
        #
        # Some older versions may have "users".
        # Detect either one.
        # ----------------------------------------------------

        user_table = None

        if "user" in tables:

            user_table = "user"

        elif "users" in tables:

            user_table = "users"

        if not user_table:

            print(
                "User table does not exist yet."
            )

            return


        existing_columns = {

            column["name"]

            for column in inspector.get_columns(
                user_table
            )
        }


        columns_to_add = {

            "phone":
                "VARCHAR(20)",

            "reset_token_hash":
                "VARCHAR(128)",

            "reset_token_expires":
                "DATETIME",
        }


        added = []


        for (
            column_name,
            column_definition
        ) in columns_to_add.items():

            if column_name not in existing_columns:

                sql = text(
                    f"ALTER TABLE {user_table} "
                    f"ADD COLUMN {column_name} "
                    f"{column_definition}"
                )

                db.session.execute(
                    sql
                )

                added.append(
                    column_name
                )


        db.session.commit()


        if added:

            print(
                "USER DATABASE MIGRATION SUCCESSFUL:"
            )

            print(
                ", ".join(added)
            )

        else:

            print(
                "User database schema is already up to date."
            )


    except Exception as e:

        db.session.rollback()

        print(
            "USER DATABASE MIGRATION ERROR:",
            e
        )

        raise


# ============================================================
# BOOKING DATABASE MIGRATION
# ============================================================

def ensure_payment_columns():

    try:

        inspector = inspect(
            db.engine
        )

        tables = inspector.get_table_names()

        if "bookings" not in tables:

            print(
                "Bookings table does not exist yet."
            )

            return


        existing_columns = {

            column["name"]

            for column in inspector.get_columns(
                "bookings"
            )
        }


        columns_to_add = {

            "payment_status":
                "VARCHAR(30) DEFAULT 'Pending'",

            "payment_method":
                "VARCHAR(30)",

            "payment_phone":
                "VARCHAR(20)",

            "mpesa_receipt":
                "VARCHAR(100)",

            "checkout_request_id":
                "VARCHAR(150)",

            "merchant_request_id":
                "VARCHAR(150)",

            "payment_result_code":
                "VARCHAR(30)",

            "payment_result_description":
                "TEXT",

            "payment_paid_at":
                "DATETIME",

            "created_at":
                "DATETIME",
        }


        added = []


        for (
            column_name,
            column_definition
        ) in columns_to_add.items():

            if column_name not in existing_columns:

                sql = text(
                    f"ALTER TABLE bookings "
                    f"ADD COLUMN {column_name} "
                    f"{column_definition}"
                )

                db.session.execute(
                    sql
                )

                added.append(
                    column_name
                )


        db.session.commit()


        if added:

            print(
                "BOOKING DATABASE MIGRATION SUCCESSFUL:"
            )

            print(
                ", ".join(added)
            )

        else:

            print(
                "Booking database schema is already up to date."
            )


    except Exception as e:

        db.session.rollback()

        print(
            "BOOKING DATABASE MIGRATION ERROR:",
            e
        )

        raise


# ============================================================
# PHONE NORMALIZATION
# ============================================================

def normalize_phone(phone):

    if phone is None:

        raise ValueError(
            "M-Pesa phone number is required."
        )


    phone = str(
        phone
    ).strip()


    phone = (
        phone
        .replace(" ", "")
        .replace("-", "")
        .replace("+", "")
    )


    # 07XXXXXXXX
    if phone.startswith("07") and len(phone) == 10:

        phone = "254" + phone[1:]


    # 01XXXXXXXX
    elif phone.startswith("01") and len(phone) == 10:

        phone = "254" + phone[1:]


    # 7XXXXXXXX
    elif phone.startswith("7") and len(phone) == 9:

        phone = "254" + phone


    # 1XXXXXXXX
    elif phone.startswith("1") and len(phone) == 9:

        phone = "254" + phone


    if (
        len(phone) != 12
        or not phone.isdigit()
        or not (
            phone.startswith("2547")
            or phone.startswith("2541")
        )
    ):

        raise ValueError(
            "Invalid Kenyan phone number. "
            "Use a number such as 0712345678."
        )


    return phone


# ============================================================
# M-PESA TIMESTAMP
# ============================================================

def mpesa_timestamp():

    now = datetime.now(
        ZoneInfo("Africa/Nairobi")
    )

    return now.strftime(
        "%Y%m%d%H%M%S"
    )


# ============================================================
# M-PESA PASSWORD
# ============================================================

def mpesa_password(timestamp):
    if not MPESA_SHORTCODE:
        raise RuntimeError("MPESA_SHORTCODE is missing")

    if not MPESA_PASSKEY:
        raise RuntimeError("MPESA_PASSKEY is missing")

    raw_password = (
        f"{MPESA_SHORTCODE}"
        f"{MPESA_PASSKEY}"
        f"{timestamp}"
    )

    return base64.b64encode(
        raw_password.encode("utf-8")
    ).decode("utf-8")


# ============================================================
# GENERIC HTTP JSON REQUEST
# ============================================================

def http_json_request(
    url,
    method="GET",
    payload=None,
    headers=None,
    timeout=30,
):

    if headers is None:

        headers = {}


    # Do not mutate caller's dictionary
    headers = dict(headers)


    data = None


    if payload is not None:

        data = json.dumps(
            payload
        ).encode("utf-8")

        headers.setdefault(
            "Content-Type",
            "application/json"
        )


    request_object = urllib.request.Request(

        url,

        data=data,

        headers=headers,

        method=method.upper(),
    )


    try:

        with urllib.request.urlopen(
            request_object,
            timeout=timeout
        ) as response:

            response_body = (
                response
                .read()
                .decode("utf-8")
            )


            if not response_body:

                return {}, response.status


            return (
                json.loads(
                    response_body
                ),
                response.status
            )


    except urllib.error.HTTPError as e:

        error_body = ""

        try:

            error_body = (
                e.read()
                .decode("utf-8")
            )

        except Exception:

            pass


        print(
            "HTTP ERROR:",
            e.code,
            error_body
        )


        try:

            error_json = json.loads(
                error_body
            )

        except Exception:

            error_json = {
                "error": error_body
            }


        return (
            error_json,
            e.code
        )


    except urllib.error.URLError as e:

        print(
            "URL ERROR:",
            e
        )

        raise RuntimeError(
            f"Could not connect to payment service: {e}"
        )


    except json.JSONDecodeError as e:

        print(
            "JSON DECODE ERROR:",
            e
        )

        raise RuntimeError(
            "Payment service returned invalid JSON."
        )


# ============================================================
# GET M-PESA ACCESS TOKEN
# ============================================================

def get_mpesa_access_token():

    print("")
    print("======================================")
    print("M-PESA OAUTH AUTHENTICATION")
    print("======================================")

    if not MPESA_CONSUMER_KEY:

        raise ValueError(
            "MPESA_CONSUMER_KEY is not configured."
        )


    if not MPESA_CONSUMER_SECRET:

        raise ValueError(
            "MPESA_CONSUMER_SECRET is not configured.")

    print(
        "Consumer Key:",
        "CONFIGURED",
        f"(length={len(MPESA_CONSUMER_KEY)})"
    )

    print(
        "Consumer Secret:",
        "CONFIGURED",
        f"(length={len(MPESA_CONSUMER_SECRET)})"
    )

    print(
        "Base URL:",
        MPESA_BASE_URL
    )
       
        


    credentials = (
        f"{MPESA_CONSUMER_KEY}:"
        f"{MPESA_CONSUMER_SECRET}"
    )


    encoded_credentials = base64.b64encode(
        credentials.encode("utf-8")
    ).decode("utf-8")


    url = (
        f"{MPESA_BASE_URL}"
        "/oauth/v1/generate"
        "?grant_type=client_credentials"
    )


    headers = {

        "Authorization":
            f"Basic {encoded_credentials}",

        "Content-Type":
            "application/json",
    }


    response, status_code = http_json_request(

        url=url,

        method="GET",

        headers=headers,
    )


    if status_code >= 400:

        raise RuntimeError(
            f"Safaricom OAuth failed: {response}"
        )


    access_token = response.get(
        "access_token"
    )

    if not access_token:

        print(
            "OAuth response did not contain "
            "an access token."
        )

        raise RuntimeError(
            "Safaricom did not return an access token."
        )

    print(
        "M-PESA OAUTH SUCCESS"
    )

    print(
        "Access token received successfully."
    )

    print(
        "======================================"
    )

    return access_token


# GET BOOKING PAYMENT DATA
# ============================================================

def get_booking_payment_data(
    booking_id
):

    try:

        result = db.session.execute(
            text(
                """
                SELECT
                    payment_status,
                    payment_method,
                    payment_phone,
                    mpesa_receipt,
                    checkout_request_id,
                    merchant_request_id,
                    payment_result_code,
                    payment_result_description,
                    payment_paid_at
                FROM bookings
                WHERE id = :booking_id
                LIMIT 1
                """
            ),
            {
                "booking_id":
                    booking_id
            },
        ).mappings().first()


        if not result:

            return {

                "paymentStatus":
                    "Pending",

                "paymentMethod":
                    None,

                "paymentPhone":
                    None,

                "mpesaReceipt":
                    None,

                "checkoutRequestId":
                    None,

                "merchantRequestId":
                    None,

                "paymentResultCode":
                    None,

                "paymentResultDescription":
                    None,

                "paymentPaidAt":
                    None,
            }


        paid_at = (
            result["payment_paid_at"]
            if result["payment_paid_at"]
            else None
        )


        if hasattr(
            paid_at,
            "isoformat"
        ):

            paid_at = paid_at.isoformat()


        return {

            "paymentStatus":
                result["payment_status"]
                or "Pending",

            "paymentMethod":
                result["payment_method"],

            "paymentPhone":
                result["payment_phone"],

            "mpesaReceipt":
                result["mpesa_receipt"],

            "checkoutRequestId":
                result["checkout_request_id"],

            "merchantRequestId":
                result["merchant_request_id"],

            "paymentResultCode":
                result["payment_result_code"],

            "paymentResultDescription":
                result[
                    "payment_result_description"
                ],

            "paymentPaidAt":
                paid_at,
        }


    except Exception as e:

        print(
            "GET BOOKING PAYMENT DATA ERROR:",
            e
        )

        db.session.rollback()


        return {

            "paymentStatus":
                "Pending",

            "paymentMethod":
                None,

            "paymentPhone":
                None,

            "mpesaReceipt":
                None,

            "checkoutRequestId":
                None,

            "merchantRequestId":
                None,

            "paymentResultCode":
                None,

            "paymentResultDescription":
                None,

            "paymentPaidAt":
                None,
        }


# ============================================================
# UPDATE BOOKING PAYMENT
# ============================================================

def update_booking_payment(
    booking_id,
    payment_status=None,
    payment_method=None,
    payment_phone=None,
    mpesa_receipt=None,
    checkout_request_id=None,
    merchant_request_id=None,
    payment_result_code=None,
    payment_result_description=None,
    payment_paid_at=None,
):

    fields = []


    parameters = {
        "booking_id":
            booking_id
    }


    if payment_status is not None:

        fields.append(
            "payment_status = :payment_status"
        )

        parameters[
            "payment_status"
        ] = payment_status


    if payment_method is not None:

        fields.append(
            "payment_method = :payment_method"
        )

        parameters[
            "payment_method"
        ] = payment_method


    if payment_phone is not None:

        fields.append(
            "payment_phone = :payment_phone"
        )

        parameters[
            "payment_phone"
        ] = payment_phone


    if mpesa_receipt is not None:

        fields.append(
            "mpesa_receipt = :mpesa_receipt"
        )

        parameters[
            "mpesa_receipt"
        ] = mpesa_receipt


    if checkout_request_id is not None:

        fields.append(
            "checkout_request_id = :checkout_request_id"
        )

        parameters[
            "checkout_request_id"
        ] = checkout_request_id


    if merchant_request_id is not None:

        fields.append(
            "merchant_request_id = :merchant_request_id"
        )

        parameters[
            "merchant_request_id"
        ] = merchant_request_id


    if payment_result_code is not None:

        fields.append(
            "payment_result_code = :payment_result_code"
        )

        parameters[
            "payment_result_code"
        ] = payment_result_code


    if payment_result_description is not None:

        fields.append(
            "payment_result_description = :payment_result_description"
        )

        parameters[
            "payment_result_description"
        ] = payment_result_description


    if payment_paid_at is not None:

        fields.append(
            "payment_paid_at = :payment_paid_at"
        )

        parameters[
            "payment_paid_at"
        ] = payment_paid_at


    if not fields:

        return


    try:

        sql = (
            "UPDATE bookings SET "
            + ", ".join(fields)
            + " WHERE id = :booking_id"
        )


        db.session.execute(
            text(sql),
            parameters
        )


        db.session.commit()


    except Exception as e:

        db.session.rollback()


        print(
            "UPDATE BOOKING PAYMENT ERROR:",
            e
        )


        raise


# ============================================================
# SERIALIZE BOOKING
# ============================================================

def serialize_booking(
    booking,
    include_customer=False
):

    service = db.session.get(
        Service,
        booking.service_id
    )


    result = {

        "id":
            booking.id,

        "userId":
            booking.user_id,

        "serviceId":
            booking.service_id,

        "serviceName":
            (
                service.title
                if service
                else "Unknown Service"
            ),

        "categoryId":
            booking.category_id,

        "categoryName":
            get_category_name(
                booking.category_id
            ),

        "total":
            float(booking.total)
            if booking.total is not None
            else 0,

        "status":
            booking.status or "Pending",

        "date":
            booking.date,

        "time":
            booking.time,

        "address":
            booking.address,

        "city":
            booking.city,

        "estate":
            booking.estate,

        "houseNumber":
            booking.house_number,

        "houseSize":
            booking.house_size,

        "cleaningType":
            booking.cleaning_type,

        "frequency":
            booking.frequency,

        "notes":
            booking.notes,

        "extras":
            parse_extras(
                booking.extras
            ),
    }


    payment = get_booking_payment_data(
        booking.id
    )


    result.update(
        payment
    )


    if include_customer:

        user = db.session.get(
            User,
            booking.user_id
        )


        customer_name = (
            user.name
            if user
            else "Unknown Customer"
        )


        customer_email = (
            user.email
            if user
            else ""
        )


        customer_phone = (
            getattr(
                user,
                "phone",
                None
            )
            if user
            else None
        )


        result["customer"] = {

            "id":
                user.id
                if user
                else None,

            "name":
                customer_name,

            "email":
                customer_email,

            "phone":
                customer_phone,
        }


        result[
            "customerName"
        ] = customer_name


        result[
            "customerEmail"
        ] = customer_email


        result[
            "customerPhone"
        ] = customer_phone


    return result


# ============================================================
# BOOKING STATUS
# ============================================================

def valid_booking_status(status):

    return status in {

        "Pending",

        "Confirmed",

        "In Progress",

        "Completed",

        "Cancelled",
    }


# ============================================================
# HOME
# ============================================================

@app.route(
    "/",
    methods=["GET"]
)
def home():

    return jsonify({

        "message":
            "Ramon's Service Marketplace API is running.",

        "mpesaConfigured":
            bool(
                MPESA_CONSUMER_KEY
                and MPESA_CONSUMER_SECRET
                and MPESA_SHORTCODE
                and MPESA_PASSKEY
                and MPESA_CALLBACK_URL
            ),

        "emailConfigured":
            bool(
                SMTP_USERNAME
                and SMTP_PASSWORD
            ),
    }), 200


# ============================================================
# HEALTH
# ============================================================

@app.route(
    "/health",
    methods=["GET"]
)
def health():

    return jsonify({

        "status":
            "ok",

        "message":
            "Backend is running.",
    }), 200


# ============================================================
# REGISTER
# ============================================================

@app.route(
    "/register",
    methods=["POST"]
)
def register():

    try:

        data = request.get_json(
            silent=True
        )


        if not data:

            return jsonify({
                "message":
                    "No data received.",
            }), 400


        name = str(
            data.get(
                "name",
                ""
            )
        ).strip()


        email = str(
            data.get(
                "email",
                ""
            )
        ).lower().strip()


        password = str(
            data.get(
                "password",
                ""
            )
        )


        phone = str(
            data.get(
                "phone",
                ""
            )
        ).strip()


        if not name:

            return jsonify({
                "message":
                    "Name is required.",
            }), 400


        if not email:

            return jsonify({
                "message":
                    "Email is required.",
            }), 400


        if not password:

            return jsonify({
                "message":
                    "Password is required.",
            }), 400


        if len(password) < 6:

            return jsonify({
                "message":
                    "Password must be at least 6 characters.",
            }), 400


        existing_user = User.query.filter_by(
            email=email
        ).first()


        if existing_user:

            return jsonify({
                "message":
                    "Email already exists.",
            }), 400


        user = User(

            name=name,

            email=email,

            phone=phone or None,

            password=generate_password_hash(
                password
            ),

            role="customer",
        )


        db.session.add(
            user
        )


        db.session.commit()


        return jsonify({

            "message":
                "Account created successfully.",

            "user": {

                "id":
                    user.id,

                "name":
                    user.name,

                "email":
                    user.email,

                "phone":
                    getattr(
                        user,
                        "phone",
                        None
                    ),

                "role":
                    user.role,
            }

        }), 201


    except Exception as e:

        db.session.rollback()


        print(
            "REGISTER ERROR:",
            e
        )


        return jsonify({

            "message":
                "Registration failed.",

            "error":
                str(e),

        }), 500


# ============================================================
# LOGIN
# ============================================================

@app.route(
    "/login",
    methods=["POST"]
)
def login():

    try:

        data = request.get_json(
            silent=True
        )


        if not data:

            return jsonify({
                "message":
                    "No data received.",
            }), 400


        email = str(
            data.get(
                "email",
                ""
            )
        ).lower().strip()


        password = str(
            data.get(
                "password",
                ""
            )
        )


        if not email or not password:

            return jsonify({
                "message":
                    "Email and password are required.",
            }), 400


        user = User.query.filter_by(
            email=email
        ).first()


        if not user:

            return jsonify({
                "message":
                    "Account not found. Please register first.",
            }), 401


        if not check_password_hash(
            user.password,
            password
        ):

            return jsonify({
                "message":
                    "Incorrect password.",
            }), 401


        role = str(
            user.role or "customer"
        ).lower().strip()


        token = create_access_token(
    identity=str(user.id)
)


        print(
            f"LOGIN SUCCESS: "
            f"user={user.email}, "
            f"id={user.id}, "
            f"role={role}"
        )


        return jsonify({

            "message":
                "Login successful.",

            "token":
                token,

            "user": {

                "id":
                    user.id,

                "name":
                    user.name,

                "email":
                    user.email,

                "phone":
                    getattr(
                        user,
                        "phone",
                        None
                    ),

                "role":
                    role,
            }

        }), 200


    except Exception as e:

        print(
            "LOGIN ERROR:",
            e
        )


        return jsonify({

            "message":
                "Login failed.",

            "error":
                str(e),

        }), 500


# ============================================================
# GET PROFILE
# ============================================================

@app.route(
    "/profile",
    methods=["GET"]
)
@jwt_required()
def profile():

    try:

        current_user = get_current_user()


        if not current_user:

            return jsonify({

                "message":
                    "User not found. Please log in again.",

            }), 404


        return jsonify({

            "user": {

                "id":
                    current_user.id,

                "name":
                    current_user.name,

                "email":
                    current_user.email,

                "phone":
                    getattr(
                        current_user,
                        "phone",
                        None
                    ),

                "role":
                    current_user.role,
            }

        }), 200


    except Exception as e:

        print(
            "PROFILE ERROR:",
            e
        )


        return jsonify({

            "message":
                "Failed to load profile.",

            "error":
                str(e),

        }), 500


# ============================================================
# UPDATE PROFILE
# ============================================================

@app.route(
    "/profile",
    methods=["PUT"]
)
@jwt_required()
def update_profile():

    try:

        current_user = get_current_user()


        if not current_user:

            return jsonify({

                "message":
                    "User account not found.",

            }), 404


        data = request.get_json(
            silent=True
        ) or {}


        name = str(
            data.get(
                "name",
                ""
            )
        ).strip()


        email = str(
            data.get(
                "email",
                ""
            )
        ).strip().lower()


        phone = str(
            data.get(
                "phone",
                ""
            )
        ).strip()


        if not name:

            return jsonify({

                "message":
                    "Full name is required.",

            }), 400


        if not email:

            return jsonify({

                "message":
                    "Email address is required.",

            }), 400


        if not phone:

            return jsonify({

                "message":
                    "Phone number is required.",

            }), 400


        existing_user = User.query.filter(
            User.email == email,
            User.id != current_user.id
        ).first()


        if existing_user:

            return jsonify({

                "message":
                    "That email address is already in use.",

            }), 409


        current_user.name = name

        current_user.email = email

        current_user.phone = phone


        db.session.commit()


        return jsonify({

            "message":
                "Profile updated successfully.",

            "user": {

                "id":
                    current_user.id,

                "name":
                    current_user.name,

                "email":
                    current_user.email,

                "phone":
                    current_user.phone,

                "role":
                    current_user.role,
            }

        }), 200


    except Exception as e:

        db.session.rollback()


        print(
            "PROFILE UPDATE ERROR:",
            e
        )


        return jsonify({

            "message":
                "Unable to update profile.",

            "error":
                str(e),

        }), 500


# ============================================================
# CHANGE PASSWORD
# ============================================================

@app.route(
    "/profile/password",
    methods=["PUT"]
)
@jwt_required()
def change_password():

    try:

        current_user = get_current_user()


        if not current_user:

            return jsonify({

                "message":
                    "User not found. Please log in again.",

            }), 404


        data = request.get_json(
            silent=True
        ) or {}


        current_password = str(
            data.get(
                "currentPassword",
                ""
            )
        )


        new_password = str(
            data.get(
                "newPassword",
                ""
            )
        )


        confirm_password = str(
            data.get(
                "confirmPassword",
                ""
            )
        )


        if not current_password:

            return jsonify({

                "message":
                    "Current password is required.",

            }), 400


        password_error = validate_password(
            new_password
        )


        if password_error:

            return jsonify({

                "message":
                    password_error,

            }), 400


        if new_password != confirm_password:

            return jsonify({

                "message":
                    "New passwords do not match.",

            }), 400


        if not check_password_hash(
            current_user.password,
            current_password
        ):

            return jsonify({

                "message":
                    "Current password is incorrect.",

            }), 401


        if check_password_hash(
            current_user.password,
            new_password
        ):

            return jsonify({

                "message":
                    "Your new password must be different from your current password.",

            }), 400


        current_user.password = (
            generate_password_hash(
                new_password
            )
        )


        current_user.reset_token_hash = None

        current_user.reset_token_expires = None


        db.session.commit()


        print(
            "PASSWORD CHANGED:",
            current_user.email
        )


        return jsonify({

            "message":
                "Password changed successfully.",

        }), 200


    except Exception as e:

        db.session.rollback()


        print(
            "CHANGE PASSWORD ERROR:",
            e
        )


        return jsonify({

            "message":
                "Unable to change password.",

            "error":
                str(e),

        }), 500


@app.route("/forgot-password", methods=["POST"])
def forgot_password():

    print("\n======================================")
    print("FORGOT PASSWORD ENDPOINT CALLED")
    print("======================================")

    try:
        data = request.get_json(silent=True) or {}

        print("REQUEST DATA:", data)

        email = str(
            data.get("email", "")
        ).strip().lower()

        print("EMAIL RECEIVED:", email)

        if not email:
            print("NO EMAIL WAS PROVIDED")

            return jsonify({
                "message": "Please enter your email address."
            }), 400

        user = User.query.filter_by(
            email=email
        ).first()

        print(
            "USER FOUND:",
            "YES" if user else "NO"
        )

        if not user:
            return jsonify({
                "message":
                    "If an account exists with that email, "
                    "a reset link has been sent."
            }), 200

        # ------------------------------------------
        # CREATE TOKEN
        # ------------------------------------------

        raw_token = create_reset_token()

        token_hash = hash_reset_token(
            raw_token
        )

        print("RESET TOKEN CREATED")

        # ------------------------------------------
        # SAVE TOKEN
        # ------------------------------------------

        user.reset_token_hash = token_hash

        user.reset_token_expires = (
            datetime.utcnow()
            + timedelta(
                minutes=RESET_TOKEN_MINUTES
            )
        )

        db.session.commit()

        print("RESET TOKEN SAVED TO DATABASE")

        # ------------------------------------------
        # CREATE RESET LINK
        # ------------------------------------------

        reset_link = (
            f"{FRONTEND_URL}"
            f"/reset-password"
            f"?token={raw_token}"
        )

        print("")
        print("======================================")
        print("PASSWORD RESET LINK")
        print(reset_link)
        print("======================================")
        print("")

        # ------------------------------------------
        # CHECK EMAIL CONFIGURATION
        # ------------------------------------------

        print("SMTP CONFIGURATION")
        print("------------------")
        print("SMTP HOST:", SMTP_HOST)
        print("SMTP PORT:", SMTP_PORT)
        print(
            "SMTP USERNAME:",
            SMTP_USERNAME if SMTP_USERNAME else "NOT SET"
        )
        print(
            "SMTP PASSWORD:",
            "SET" if SMTP_PASSWORD else "NOT SET"
        )
        print(
            "SMTP FROM:",
            SMTP_FROM_EMAIL if SMTP_FROM_EMAIL else "NOT SET"
        )
        print("------------------")

        # ------------------------------------------
        # SEND EMAIL
        # ------------------------------------------

        email_sent = send_password_reset_email(
            user.email,
            reset_link
        )

        if email_sent:

            print(
                "SUCCESS: PASSWORD RESET EMAIL SENT"
            )

        else:

            print(
                "WARNING: EMAIL WAS NOT SENT"
            )

        return jsonify({

            "message":
                "If an account exists with that email, "
                "a reset link has been sent."

        }), 200

    except Exception as e:

        db.session.rollback()

        print("")
        print("======================================")
        print("FORGOT PASSWORD ERROR")
        print("======================================")
        print(type(e).__name__)
        print(str(e))
        print("======================================")
        print("")

        return jsonify({

            "message":
                "Unable to process password reset request.",

            "error":
                str(e)

        }), 500


# ============================================================
# RESET PASSWORD
# ============================================================

@app.route(
    "/reset-password",
    methods=["POST"]
)
def reset_password():

    try:

        data = request.get_json(
            silent=True
        ) or {}


        token = str(
            data.get(
                "token",
                ""
            )
        ).strip()


        new_password = str(
            data.get(
                "newPassword",
                ""
            )
        )


        confirm_password = str(
            data.get(
                "confirmPassword",
                ""
            )
        )


        if not token:

            return jsonify({

                "message":
                    "Password reset token is required.",

            }), 400


        password_error = validate_password(
            new_password
        )


        if password_error:

            return jsonify({

                "message":
                    password_error,

            }), 400


        if new_password != confirm_password:

            return jsonify({

                "message":
                    "Passwords do not match.",

            }), 400


        token_hash = hash_reset_token(
            token
        )


        user = User.query.filter_by(
            reset_token_hash=token_hash
        ).first()


        if not user:

            return jsonify({

                "message":
                    "This password reset link is invalid or has already been used.",

            }), 400


        if not user.reset_token_expires:

            return jsonify({

                "message":
                    "This password reset link is invalid.",

            }), 400


        if datetime.utcnow() > user.reset_token_expires:

            user.reset_token_hash = None

            user.reset_token_expires = None

            db.session.commit()


            return jsonify({

                "message":
                    "This password reset link has expired.",

            }), 400


        # ----------------------------------------------------
        # Change password
        # ----------------------------------------------------

        user.password = (
            generate_password_hash(
                new_password
            )
        )


        # ----------------------------------------------------
        # Make token one-time-use
        # ----------------------------------------------------

        user.reset_token_hash = None

        user.reset_token_expires = None


        db.session.commit()


        print(
            "PASSWORD RESET SUCCESS:",
            user.email
        )


        return jsonify({

            "message":
                "Password reset successfully. You can now log in.",

        }), 200


    except Exception as e:

        db.session.rollback()


        print(
            "RESET PASSWORD ERROR:",
            e
        )


        return jsonify({

            "message":
                "Unable to reset password.",

            "error":
                str(e),

        }), 500


# ============================================================
# GET ALL SERVICES
# ============================================================

@app.route(
    "/services",
    methods=["GET"]
)
def get_services():

    try:

        services = Service.query.order_by(
            Service.id.asc()
        ).all()


        return jsonify([

            {

                "id":
                    service.id,

                "name":
                    service.title,

                "title":
                    service.title,

                "description":
                    service.description,

                "price":
                    float(service.price)
                    if service.price is not None
                    else 0,

                "location":
                    service.location,

                "provider":
                    service.provider,
            }

            for service in services

        ]), 200


    except Exception as e:

        print(
            "GET SERVICES ERROR:",
            e
        )


        return jsonify({

            "message":
                "Failed to load services.",

            "error":
                str(e),

        }), 500


# ============================================================
# GET ONE SERVICE
# ============================================================

@app.route(
    "/services/<int:id>",
    methods=["GET"]
)
def get_service(id):

    try:

        service = db.session.get(
            Service,
            id
        )


        if not service:

            return jsonify({

                "message":
                    "Service not found.",

            }), 404


        return jsonify({

            "id":
                service.id,

            "name":
                service.title,

            "title":
                service.title,

            "description":
                service.description,

            "price":
                float(service.price)
                if service.price is not None
                else 0,

            "location":
                service.location,

            "provider":
                service.provider,

        }), 200


    except Exception as e:

        print(
            "GET SERVICE ERROR:",
            e
        )


        return jsonify({

            "message":
                "Failed to load service.",

            "error":
                str(e),

        }), 500


# ============================================================
# CREATE BOOKING
# ============================================================

@app.route(
    "/bookings",
    methods=["POST"]
)
@jwt_required()
def create_booking():

    try:

        # ======================================================
        # CURRENT USER
        # ======================================================

        current_user = get_current_user()

        if not current_user:

            return jsonify({
                "message":
                    "User not found. Please log in again."
            }), 404

        # ======================================================
        # GET JSON
        # ======================================================

        data = request.get_json(
            silent=True
        )

        print(
            "======================================"
        )

        print(
            "CREATE BOOKING REQUEST"
        )

        print(
            "USER:",
            current_user.id
        )

        print(
            "PAYLOAD:",
            data
        )

        print(
            "======================================"
        )

        if not data:

            return jsonify({
                "message":
                    "No booking data received."
            }), 400

        # ======================================================
        # SERVICE ID
        # ======================================================

        service_id = (
            data.get("serviceId")
            or data.get("service_id")
        )

        if service_id is None:

            return jsonify({
                "message":
                    "Service is required."
            }), 400

        try:

            service_id = int(
                service_id
            )

        except (
            TypeError,
            ValueError
        ):

            return jsonify({
                "message":
                    "Invalid service ID.",
                "received":
                    service_id
            }), 400

        # ======================================================
        # CATEGORY ID
        # ======================================================

        category_id = (
            data.get("categoryId")
            or data.get("category_id")
        )

        if category_id is None:

            return jsonify({
                "message":
                    "Service category is required."
            }), 400

        category_id = str(
            category_id
        ).strip()

        if not category_id:

            return jsonify({
                "message":
                    "Service category is required."
            }), 400

        # ======================================================
        # CALCULATE BOOKING TOTAL
        # ======================================================

        house_size = str(
            data.get("houseSize") or ""
        ).strip()

        frequency = str(
            data.get("frequency") or "One-Time"
        ).strip()

        # Base cleaning prices
        cleaning_prices = {
            "Bedsitter": 1500,
            "1 Bedroom": 2000,
            "2 Bedroom": 3000,
            "3 Bedroom": 4000,
            "4 Bedroom": 5500,
            "5+ Bedroom": 7000,
        }

        if house_size not in cleaning_prices:

            return jsonify({
                "message": "Invalid house size.",
                "received": house_size,
                "allowed": list(
                    cleaning_prices.keys()
                )
            }), 400

        # Start with house-size price
        total = float(
            cleaning_prices[house_size]
        )

        # ======================================================
        # EXTRAS
        # ======================================================

        extras = data.get(
            "extras",
            []
        )

        if not isinstance(
            extras,
            list
        ):
            extras = []

        extra_prices = {
            "Inside Fridge": 500,
            "Oven": 400,
            "Balcony": 300,
            "Laundry": 700,
            "Ironing": 500,
            "Pest Control/Fumigation": 2500,
        }

        for extra in extras:

            if isinstance(extra, dict):

                extra_name = (
                    extra.get("name")
                    or extra.get("label")
                    or extra.get("title")
                    or ""
                )

            else:

                extra_name = str(
                    extra
                )

            extra_name = extra_name.strip()

            if extra_name in extra_prices:

                total += extra_prices[
                    extra_name
                ]

        # ======================================================
        # FREQUENCY DISCOUNTS
        # ======================================================

        frequency_discounts = {
            "One-Time": 0,
            "Weekly": 0.10,
            "Bi-Weekly": 0.05,
            "Monthly Subscription": 0.15,
        }

        if frequency not in frequency_discounts:

            return jsonify({
                "message": "Invalid frequency.",
                "received": frequency,
                "allowed": list(
                    frequency_discounts.keys()
                )
            }), 400

        discount_rate = frequency_discounts[
            frequency
        ]

        if discount_rate > 0:

            total = total * (
                1 - discount_rate
            )

        # Round to two decimal places
        total = round(
            total,
            2
        )

        if total <= 0:

            return jsonify({
                "message":
                    "Calculated booking total must be greater than zero."
            }), 400

        # ======================================================
        # CHECK SERVICE EXISTS
        # ======================================================

        service = db.session.get(
            Service,
            service_id
        )

        if not service:

            return jsonify({
                "message":
                    "Service not found.",
                "serviceId":
                    service_id
            }), 404

        # ======================================================
        # EXTRAS
        # ======================================================

        extras = data.get(
            "extras",
            []
        )

        if not isinstance(
            extras,
            list
        ):

            extras = []

        # ======================================================
        # PAYMENT METHOD
        # ======================================================

        payment_method = (
            data.get(
                "paymentMethod"
            )
        )

        if payment_method:
            payment_method = str(
                payment_method
            ).strip()

        # ======================================================
        # PAYMENT PHONE
        #
        # Manual Till payment does not require
        # a phone number.
        # ======================================================

        payment_phone = None

        raw_phone = data.get(
            "paymentPhone"
        )

        if raw_phone:

            payment_phone = normalize_phone(
                raw_phone
            )

        # ======================================================
        # CREATE BOOKING
        # ======================================================

        booking = Booking(

            user_id=current_user.id,

            service_id=service_id,

            category_id=category_id,

            total=total,

            status="Pending",

            date=data.get(
                "date"
            ),

            time=data.get(
                "time"
            ),

            address=data.get(
                "address"
            ),

            city=data.get(
                "city"
            ),

            estate=data.get(
                "estate"
            ),

            house_number=data.get(
                "houseNumber"
            ),

            house_size=data.get(
                "houseSize"
            ),

            cleaning_type=(
                data.get(
                    "cleaningType"
                )
                or data.get(
                    "cleaningLevel"
                )
            ),

            frequency=data.get(
                "frequency"
            ),

            notes=data.get(
                "notes"
            ),

            extras=json.dumps(
                extras
            ),

        )

        # ======================================================
        # SAVE BOOKING
        # ======================================================

        db.session.add(
            booking
        )

        db.session.flush()

        # ======================================================
        # PAYMENT INFORMATION
        # ======================================================

        if payment_method:

            booking.payment_status = (
                "Pending"
            )

            booking.payment_method = (
                payment_method
            )

            booking.payment_phone = (
                payment_phone
            )

        else:

            booking.payment_status = (
                "Pending"
            )

        # ======================================================
        # COMMIT EVERYTHING
        # ======================================================

        db.session.commit()

        # ======================================================
        # LOG
        # ======================================================

        print(
            "======================================"
        )

        print(
            "NEW BOOKING CREATED"
        )

        print(
            f"Booking ID: {booking.id}"
        )

        print(
            f"Customer: {current_user.name}"
        )

        print(
            f"Email: {current_user.email}"
        )

        print(
            f"Service: {service.title}"
        )

        print(
            f"Category: {category_id}"
        )

        print(
            f"Total: Ksh {total}"
        )

        print(
            f"Payment Method: {payment_method}"
        )

        print(
            "======================================"
        )

        # ======================================================
        # RESPONSE
        # ======================================================

        return jsonify({

            "message":
                "Booking created successfully.",

            "booking":
                serialize_booking(
                    booking,
                    include_customer=True
                )

        }), 201

    except Exception as e:

        db.session.rollback()

        print(
            "======================================"
        )

        print(
            "BOOKING ERROR:"
        )

        print(
            str(e)
        )

        print(
            "======================================"
        )

        return jsonify({

            "message":
                "Failed to create booking.",

            "error":
                str(e)

        }), 500


# ============================================================
# CUSTOMER - OWN BOOKINGS
# ============================================================

@app.route(
    "/bookings/my",
    methods=["GET"]
)
@jwt_required()
def my_bookings():

    try:

        current_user = get_current_user()


        if not current_user:

            return jsonify({

                "message":
                    "User not found. Please log in again.",

            }), 404


        bookings = Booking.query.filter_by(

            user_id=current_user.id

        ).order_by(

            Booking.id.desc()

        ).all()


        return jsonify([

            serialize_booking(
                booking
            )

            for booking in bookings

        ]), 200


    except Exception as e:

        print(
            "MY BOOKINGS ERROR:",
            e
        )


        return jsonify({

            "message":
                "Failed to load your bookings.",

            "error":
                str(e),

        }), 500

        # ============================================================
# M-PESA MANUAL TILL PAYMENT
# ============================================================

@app.route(
    "/api/mpesa/manual-payment",
    methods=["POST"]
)
@jwt_required()
def manual_mpesa_payment():

    try:

        # ======================================================
        # CURRENT USER
        # ======================================================

        current_user = get_current_user()

        if not current_user:

            return jsonify({
                "message":
                    "User not found. Please log in again."
            }), 404

        # ======================================================
        # DATA
        # ======================================================

        data = request.get_json(
            silent=True
        ) or {}

        print(
            "======================================"
        )

        print(
            "MANUAL M-PESA PAYMENT"
        )

        print(
            "USER:",
            current_user.id
        )

        print(
            "DATA:",
            data
        )

        print(
            "======================================"
        )

        # ======================================================
        # BOOKING ID
        # ======================================================

        booking_id = (
            data.get(
                "bookingId"
            )
            or data.get(
                "booking_id"
            )
        )

        try:

            booking_id = int(
                booking_id
            )

        except (
            TypeError,
            ValueError
        ):

            return jsonify({
                "message":
                    "A valid bookingId is required."
            }), 400

        # ======================================================
        # TRANSACTION CODE
        # ======================================================

        transaction_code = str(
            data.get(
                "transactionCode"
                or data.get(
                    "transaction_code",
                    ""
                )
            )
        ).strip().upper()

        if not transaction_code:

            return jsonify({
                "message":
                    "M-PESA transaction code is required."
            }), 400

        if len(
            transaction_code
        ) < 5:

            return jsonify({
                "message":
                    "The M-PESA transaction code is too short."
            }), 400

        # ======================================================
        # FIND BOOKING
        # ======================================================

        booking = db.session.get(
            Booking,
            booking_id
        )

        if not booking:

            return jsonify({
                "message":
                    "Booking not found."
            }), 404

        # ======================================================
        # OWNERSHIP CHECK
        # ======================================================

        if (
            booking.user_id
            != current_user.id
        ):

            return jsonify({
                "message":
                    "You are not allowed to pay for this booking."
            }), 403

        # ======================================================
        # CHECK ALREADY PAID
        # ======================================================

        if (
            booking.payment_status
            == "Paid"
        ):

            return jsonify({

                "message":
                    "This booking has already been paid.",

                "booking":
                    serialize_booking(
                        booking,
                        include_customer=True
                    )

            }), 400

        # ======================================================
        # VERIFY AMOUNT
        # ======================================================

        amount = data.get(
            "amount"
        )

        try:

            amount = float(
                amount
            )

        except (
            TypeError,
            ValueError
        ):

            amount = float(
                booking.total or 0
            )

        booking_total = float(
            booking.total or 0
        )

        if amount <= 0:

            return jsonify({
                "message":
                    "Payment amount must be greater than zero."
            }), 400

        # ======================================================
        # IMPORTANT:
        # Use the booking amount as the authoritative amount.
        # Do not trust a smaller/different frontend amount.
        # ======================================================

        if round(
            amount,
            2
        ) != round(
            booking_total,
            2
        ):

            return jsonify({

                "message":
                    "Payment amount does not match the booking total.",

                "bookingTotal":
                    booking_total,

                "submittedAmount":
                    amount

            }), 400

        # ======================================================
        # SAVE MANUAL PAYMENT
        #
        # mpesa_receipt is used to store the transaction code.
        # Your Booking model already has this column.
        # ======================================================

        booking.payment_method = (
            "mpesa_till"
        )

        booking.payment_status = (
            "Awaiting Verification"
        )

        booking.mpesa_receipt = (
            transaction_code
        )

        booking.payment_result_code = (
            "MANUAL"
        )

        booking.payment_result_description = (
            "M-PESA Till transaction submitted by customer and awaiting admin verification."
        )

        # ======================================================
        # COMMIT
        # ======================================================

        db.session.commit()

        # ======================================================
        # LOG
        # ======================================================

        print(
            "======================================"
        )

        print(
            "M-PESA PAYMENT SUBMITTED"
        )

        print(
            f"Booking ID: {booking.id}"
        )

        print(
            f"Transaction Code: {transaction_code}"
        )

        print(
            f"Amount: Ksh {booking_total}"
        )

        print(
            "Status: Awaiting Verification"
        )

        print(
            "======================================"
        )

        # ======================================================
        # RESPONSE
        # ======================================================

        return jsonify({

            "message":
                "M-PESA transaction submitted successfully. Awaiting verification.",

            "booking":
                serialize_booking(
                    booking,
                    include_customer=True
                ),

            "payment": {

                "status":
                    "Awaiting Verification",

                "method":
                    "mpesa_till",

                "transactionCode":
                    transaction_code,

                "amount":
                    booking_total

            }

        }), 200

    except Exception as e:

        db.session.rollback()

        print(
            "======================================"
        )

        print(
            "MANUAL M-PESA ERROR:"
        )

        print(
            str(e)
        )

        print(
            "======================================"
        )

        return jsonify({

            "message":
                "Failed to submit M-PESA payment.",

            "error":
                str(e)

        }), 500

        # ============================================================
# ADMIN - VERIFY M-PESA PAYMENT
# ============================================================

def get_category_name(category_id):

    try:

        return CATEGORY_NAMES.get(
            int(category_id),
            str(category_id)
        )

    except (TypeError, ValueError):

        if category_id is None:
            return "Unknown Category"

        return str(category_id)


# ============================================================
# AUTHENTICATION HELPER
# ============================================================

def get_current_user():

    identity = get_jwt_identity()

    if not identity:
        return None

    if isinstance(identity, dict):

        user_id = identity.get("id")

    else:

        user_id = identity

    if not user_id:
        return None

    try:

        user_id = int(user_id)

    except (TypeError, ValueError):

        return None

    return db.session.get(
        User,
        user_id
    )


# ============================================================
# ADMIN CHECK
# ============================================================

def admin_required():

    user = get_current_user()

    if not user:

        return None, (
            jsonify({
                "message":
                    "User not found. Please log in again.",
            }),
            404,
        )

    if str(user.role or "").lower() != "admin":

        return None, (
            jsonify({
                "message":
                    "Admin access required.",
            }),
            403,
        )

    return user, None


# ============================================================
# PARSE EXTRAS
# ============================================================

def parse_extras(extras_value):

    if not extras_value:
        return []

    if isinstance(extras_value, list):
        return extras_value

    try:

        parsed = json.loads(
            extras_value
        )

        if isinstance(parsed, list):
            return parsed

        return []

    except (
        json.JSONDecodeError,
        TypeError
    ):

        return []


# ============================================================
# PASSWORD RESET CONFIGURATION
# ============================================================

FRONTEND_URL = os.getenv(
    "FRONTEND_URL",
    "http://localhost:5173"
).rstrip("/")


try:

    RESET_TOKEN_MINUTES = int(
        os.getenv(
            "RESET_TOKEN_MINUTES",
            "30"
        )
    )

except ValueError:

    RESET_TOKEN_MINUTES = 30


SMTP_HOST = os.getenv(
    "SMTP_HOST",
    "smtp.gmail.com"
)

try:

    SMTP_PORT = int(
        os.getenv(
            "SMTP_PORT",
            "587"
        )
    )

except ValueError:

    SMTP_PORT = 587


SMTP_USERNAME = os.getenv(
    "SMTP_USERNAME",
    ""
)

SMTP_PASSWORD = os.getenv(
    "SMTP_PASSWORD",
    ""
)

SMTP_FROM_EMAIL = os.getenv(
    "SMTP_FROM_EMAIL",
    SMTP_USERNAME
)

SMTP_USE_TLS = (
    os.getenv(
        "SMTP_USE_TLS",
        "true"
    ).lower() == "true"
)


# ============================================================
# PASSWORD VALIDATION
# ============================================================

def validate_password(password):

    if not password:

        return "New password is required."

    if len(password) < 8:

        return (
            "Password must be at least "
            "8 characters long."
        )

    return None


# ============================================================
# CREATE RESET TOKEN
# ============================================================

def create_reset_token():

    return secrets.token_urlsafe(48)


# ============================================================
# HASH RESET TOKEN
# ============================================================

def hash_reset_token(token):

    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


def send_password_reset_email(email, reset_link):

    print("")
    print("======================================")
    print("STARTING EMAIL SEND")
    print("======================================")

    print("Recipient:", email)
    print("SMTP Host:", SMTP_HOST)
    print("SMTP Port:", SMTP_PORT)
    print(
        "SMTP Username:",
        SMTP_USERNAME if SMTP_USERNAME else "NOT CONFIGURED"
    )
    print(
        "SMTP Password:",
        "CONFIGURED" if SMTP_PASSWORD else "NOT CONFIGURED"
    )

    # ------------------------------------------
    # NO SMTP CONFIGURATION
    # ------------------------------------------

    if not SMTP_USERNAME or not SMTP_PASSWORD:

        print("")
        print("SMTP EMAIL IS NOT CONFIGURED.")
        print("")
        print("USE THIS RESET LINK:")
        print(reset_link)
        print("")
        print("======================================")

        return False

    # ------------------------------------------
    # CREATE EMAIL
    # ------------------------------------------

    message = EmailMessage()

    message["Subject"] = (
        "Ramon's Marketplace - Password Reset"
    )

    message["From"] = (
        SMTP_FROM_EMAIL or SMTP_USERNAME
    )

    message["To"] = email

    message.set_content(
        f"""Hello,

A password reset was requested for your
Ramon's Marketplace account.

Click the link below to reset your password:

{reset_link}

This link expires in {RESET_TOKEN_MINUTES} minutes.

If you did not request this reset, you can ignore this email.

Regards,
Ramon's Marketplace
"""
    )

    # ------------------------------------------
    # CONNECT TO GMAIL
    # ------------------------------------------

    try:

        print("")
        print("Connecting to SMTP server...")

        with smtplib.SMTP(
            SMTP_HOST,
            SMTP_PORT,
            timeout=30
        ) as server:

            print("SMTP CONNECTION SUCCESSFUL")

            if SMTP_USE_TLS:

                print("Starting TLS...")

                server.starttls()

                print("TLS STARTED")

            print("Logging into Gmail...")

            server.login(
                SMTP_USERNAME,
                SMTP_PASSWORD
            )

            print("GMAIL LOGIN SUCCESSFUL")

            print("Sending email...")

            server.send_message(
                message
            )

            print("")
            print("======================================")
            print("EMAIL SENT SUCCESSFULLY")
            print("TO:", email)
            print("======================================")
            print("")

            return True

    except Exception as e:

        print("")
        print("======================================")
        print("EMAIL SENDING FAILED")
        print("ERROR TYPE:", type(e).__name__)
        print("ERROR:", str(e))
        print("======================================")
        print("")

        # Still show the link during development
        print("DEVELOPMENT RESET LINK:")
        print(reset_link)
        print("")

        raise


# ============================================================
# M-PESA CONFIGURATION
# ============================================================

MPESA_BASE_URL = os.getenv(
    "MPESA_BASE_URL",
    "https://sandbox.safaricom.co.ke"
).rstrip("/")


MPESA_CONSUMER_KEY = os.getenv(
    "MPESA_CONSUMER_KEY",
    ""
)


MPESA_CONSUMER_SECRET = os.getenv(
    "MPESA_CONSUMER_SECRET",
    ""
)


MPESA_SHORTCODE = os.getenv(
    "MPESA_SHORTCODE",
    ""
)


MPESA_PASSKEY = os.getenv(
    "MPESA_PASSKEY",
    ""
)


MPESA_CALLBACK_URL = os.getenv(
    "MPESA_CALLBACK_URL",
    ""
)


MPESA_ACCOUNT_REFERENCE = os.getenv(
    "MPESA_ACCOUNT_REFERENCE",
    "RAMONS-MARKETPLACE"
)


MPESA_TRANSACTION_DESCRIPTION = os.getenv(
    "MPESA_TRANSACTION_DESCRIPTION",
    "Ramon's Marketplace Booking"
)


# ============================================================
# USER DATABASE MIGRATION
# ============================================================

def ensure_user_columns():

    try:

        inspector = inspect(
            db.engine
        )

        tables = inspector.get_table_names()

        # ----------------------------------------------------
        # Your original SQLAlchemy User model normally creates
        # a table called "user".
        #
        # Some older versions may have "users".
        # Detect either one.
        # ----------------------------------------------------

        user_table = None

        if "user" in tables:

            user_table = "user"

        elif "users" in tables:

            user_table = "users"

        if not user_table:

            print(
                "User table does not exist yet."
            )

            return


        existing_columns = {

            column["name"]

            for column in inspector.get_columns(
                user_table
            )
        }


        columns_to_add = {

            "phone":
                "VARCHAR(20)",

            "reset_token_hash":
                "VARCHAR(128)",

            "reset_token_expires":
                "DATETIME",
        }


        added = []


        for (
            column_name,
            column_definition
        ) in columns_to_add.items():

            if column_name not in existing_columns:

                sql = text(
                    f"ALTER TABLE {user_table} "
                    f"ADD COLUMN {column_name} "
                    f"{column_definition}"
                )

                db.session.execute(
                    sql
                )

                added.append(
                    column_name
                )


        db.session.commit()


        if added:

            print(
                "USER DATABASE MIGRATION SUCCESSFUL:"
            )

            print(
                ", ".join(added)
            )

        else:

            print(
                "User database schema is already up to date."
            )


    except Exception as e:

        db.session.rollback()

        print(
            "USER DATABASE MIGRATION ERROR:",
            e
        )

        raise


# ============================================================
# BOOKING DATABASE MIGRATION
# ============================================================

def ensure_payment_columns():

    try:

        inspector = inspect(
            db.engine
        )

        tables = inspector.get_table_names()

        if "bookings" not in tables:

            print(
                "Bookings table does not exist yet."
            )

            return


        existing_columns = {

            column["name"]

            for column in inspector.get_columns(
                "bookings"
            )
        }


        columns_to_add = {

            "payment_status":
                "VARCHAR(30) DEFAULT 'Pending'",

            "payment_method":
                "VARCHAR(30)",

            "payment_phone":
                "VARCHAR(20)",

            "mpesa_receipt":
                "VARCHAR(100)",

            "checkout_request_id":
                "VARCHAR(150)",

            "merchant_request_id":
                "VARCHAR(150)",

            "payment_result_code":
                "VARCHAR(30)",

            "payment_result_description":
                "TEXT",

            "payment_paid_at":
                "DATETIME",

            "created_at":
                "DATETIME",
        }


        added = []


        for (
            column_name,
            column_definition
        ) in columns_to_add.items():

            if column_name not in existing_columns:

                sql = text(
                    f"ALTER TABLE bookings "
                    f"ADD COLUMN {column_name} "
                    f"{column_definition}"
                )

                db.session.execute(
                    sql
                )

                added.append(
                    column_name
                )


        db.session.commit()


        if added:

            print(
                "BOOKING DATABASE MIGRATION SUCCESSFUL:"
            )

            print(
                ", ".join(added)
            )

        else:

            print(
                "Booking database schema is already up to date."
            )


    except Exception as e:

        db.session.rollback()

        print(
            "BOOKING DATABASE MIGRATION ERROR:",
            e
        )

        raise


# ============================================================
# PHONE NORMALIZATION
# ============================================================

def normalize_phone(phone):

    if phone is None:

        raise ValueError(
            "M-Pesa phone number is required."
        )


    phone = str(
        phone
    ).strip()


    phone = (
        phone
        .replace(" ", "")
        .replace("-", "")
        .replace("+", "")
    )


    # 07XXXXXXXX
    if phone.startswith("07") and len(phone) == 10:

        phone = "254" + phone[1:]


    # 01XXXXXXXX
    elif phone.startswith("01") and len(phone) == 10:

        phone = "254" + phone[1:]


    # 7XXXXXXXX
    elif phone.startswith("7") and len(phone) == 9:

        phone = "254" + phone


    # 1XXXXXXXX
    elif phone.startswith("1") and len(phone) == 9:

        phone = "254" + phone


    if (
        len(phone) != 12
        or not phone.isdigit()
        or not (
            phone.startswith("2547")
            or phone.startswith("2541")
        )
    ):

        raise ValueError(
            "Invalid Kenyan phone number. "
            "Use a number such as 0712345678."
        )


    return phone


# ============================================================
# M-PESA TIMESTAMP
# ============================================================

def mpesa_timestamp():

    now = datetime.now(
        ZoneInfo("Africa/Nairobi")
    )

    return now.strftime(
        "%Y%m%d%H%M%S"
    )


# ============================================================
# M-PESA PASSWORD
# ============================================================

def mpesa_password(timestamp):
    if not MPESA_SHORTCODE:
        raise RuntimeError("MPESA_SHORTCODE is missing")

    if not MPESA_PASSKEY:
        raise RuntimeError("MPESA_PASSKEY is missing")

    raw_password = (
        f"{MPESA_SHORTCODE}"
        f"{MPESA_PASSKEY}"
        f"{timestamp}"
    )

    return base64.b64encode(
        raw_password.encode("utf-8")
    ).decode("utf-8")


# ============================================================
# GENERIC HTTP JSON REQUEST
# ============================================================

def http_json_request(
    url,
    method="GET",
    payload=None,
    headers=None,
    timeout=30,
):

    if headers is None:

        headers = {}


    # Do not mutate caller's dictionary
    headers = dict(headers)


    data = None


    if payload is not None:

        data = json.dumps(
            payload
        ).encode("utf-8")

        headers.setdefault(
            "Content-Type",
            "application/json"
        )


    request_object = urllib.request.Request(

        url,

        data=data,

        headers=headers,

        method=method.upper(),
    )


    try:

        with urllib.request.urlopen(
            request_object,
            timeout=timeout
        ) as response:

            response_body = (
                response
                .read()
                .decode("utf-8")
            )


            if not response_body:

                return {}, response.status


            return (
                json.loads(
                    response_body
                ),
                response.status
            )


    except urllib.error.HTTPError as e:

        error_body = ""

        try:

            error_body = (
                e.read()
                .decode("utf-8")
            )

        except Exception:

            pass


        print(
            "HTTP ERROR:",
            e.code,
            error_body
        )


        try:

            error_json = json.loads(
                error_body
            )

        except Exception:

            error_json = {
                "error": error_body
            }


        return (
            error_json,
            e.code
        )


    except urllib.error.URLError as e:

        print(
            "URL ERROR:",
            e
        )

        raise RuntimeError(
            f"Could not connect to payment service: {e}"
        )


    except json.JSONDecodeError as e:

        print(
            "JSON DECODE ERROR:",
            e
        )

        raise RuntimeError(
            "Payment service returned invalid JSON."
        )


# ============================================================
# GET M-PESA ACCESS TOKEN
# ============================================================

def get_mpesa_access_token():

    print("")
    print("======================================")
    print("M-PESA OAUTH AUTHENTICATION")
    print("======================================")

    if not MPESA_CONSUMER_KEY:

        raise ValueError(
            "MPESA_CONSUMER_KEY is not configured."
        )


    if not MPESA_CONSUMER_SECRET:

        raise ValueError(
            "MPESA_CONSUMER_SECRET is not configured.")

    print(
        "Consumer Key:",
        "CONFIGURED",
        f"(length={len(MPESA_CONSUMER_KEY)})"
    )

    print(
        "Consumer Secret:",
        "CONFIGURED",
        f"(length={len(MPESA_CONSUMER_SECRET)})"
    )

    print(
        "Base URL:",
        MPESA_BASE_URL
    )
       
        


    credentials = (
        f"{MPESA_CONSUMER_KEY}:"
        f"{MPESA_CONSUMER_SECRET}"
    )


    encoded_credentials = base64.b64encode(
        credentials.encode("utf-8")
    ).decode("utf-8")


    url = (
        f"{MPESA_BASE_URL}"
        "/oauth/v1/generate"
        "?grant_type=client_credentials"
    )


    headers = {

        "Authorization":
            f"Basic {encoded_credentials}",

        "Content-Type":
            "application/json",
    }


    response, status_code = http_json_request(

        url=url,

        method="GET",

        headers=headers,
    )


    if status_code >= 400:

        raise RuntimeError(
            f"Safaricom OAuth failed: {response}"
        )


    access_token = response.get(
        "access_token"
    )

    if not access_token:

        print(
            "OAuth response did not contain "
            "an access token."
        )

        raise RuntimeError(
            "Safaricom did not return an access token."
        )

    print(
        "M-PESA OAUTH SUCCESS"
    )

    print(
        "Access token received successfully."
    )

    print(
        "======================================"
    )

    return access_token


MPESA_TRANSACTION_DESCRIPTION = os.getenv(
    "MPESA_TRANSACTION_DESCRIPTION",
    "Ramon's Marketplace Booking"
)
print("")
print("======================================")
print("M-PESA CONFIGURATION CHECK")
print("======================================")

print(
    "MPESA_BASE_URL:",
    MPESA_BASE_URL
)

print(
    "MPESA_CONSUMER_KEY:",
    "SET" if MPESA_CONSUMER_KEY else "MISSING"
)

print(
    "MPESA_CONSUMER_SECRET:",
    "SET" if MPESA_CONSUMER_SECRET else "MISSING"
)

print(
    "MPESA_SHORTCODE:",
    MPESA_SHORTCODE
)

print(
    "MPESA_PASSKEY:",
    "SET" if MPESA_PASSKEY else "MISSING"
)

print(
    "MPESA_CALLBACK_URL:",
    MPESA_CALLBACK_URL
)

print(
    "======================================"
)

# ============================================================
# GET BOOKING PAYMENT DATA
# ============================================================

def get_booking_payment_data(
    booking_id
):

    try:

        result = db.session.execute(
            text(
                """
                SELECT
                    payment_status,
                    payment_method,
                    payment_phone,
                    mpesa_receipt,
                    checkout_request_id,
                    merchant_request_id,
                    payment_result_code,
                    payment_result_description,
                    payment_paid_at
                FROM bookings
                WHERE id = :booking_id
                LIMIT 1
                """
            ),
            {
                "booking_id":
                    booking_id
            },
        ).mappings().first()


        if not result:

            return {

                "paymentStatus":
                    "Pending",

                "paymentMethod":
                    None,

                "paymentPhone":
                    None,

                "mpesaReceipt":
                    None,

                "checkoutRequestId":
                    None,

                "merchantRequestId":
                    None,

                "paymentResultCode":
                    None,

                "paymentResultDescription":
                    None,

                "paymentPaidAt":
                    None,
            }


        paid_at = (
            result["payment_paid_at"]
            if result["payment_paid_at"]
            else None
        )


        if hasattr(
            paid_at,
            "isoformat"
        ):

            paid_at = paid_at.isoformat()


        return {

            "paymentStatus":
                result["payment_status"]
                or "Pending",

            "paymentMethod":
                result["payment_method"],

            "paymentPhone":
                result["payment_phone"],

            "mpesaReceipt":
                result["mpesa_receipt"],

            "checkoutRequestId":
                result["checkout_request_id"],

            "merchantRequestId":
                result["merchant_request_id"],

            "paymentResultCode":
                result["payment_result_code"],

            "paymentResultDescription":
                result[
                    "payment_result_description"
                ],

            "paymentPaidAt":
                paid_at,
        }


    except Exception as e:

        print(
            "GET BOOKING PAYMENT DATA ERROR:",
            e
        )

        db.session.rollback()


        return {

            "paymentStatus":
                "Pending",

            "paymentMethod":
                None,

            "paymentPhone":
                None,

            "mpesaReceipt":
                None,

            "checkoutRequestId":
                None,

            "merchantRequestId":
                None,

            "paymentResultCode":
                None,

            "paymentResultDescription":
                None,

            "paymentPaidAt":
                None,
        }


# ============================================================
# UPDATE BOOKING PAYMENT
# ============================================================

def update_booking_payment(
    booking_id,
    payment_status=None,
    payment_method=None,
    payment_phone=None,
    mpesa_receipt=None,
    checkout_request_id=None,
    merchant_request_id=None,
    payment_result_code=None,
    payment_result_description=None,
    payment_paid_at=None,
):

    fields = []


    parameters = {
        "booking_id":
            booking_id
    }


    if payment_status is not None:

        fields.append(
            "payment_status = :payment_status"
        )

        parameters[
            "payment_status"
        ] = payment_status


    if payment_method is not None:

        fields.append(
            "payment_method = :payment_method"
        )

        parameters[
            "payment_method"
        ] = payment_method


    if payment_phone is not None:

        fields.append(
            "payment_phone = :payment_phone"
        )

        parameters[
            "payment_phone"
        ] = payment_phone


    if mpesa_receipt is not None:

        fields.append(
            "mpesa_receipt = :mpesa_receipt"
        )

        parameters[
            "mpesa_receipt"
        ] = mpesa_receipt


    if checkout_request_id is not None:

        fields.append(
            "checkout_request_id = :checkout_request_id"
        )

        parameters[
            "checkout_request_id"
        ] = checkout_request_id


    if merchant_request_id is not None:

        fields.append(
            "merchant_request_id = :merchant_request_id"
        )

        parameters[
            "merchant_request_id"
        ] = merchant_request_id


    if payment_result_code is not None:

        fields.append(
            "payment_result_code = :payment_result_code"
        )

        parameters[
            "payment_result_code"
        ] = payment_result_code


    if payment_result_description is not None:

        fields.append(
            "payment_result_description = :payment_result_description"
        )

        parameters[
            "payment_result_description"
        ] = payment_result_description


    if payment_paid_at is not None:

        fields.append(
            "payment_paid_at = :payment_paid_at"
        )

        parameters[
            "payment_paid_at"
        ] = payment_paid_at


    if not fields:

        return


    try:

        sql = (
            "UPDATE bookings SET "
            + ", ".join(fields)
            + " WHERE id = :booking_id"
        )


        db.session.execute(
            text(sql),
            parameters
        )


        db.session.commit()


    except Exception as e:

        db.session.rollback()


        print(
            "UPDATE BOOKING PAYMENT ERROR:",
            e
        )


        raise


# ============================================================
# SERIALIZE BOOKING
# ============================================================

def serialize_booking(booking, include_customer=False):
    data = {
        "id": booking.id,

        "serviceId": booking.service_id,
        "categoryId": booking.category_id,

        "total": booking.total,
        "status": booking.status,

        "date": booking.date,
        "time": booking.time,

        "address": booking.address,
        "city": booking.city,
        "estate": booking.estate,
        "houseNumber": booking.house_number,

        "houseSize": booking.house_size,
        "cleaningType": booking.cleaning_type,
        "frequency": booking.frequency,
        "notes": booking.notes,
        "extras": booking.extras,

        # PAYMENT INFORMATION
        "paymentMethod": booking.payment_method,
        "paymentStatus": booking.payment_status,
        "paymentPhone": booking.payment_phone,

        # M-PESA TRANSACTION CODE
        "mpesaReceipt": booking.mpesa_receipt,

        "paymentResultCode":
            booking.payment_result_code,

        "paymentResultDescription":
            booking.payment_result_description,

        "paymentPaidAt":
            booking.payment_paid_at.isoformat()
            if booking.payment_paid_at
            else None,
    }

    # -----------------------------------------------------
    # CUSTOMER INFORMATION
    # -----------------------------------------------------

    if include_customer:

        customer = None

        if hasattr(booking, "user"):
            customer = booking.user

        if customer:

            data["customerName"] = (
                getattr(customer, "name", None)
                or "Customer"
            )

            data["customerEmail"] = (
                getattr(customer, "email", None)
                or ""
            )

            data["customerPhone"] = (
                getattr(customer, "phone", None)
                or getattr(
                    customer,
                    "phone_number",
                    None
                )
                or booking.payment_phone
                or ""
            )

        else:

            data["customerName"] = "Customer"
            data["customerEmail"] = ""
            data["customerPhone"] = (
                booking.payment_phone or ""
            )

    return data

# ============================================================
# BOOKING STATUS
# ============================================================

def valid_booking_status(status):

    return status in {

        "Pending",

        "Confirmed",

        "In Progress",

        "Completed",

        "Cancelled",
    }


# ============================================================
# HOME
# ============================================================



# ============================================================
# HEALTH
# ============================================================


# ============================================================

@app.route("/admin/bookings", methods=["GET"])
@jwt_required()
def get_admin_bookings():

    admin, error = admin_required()

    if error:
        return error

    bookings = Booking.query.order_by(
        Booking.id.desc()
    ).all()

    return jsonify({
        "bookings": [
            serialize_booking(
                booking,
                include_customer=True
            )
            for booking in bookings
        ]
    }), 200


@jwt_required()
def update_profile():

    try:

        current_user = get_current_user()


        if not current_user:

            return jsonify({

                "message":
                    "User account not found.",

            }), 404


        data = request.get_json(
            silent=True
        ) or {}


        name = str(
            data.get(
                "name",
                ""
            )
        ).strip()


        email = str(
            data.get(
                "email",
                ""
            )
        ).strip().lower()


        phone = str(
            data.get(
                "phone",
                ""
            )
        ).strip()


        if not name:

            return jsonify({

                "message":
                    "Full name is required.",

            }), 400


        if not email:

            return jsonify({

                "message":
                    "Email address is required.",

            }), 400


        if not phone:

            return jsonify({

                "message":
                    "Phone number is required.",

            }), 400


        existing_user = User.query.filter(
            User.email == email,
            User.id != current_user.id
        ).first()


        if existing_user:

            return jsonify({

                "message":
                    "That email address is already in use.",

            }), 409


        current_user.name = name

        current_user.email = email

        current_user.phone = phone


        db.session.commit()


        return jsonify({

            "message":
                "Profile updated successfully.",

            "user": {

                "id":
                    current_user.id,

                "name":
                    current_user.name,

                "email":
                    current_user.email,

                "phone":
                    current_user.phone,

                "role":
                    current_user.role,
            }

        }), 200


    except Exception as e:

        db.session.rollback()


        print(
            "PROFILE UPDATE ERROR:",
            e
        )


        return jsonify({

            "message":
                "Unable to update profile.",

            "error":
                str(e),

        }), 500



        return jsonify({

            "message":
                "Unable to change password.",

            "error":
                str(e),

        }), 500


@app.route(
    "/admin/bookings/<int:id>/verify-payment",
    methods=["PUT"]
)
@jwt_required()
def verify_mpesa_payment(id):

    try:

        # ======================================================
        # ADMIN CHECK
        # ======================================================

        admin, error = admin_required()

        if error:
            return error

        # ======================================================
        # FIND BOOKING
        # ======================================================

        booking = db.session.get(
            Booking,
            id
        )

        if not booking:

            return jsonify({
                "message":
                    "Booking not found."
            }), 404

        # ======================================================
        # REQUEST DATA
        # ======================================================

        data = request.get_json(
            silent=True
        ) or {}

        action = str(
            data.get(
                "action",
                "verify"
            )
        ).strip().lower()

        # ======================================================
        # VERIFY
        # ======================================================

        if action == "verify":

            booking.payment_status = (
                "Paid"
            )

            booking.payment_result_code = (
                "0"
            )

            booking.payment_result_description = (
                "M-PESA Till payment verified by administrator."
            )

            booking.payment_paid_at = (
                datetime.now(
                    ZoneInfo(
                        "Africa/Nairobi"
                    )
                )
            )

            db.session.commit()

            return jsonify({

                "message":
                    "M-PESA payment verified successfully.",

                "booking":
                    serialize_booking(
                        booking,
                        include_customer=True
                    )

            }), 200

        # ======================================================
        # REJECT
        # ======================================================

        if action == "reject":

            booking.payment_status = (
                "Failed"
            )

            booking.payment_result_code = (
                "REJECTED"
            )

            booking.payment_result_description = (
                data.get(
                    "reason"
                )
                or
                "M-PESA payment rejected by administrator."
            )

            db.session.commit()

            return jsonify({

                "message":
                    "M-PESA payment rejected.",

                "booking":
                    serialize_booking(
                        booking,
                        include_customer=True
                    )

            }), 200

        # ======================================================
        # INVALID ACTION
        # ======================================================

        return jsonify({

            "message":
                "Invalid payment verification action.",

            "allowedActions": [
                "verify",
                "reject"
            ]

        }), 400

    except Exception as e:

        db.session.rollback()

        print(
            "VERIFY PAYMENT ERROR:",
            str(e)
        )

        return jsonify({

            "message":
                "Failed to update payment status.",

            "error":
                str(e)

        }), 500


# ============================================================
# M-PESA STK PUSH
# ============================================================

@app.route(
    "/mpesa/stkpush",
    methods=["POST"]
)
@app.route(
    "/api/mpesa/stk-push",
    methods=["POST"]
)
@jwt_required()
def mpesa_stkpush():

    try:

        current_user = get_current_user()


        if not current_user:

            return jsonify({

                "message":
                    "User not found. Please log in again.",

            }), 404


        data = request.get_json(
            silent=True
        ) or {}


        booking_id = data.get(
            "bookingId"
        )


        try:

            booking_id = int(
                booking_id
            )

        except (
            TypeError,
            ValueError
        ):

            return jsonify({

                "message":
                    "A valid bookingId is required.",

            }), 400


        booking = db.session.get(
            Booking,
            booking_id
        )


        if not booking:

            return jsonify({

                "message":
                    "Booking not found.",

            }), 404


        if booking.user_id != current_user.id:

            return jsonify({

                "message":
                    "You are not allowed to pay for this booking.",

            }), 403


        payment = get_booking_payment_data(
            booking.id
        )


        if payment["paymentStatus"] == "Paid":

            return jsonify({

                "message":
                    "This booking has already been paid.",

                "booking":
                    serialize_booking(
                        booking,
                        True
                    ),

            }), 400


        phone_raw = (
            data.get("phone")
            or payment["paymentPhone"]
        )


        try:

            phone = normalize_phone(
                phone_raw
            )

        except ValueError as e:

            return jsonify({

                "message":
                    str(e),

            }), 400


        missing = [

            name

            for name, value in {

                "MPESA_CONSUMER_KEY":
                    MPESA_CONSUMER_KEY,

                "MPESA_CONSUMER_SECRET":
                    MPESA_CONSUMER_SECRET,

                "MPESA_SHORTCODE":
                    MPESA_SHORTCODE,

                "MPESA_PASSKEY":
                    MPESA_PASSKEY,

                "MPESA_CALLBACK_URL":
                    MPESA_CALLBACK_URL,

            }.items()

            if not value
        ]


        if missing:

            return jsonify({

                "message":
                    "M-PESA is not fully configured.",

                "missing":
                    missing,

            }), 500


        amount = int(
            round(
                float(
                    booking.total or 0
                )
            )
        )


        if amount <= 0:

            return jsonify({

                "message":
                    "Booking amount must be greater than zero.",

            }), 400


        timestamp = mpesa_timestamp()


        token = get_mpesa_access_token()


        payload = {

            "BusinessShortCode":
                MPESA_SHORTCODE,

            "Password":
                mpesa_password(
                    timestamp
                ),

            "Timestamp":
                timestamp,

            "TransactionType":
                "CustomerPayBillOnline",

            "Amount":
                amount,

            "PartyA":
                phone,

            "PartyB":
                MPESA_SHORTCODE,

            "PhoneNumber":
                phone,

            "CallBackURL":
                MPESA_CALLBACK_URL,

            "AccountReference":
                f"{MPESA_ACCOUNT_REFERENCE}-{booking.id}",

            "TransactionDesc":
                f"{MPESA_TRANSACTION_DESCRIPTION} #{booking.id}",
        }


        response_data, status_code = (
            http_json_request(
                


                f"{MPESA_BASE_URL}"
                "/mpesa/stkpush/v1/processrequest",

                method="POST",

                headers={

                    "Authorization":
                        f"Bearer {token}",

                    "Content-Type":
                        "application/json",
                },

                payload=payload,
            )
        )


        if status_code >= 400:

            update_booking_payment(

                booking.id,

                payment_status="Failed",

                payment_method="mpesa",

                payment_phone=phone,

                payment_result_code=str(
                    response_data.get(
                        "errorCode",
                        status_code
                    )
                ),

                payment_result_description=str(
                    response_data.get(
                        "errorMessage",
                        "M-PESA STK Push failed."
                    )
                ),
            )


            return jsonify({

                "message":
                    "M-PESA STK Push failed.",

                "error":
                    response_data,

            }), 502


        merchant_id = response_data.get(
            "MerchantRequestID"
        )


        checkout_id = response_data.get(
            "CheckoutRequestID"
        )


        response_code = response_data.get(
            "ResponseCode"
        )


        response_description = (
            response_data.get(
                "ResponseDescription"
            )
        )


        if response_code not in (
            None,
            "0",
            0
        ):

            update_booking_payment(

                booking.id,

                payment_status="Failed",

                payment_method="mpesa",

                payment_phone=phone,

                checkout_request_id=checkout_id,

                merchant_request_id=merchant_id,

                payment_result_code=str(
                    response_code
                ),

                payment_result_description=(
                    response_description
                    or
                    "STK Push rejected."
                ),
            )


            return jsonify({

                "message":
                    "M-PESA STK Push request was rejected.",

                "response":
                    response_data,

            }), 502


        update_booking_payment(

            booking.id,

            payment_status="Processing",

            payment_method="mpesa",

            payment_phone=phone,

            checkout_request_id=checkout_id,

            merchant_request_id=merchant_id,

            payment_result_code=str(
                response_code
                if response_code is not None
                else 0
            ),

            payment_result_description=(
                response_description
                or
                "STK Push sent."
            ),
        )


        return jsonify({

            "message":
                "M-PESA payment request sent to your phone.",

            "bookingId":
                booking.id,

            "merchantRequestId":
                merchant_id,

            "checkoutRequestId":
                checkout_id,

            "customerMessage":
                response_data.get(
                    "CustomerMessage"
                )
                or
                "Please check your phone and enter your M-PESA PIN.",

        }), 200


    except Exception as e:

        db.session.rollback()


        print(
            "M-PESA STK PUSH ERROR:",
            e
        )


        return jsonify({

            "message":
                "Could not start M-PESA payment.",

            "error":
                str(e),

        }), 500


# ============================================================
# M-PESA CALLBACK
# ============================================================

@app.route(
    "/mpesa/callback",
    methods=["POST"]
)
@app.route(
    "/api/mpesa/callback",
    methods=["POST"]
)
def mpesa_callback():

    try:

        data = request.get_json(
            silent=True
        ) or {}


        stk = (
            data
            .get("Body", {})
            .get("stkCallback", {})
        )


        merchant_id = stk.get(
            "MerchantRequestID"
        )


        checkout_id = stk.get(
            "CheckoutRequestID"
        )


        result_code = stk.get(
            "ResultCode"
        )


        result_desc = stk.get(
            "ResultDesc"
        )


        if not checkout_id:

            return jsonify({

                "ResultCode":
                    0,

                "ResultDesc":
                    "Callback received.",

            }), 200


        # ----------------------------------------------------
        # Find booking
        # ----------------------------------------------------

        row = db.session.execute(
            text(
                """
                SELECT id
                FROM bookings
                WHERE checkout_request_id = :checkout_id
                LIMIT 1
                """
            ),
            {
                "checkout_id":
                    checkout_id
            }
        ).first()


        if not row:

            print(
                "M-PESA CALLBACK: "
                "booking not found:",
                checkout_id
            )


            return jsonify({

                "ResultCode":
                    0,

                "ResultDesc":
                    "Callback received.",

            }), 200


        booking_id = row[0]


        # ----------------------------------------------------
        # Metadata
        # ----------------------------------------------------

        items = (
            stk
            .get(
                "CallbackMetadata",
                {}
            )
            .get(
                "Item",
                []
            )
        )


        metadata = {

            item.get("Name"):
                item.get("Value")

            for item in items

            if item.get("Name")
        }


        receipt = metadata.get(
            "MpesaReceiptNumber"
        )


        phone = None


        if metadata.get(
            "PhoneNumber"
        ):

            try:

                phone = normalize_phone(
                    metadata.get(
                        "PhoneNumber"
                    )
                )

            except ValueError:

                phone = str(
                    metadata.get(
                        "PhoneNumber"
                    )
                )


        # ----------------------------------------------------
        # SUCCESSFUL PAYMENT
        # ----------------------------------------------------

        if str(result_code) == "0":

            paid_at = datetime.now(
                ZoneInfo("Africa/Nairobi")
            ).replace(
                tzinfo=None
            )


            update_booking_payment(

                booking_id,

                payment_status="Paid",

                payment_method="mpesa",

                payment_phone=phone,

                mpesa_receipt=receipt,

                checkout_request_id=checkout_id,

                merchant_request_id=merchant_id,

                payment_result_code="0",

                payment_result_description=(
                    result_desc
                    or
                    "Payment successful."
                ),

                payment_paid_at=paid_at,
            )


            print(
                "======================================"
            )


            print(
                "M-PESA PAYMENT SUCCESSFUL"
            )


            print(
                f"Booking ID: {booking_id}"
            )


            print(
                f"M-Pesa Receipt: {receipt}"
            )


            print(
                "======================================"
            )


        # ----------------------------------------------------
        # FAILED PAYMENT
        # ----------------------------------------------------

        else:

            update_booking_payment(

                booking_id,

                payment_status="Failed",

                payment_method="mpesa",

                payment_phone=phone,

                checkout_request_id=checkout_id,

                merchant_request_id=merchant_id,

                payment_result_code=str(
                    result_code
                ),

                payment_result_description=(
                    result_desc
                    or
                    "M-PESA payment failed."
                ),
            )


        return jsonify({

            "ResultCode":
                0,

            "ResultDesc":
                "Callback processed successfully.",

        }), 200


    except Exception as e:

        db.session.rollback()


        print(
            "M-PESA CALLBACK ERROR:",
            e
        )


        # Always acknowledge callback
        return jsonify({

            "ResultCode":
                0,

            "ResultDesc":
                "Callback received.",

        }), 200


# ============================================================
# M-PESA PAYMENT STATUS
# ============================================================

@app.route(
    "/mpesa/status/<int:booking_id>",
    methods=["GET"]
)
@jwt_required()
def mpesa_payment_status(
    booking_id
):

    try:

        current_user = get_current_user()


        if not current_user:

            return jsonify({

                "message":
                    "User not found. Please log in again.",

            }), 404


        booking = db.session.get(
            Booking,
            booking_id
        )


        if not booking:

            return jsonify({

                "message":
                    "Booking not found.",

            }), 404


        if (
            booking.user_id != current_user.id
            and
            str(current_user.role or "").lower()
            != "admin"
        ):

            return jsonify({

                "message":
                    "You are not allowed to view this payment.",

            }), 403


        return jsonify({

            "bookingId":
                booking.id,

            **get_booking_payment_data(
                booking.id
            ),

        }), 200


    except Exception as e:

        print(
            "M-PESA STATUS ERROR:",
            e
        )


        return jsonify({

            "message":
                "Failed to check payment status.",

            "error":
                str(e),

        }), 500


# ============================================================
# ADMIN - GET ALL BOOKINGS
# ============================================================



# ============================================================
# ADMIN - GET ONE BOOKING
# ============================================================

@app.route(
    "/admin/bookings/<int:id>",
    methods=["GET"]
)
@jwt_required()
def admin_get_booking(id):

    try:

        admin, error = admin_required()


        if error:

            return error


        booking = db.session.get(
            Booking,
            id
        )


        if not booking:

            return jsonify({

                "message":
                    "Booking not found.",

            }), 404


        return jsonify(
            serialize_booking(
                booking,
                include_customer=True
            )
        ), 200


    except Exception as e:

        print(
            "ADMIN GET BOOKING ERROR:",
            e
        )


        return jsonify({

            "message":
                "Failed to load booking.",

            "error":
                str(e),

        }), 500


# ============================================================
# ADMIN - UPDATE BOOKING STATUS
# ============================================================

@app.route(
    "/admin/bookings/<int:booking_id>",
    methods=["PUT"]
)
@jwt_required()
def update_booking_status(
    booking_id
):

    try:

        admin, error = admin_required()


        if error:

            return error


        booking = db.session.get(
            Booking,
            booking_id
        )


        if not booking:

            return jsonify({

                "message":
                    "Booking not found.",

            }), 404


        data = request.get_json(
            silent=True
        )


        if not data:

            return jsonify({

                "message":
                    "No data received.",

            }), 400


        status = data.get(
            "status"
        )


        if not status:

            return jsonify({

                "message":
                    "Booking status is required.",

            }), 400


        status = str(
            status
        ).strip()


        if not valid_booking_status(
            status
        ):

            return jsonify({

                "message":
                    "Invalid booking status.",

                "allowedStatuses": [

                    "Pending",

                    "Confirmed",

                    "In Progress",

                    "Completed",

                    "Cancelled",
                ],

            }), 400


        old_status = booking.status

        booking.status = status


        db.session.commit()


        print(
            "======================================"
        )


        print(
            "BOOKING STATUS UPDATED"
        )


        print(
            f"Booking ID: {booking.id}"
        )


        print(
            f"Old Status: {old_status}"
        )


        print(
            f"New Status: {status}"
        )


        print(
            f"Updated By: {admin.email}"
        )


        print(
            "======================================"
        )


        return jsonify({

            "message":
                "Booking status updated successfully.",

            "deleted":
                False,

            "booking":
                serialize_booking(
                    booking,
                    include_customer=True
                ),

        }), 200


    except Exception as e:

        db.session.rollback()


        print(
            "UPDATE BOOKING ERROR:",
            e
        )


        return jsonify({

            "message":
                "Failed to update booking status.",

            "error":
                str(e),

        }), 500


# ============================================================
# ADMIN - DELETE BOOKING
# ============================================================

@app.route(
    "/admin/bookings/<int:booking_id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_booking(
    booking_id
):

    try:

        admin, error = admin_required()


        if error:

            return error


        booking = db.session.get(
            Booking,
            booking_id
        )


        if not booking:

            return jsonify({

                "message":
                    "Booking not found.",

            }), 404


        booking_id_deleted = booking.id


        db.session.delete(
            booking
        )


        db.session.commit()


        print(
            f"BOOKING DELETED: "
            f"{booking_id_deleted} "
            f"by {admin.email}"
        )


        return jsonify({

            "message":
                "Booking deleted successfully.",

            "bookingId":
                booking_id_deleted,

        }), 200


    except Exception as e:

        db.session.rollback()


        print(
            "DELETE BOOKING ERROR:",
            e
        )


        return jsonify({

            "message":
                "Failed to delete booking.",

            "error":
                str(e),

        }), 500


# ============================================================
# ADMIN - GET USERS
# ============================================================

@app.route(
    "/admin/users",
    methods=["GET"]
)
@jwt_required()
def admin_users():

    try:

        admin, error = admin_required()


        if error:

            return error


        users = User.query.order_by(
            User.id.desc()
        ).all()


        return jsonify([

            {

                "id":
                    user.id,

                "name":
                    user.name,

                "email":
                    user.email,

                "phone":
                    getattr(
                        user,
                        "phone",
                        None
                    ),

                "role":
                    user.role,

            }

            for user in users

        ]), 200


    except Exception as e:

        print(
            "ADMIN USERS ERROR:",
            e
        )


        return jsonify({

            "message":
                "Failed to load users.",

            "error":
                str(e),

        }), 500


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@app.route(
    "/admin/dashboard",
    methods=["GET"]
)
@jwt_required()
def admin_dashboard():

    try:

        admin, error = admin_required()


        if error:

            return error


        total_bookings = (
            Booking.query.count()
        )


        pending_bookings = (
            Booking.query.filter_by(
                status="Pending"
            ).count()
        )


        confirmed_bookings = (
            Booking.query.filter_by(
                status="Confirmed"
            ).count()
        )


        in_progress_bookings = (
            Booking.query.filter_by(
                status="In Progress"
            ).count()
        )


        completed_bookings = (
            Booking.query.filter_by(
                status="Completed"
            ).count()
        )


        cancelled_bookings = (
            Booking.query.filter_by(
                status="Cancelled"
            ).count()
        )


        total_users = (
            User.query.count()
        )


        # ----------------------------------------------------
        # Revenue comes ONLY from successfully paid bookings.
        # ----------------------------------------------------

        total_revenue = db.session.execute(
            text(
                """
                SELECT COALESCE(
                    SUM(total),
                    0
                )
                FROM bookings
                WHERE payment_status = 'Paid'
                AND status != 'Cancelled'
                """
            )
        ).scalar() or 0


        total_revenue = float(
            total_revenue
        )


        return jsonify({

            "totalBookings":
                total_bookings,

            "pendingBookings":
                pending_bookings,

            "confirmedBookings":
                confirmed_bookings,

            "inProgressBookings":
                in_progress_bookings,

            "completedBookings":
                completed_bookings,

            "cancelledBookings":
                cancelled_bookings,

            "totalUsers":
                total_users,

            "totalRevenue":
                total_revenue,

        }), 200


    except Exception as e:

        print(
            "ADMIN DASHBOARD ERROR:",
            e
        )


        return jsonify({

            "message":
                "Failed to load dashboard.",

            "error":
                str(e),

        }), 500


# ============================================================
# DATABASE INITIALIZATION
# ============================================================

def initialize_database():

    with app.app_context():

        try:

            # ------------------------------------------------
            # Create missing tables
            # ------------------------------------------------

            db.create_all()


            # ------------------------------------------------
            # DEFAULT SERVICES
            # ------------------------------------------------

            default_services = [
                {
                    "title": "Cleaning",
                    "description": "Professional home, office and school cleaning services.",
                    "price": 1500,
                    "location": "Nairobi",
                    "provider": "Ramon's Marketplace",
                },
                {
                    "title": "Laundry",
                    "description": "Professional washing, ironing, folding and laundry services.",
                    "price": 800,
                    "location": "Nairobi",
                    "provider": "Ramon's Marketplace",
                },
                {
                    "title": "Plumbing",
                    "description": "Reliable plumbing repair, installation and maintenance services.",
                    "price": 1000,
                    "location": "Nairobi",
                    "provider": "Ramon's Marketplace",
                },
                {
                    "title": "Electrical",
                    "description": "Professional electrical repair, installation and maintenance services.",
                    "price": 1500,
                    "location": "Nairobi",
                    "provider": "Ramon's Marketplace",
                },
                {
                    "title": "Gardening",
                    "description": "Lawn maintenance, garden cleaning and landscaping services.",
                    "price": 1000,
                    "location": "Nairobi",
                    "provider": "Ramon's Marketplace",
                },
                {
                    "title": "Painting",
                    "description": "Interior, exterior and room painting services.",
                    "price": 3000,
                    "location": "Nairobi",
                    "provider": "Ramon's Marketplace",
                },
                {
                    "title": "Moving",
                    "description": "House and office moving, packing and relocation services.",
                    "price": 5000,
                    "location": "Nairobi",
                    "provider": "Ramon's Marketplace",
                },
            ]

            services_created = 0

            for service_data in default_services:

                existing_service = Service.query.filter_by(
                    title=service_data["title"]
                ).first()

                if not existing_service:

                    db.session.add(
                        Service(**service_data)
                    )

                    services_created += 1

            if services_created:

                db.session.commit()

                print(
                    f"DEFAULT SERVICES CREATED: {services_created}"
                )

            else:

                print(
                    "DEFAULT SERVICES ALREADY EXIST"
                )


            # ------------------------------------------------
            # Update old tables
            # ------------------------------------------------

            ensure_user_columns()

            ensure_payment_columns()


            print(
                "======================================"
            )

            print(
                "DATABASE INITIALIZED SUCCESSFULLY"
            )

            print(
                "======================================"
            )


            # ------------------------------------------------
            # DEFAULT ADMIN
            # ------------------------------------------------

            admin_email = (
                os.getenv(
                    "ADMIN_EMAIL",
                    "admin@ramonsmarketplace.com"
                )
                .lower()
                .strip()
            )


            admin_password = os.getenv(
                "ADMIN_PASSWORD",
                "ChangeThisAdminPassword123!"
            )


            admin = User.query.filter_by(
                email=admin_email
            ).first()


            if not admin:

                admin = User(

                    name="Ramon Administrator",

                    email=admin_email,

                    password=generate_password_hash(
                        admin_password
                    ),

                    role="admin",

                )


                db.session.add(
                    admin
                )


                db.session.commit()


                print(
                    "DEFAULT ADMIN CREATED"
                )


                print(
                    f"Email: {admin_email}"
                )


                print(
                    "Password: "
                    "[use ADMIN_PASSWORD if configured]"
                )


            else:

                if str(
                    admin.role or ""
                ).lower() != "admin":

                    admin.role = "admin"

                    db.session.commit()


                    print(
                        "EXISTING ADMIN ACCOUNT "
                        "PROMOTED TO ADMIN"
                    )


        except Exception as e:

            db.session.rollback()


            print(
                "DATABASE INITIALIZATION ERROR:",
                e
            )


            raise


# ============================================================
# INITIALIZE DATABASE
# ============================================================

initialize_database()


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    print(
        "======================================"
    )


    print(
        "RAMON'S SERVICE MARKETPLACE"
    )


    print(
        "======================================"
    )


    print(
        "Backend:"
        " http://127.0.0.1:5000"
    )


    print(
        "Frontend:"
        " http://localhost:5173"
    )


    print(
        "Health:"
        " http://127.0.0.1:5000/health"
    )


    print(
        "Admin:"
        " admin@ramonsmarketplace.com"
    )


    print(
        "======================================"
    )


    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True,

    )


# ============================================================
# M-PESA STK PUSH
# ============================================================


    print(
        "======================================"
    )


    print(
        "RAMON'S SERVICE MARKETPLACE"
    )


    print(
        "======================================"
    )


    print(
        "Backend:"
        " http://127.0.0.1:5000"
    )


    print(
        "Frontend:"
        " http://localhost:5173"
    )


    print(
        "Health:"
        " http://127.0.0.1:5000/health"
    )


    print(
        "Admin:"
        " admin@ramonsmarketplace.com"
    )


    print(
        "======================================"
    )


    app.run(

        host="127.0.0.1",

        port=5000,

        debug=True,

    )