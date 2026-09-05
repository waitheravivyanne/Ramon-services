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


# =====================================================
# APP CONFIGURATION
# =====================================================

app = Flask(__name__)

# -----------------------------------------------------
# DATABASE
# -----------------------------------------------------

app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
    "DATABASE_URL",
    "sqlite:///service.db"
)

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False


# -----------------------------------------------------
# JWT
# -----------------------------------------------------

# IMPORTANT:
# Use the same secret every time the server starts.
#
# In production, put JWT_SECRET_KEY in your .env file.
# Example:
# JWT_SECRET_KEY=your-long-random-secret
#
# Do NOT change this while users have active tokens.

app.config["JWT_SECRET_KEY"] = os.getenv(
    "JWT_SECRET_KEY",
    "change-this-secret-key-in-production"
)

app.config["JWT_TOKEN_LOCATION"] = ["headers"]
app.config["JWT_HEADER_NAME"] = "Authorization"
app.config["JWT_HEADER_TYPE"] = "Bearer"


# -----------------------------------------------------
# CORS
# -----------------------------------------------------

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173",
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


# -----------------------------------------------------
# INITIALIZE EXTENSIONS
# -----------------------------------------------------

db.init_app(app)

jwt = JWTManager(app)


# =====================================================
# JWT ERROR HANDLERS
# =====================================================

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
    print("======================================")
    print("JWT REVOKED")
    print("======================================")

    return jsonify({
        "message": "Your authentication token has been revoked.",
    }), 401


@jwt.needs_fresh_token_loader
def needs_fresh_token_callback(jwt_header, jwt_payload):
    return jsonify({
        "message": "A fresh authentication token is required.",
    }), 401


@jwt.token_verification_failed_loader
def token_verification_failed_callback(jwt_header, jwt_payload):
    print("======================================")
    print("JWT VERIFICATION FAILED")
    print("PAYLOAD:", jwt_payload)
    print("======================================")

    return jsonify({
        "message": "Token verification failed.",
    }), 401


# =====================================================
# CATEGORY NAMES
# =====================================================

CATEGORY_NAMES = {

    # -------------------------
    # CLEANING
    # -------------------------

    101: "House Cleaning",
    102: "Office Cleaning",
    103: "Window Cleaning",
    104: "Carpet Cleaning",
    105: "Sofa Cleaning",

    # -------------------------
    # LAUNDRY
    # -------------------------

    201: "Wash & Fold",
    202: "Ironing",
    203: "Dry Cleaning",

    # -------------------------
    # PLUMBING
    # -------------------------

    301: "Leak Repair",
    302: "Blocked Drain",
    303: "Pipe Installation",

    # -------------------------
    # ELECTRICAL
    # -------------------------

    401: "Electrical Repair",
    402: "Socket Installation",
    403: "Lighting Installation",

    # -------------------------
    # GARDEN
    # -------------------------

    501: "Lawn Maintenance",
    502: "Garden Cleaning",
    503: "Landscaping",

    # -------------------------
    # PAINTING
    # -------------------------

    601: "Interior Painting",
    602: "Exterior Painting",
    603: "Room Painting",

    # -------------------------
    # MOVING
    # -------------------------

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


# =====================================================
# HELPER FUNCTIONS
# =====================================================

def get_current_user():

    """
    Gets the currently authenticated user from
    the JWT token.
    """

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

    return db.session.get(User, user_id)


# =====================================================
# ADMIN CHECK
# =====================================================

def admin_required():

    user = get_current_user()

    if not user:

        return None, (
            jsonify({
                "message": "User not found. Please log in again.",
            }),
            404,
        )

    if str(user.role).lower() != "admin":

        return None, (
            jsonify({
                "message": "Admin access required.",
            }),
            403,
        )

    return user, None


# =====================================================
# PARSE EXTRAS
# =====================================================

def parse_extras(extras_value):

    if not extras_value:
        return []

    if isinstance(extras_value, list):
        return extras_value

    try:

        parsed = json.loads(extras_value)

        if isinstance(parsed, list):
            return parsed

        return []

    except (
        json.JSONDecodeError,
        TypeError
    ):

        return []


# =====================================================
# SERIALIZE BOOKING
# =====================================================

def serialize_booking(
    booking,
    include_customer=False
):

    service = db.session.get(
        Service,
        booking.service_id
    )

    result = {

        "id": booking.id,

        "userId": booking.user_id,

        "serviceId": booking.service_id,

        "serviceName": (
            service.title
            if service
            else "Unknown Service"
        ),

        "categoryId": booking.category_id,

        "categoryName": get_category_name(
            booking.category_id
        ),

        "total": float(
            booking.total
        ) if booking.total is not None else 0,

        "status": booking.status or "Pending",

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

        "extras": parse_extras(
            booking.extras
        ),
    }

    # -------------------------------------------------
    # CUSTOMER INFORMATION
    # -------------------------------------------------

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

        # Nested version
        result["customer"] = {

            "id": user.id
            if user
            else None,

            "name": customer_name,

            "email": customer_email,
        }

        # Top-level versions.
        # These make the response compatible with
        # your current AdminDashboard.jsx.

        result["customerName"] = customer_name

        result["customerEmail"] = customer_email

    return result


# =====================================================
# VALID BOOKING STATUS
# =====================================================

def valid_booking_status(status):

    return status in {
        "Pending",
        "Confirmed",
        "In Progress",
        "Completed",
        "Cancelled",
    }


# =====================================================
# HOME
# =====================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "message": "Ramon's Service Marketplace API is running.",
    }), 200


# =====================================================
# HEALTH CHECK
# =====================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "ok",
        "message": "Backend is running.",
    }), 200


# =====================================================
# REGISTER
# =====================================================

@app.route("/register", methods=["POST"])
def register():

    try:

        data = request.get_json(
            silent=True
        )

        if not data:

            return jsonify({
                "message": "No data received.",
            }), 400

        name = str(
            data.get("name", "")
        ).strip()

        email = str(
            data.get("email", "")
        ).lower().strip()

        password = str(
            data.get("password", "")
        )

        if not name:

            return jsonify({
                "message": "Name is required.",
            }), 400

        if not email:

            return jsonify({
                "message": "Email is required.",
            }), 400

        if not password:

            return jsonify({
                "message": "Password is required.",
            }), 400

        if len(password) < 6:

            return jsonify({
                "message": "Password must be at least 6 characters.",
            }), 400

        existing_user = User.query.filter_by(
            email=email
        ).first()

        if existing_user:

            return jsonify({
                "message": "Email already exists.",
            }), 400

        user = User(

            name=name,

            email=email,

            password=generate_password_hash(
                password
            ),

            role="customer",
        )

        db.session.add(user)

        db.session.commit()

        return jsonify({

            "message": "Account created successfully.",

            "user": {

                "id": user.id,

                "name": user.name,

                "email": user.email,

                "role": user.role,
            }

        }), 201

    except Exception as e:

        db.session.rollback()

        print("REGISTER ERROR:", str(e))

        return jsonify({

            "message": "Registration failed.",

            "error": str(e),

        }), 500


# =====================================================
# LOGIN
# =====================================================

@app.route("/login", methods=["POST"])
def login():

    try:

        data = request.get_json(
            silent=True
        )

        if not data:

            return jsonify({
                "message": "No data received.",
            }), 400

        email = str(
            data.get("email", "")
        ).lower().strip()

        password = str(
            data.get("password", "")
        )

        if not email or not password:

            return jsonify({
                "message": "Email and password are required.",
            }), 400

        user = User.query.filter_by(
            email=email
        ).first()

        if not user:

            return jsonify({
                "message": "Account not found. Please register first.",
            }), 401

        if not check_password_hash(
            user.password,
            password
        ):

            return jsonify({
                "message": "Incorrect password.",
            }), 401

        # ------------------------------------------------
        # NORMALIZE ROLE
        # ------------------------------------------------

        role = str(
            user.role or "customer"
        ).lower().strip()

        # ------------------------------------------------
        # CREATE JWT
        # ------------------------------------------------

        token = create_access_token(

            identity={
                "id": user.id,
                "role": role,
            }

        )

        print(
            f"LOGIN SUCCESS: "
            f"user={user.email}, "
            f"id={user.id}, "
            f"role={role}"
        )

        return jsonify({

            "message": "Login successful.",

            "token": token,

            "user": {

                "id": user.id,

                "name": user.name,

                "email": user.email,

                "role": role,

            }

        }), 200

    except Exception as e:

        print("LOGIN ERROR:", str(e))

        return jsonify({

            "message": "Login failed.",

            "error": str(e),

        }), 500


# =====================================================
# PROFILE
# =====================================================

@app.route("/profile", methods=["GET"])
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

                "id": current_user.id,

                "name": current_user.name,

                "email": current_user.email,

                "role": current_user.role,

            }

        }), 200

    except Exception as e:

        print("PROFILE ERROR:", str(e))

        return jsonify({

            "message": "Failed to load profile.",

            "error": str(e),

        }), 500


# =====================================================
# GET ALL SERVICES
# =====================================================

@app.route("/services", methods=["GET"])
def get_services():

    try:

        services = Service.query.order_by(
            Service.id.asc()
        ).all()

        return jsonify([

            {

                "id": service.id,

                "name": service.title,

                "title": service.title,

                "description": service.description,

                "price": float(service.price)
                if service.price is not None
                else 0,

                "location": service.location,

                "provider": service.provider,

            }

            for service in services

        ]), 200

    except Exception as e:

        print(
            "GET SERVICES ERROR:",
            str(e)
        )

        return jsonify({

            "message":
            "Failed to load services.",

            "error": str(e),

        }), 500


# =====================================================
# GET ONE SERVICE
# =====================================================

@app.route(
    "/services/<int:id>",
    methods=["GET"]
)
def get_service(id):

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

        "id": service.id,

        "name": service.title,

        "title": service.title,

        "description": service.description,

        "price": float(service.price)
        if service.price is not None
        else 0,

        "location": service.location,

        "provider": service.provider,

    }), 200


# =====================================================
# CREATE BOOKING
# =====================================================

@app.route(
    "/bookings",
    methods=["POST"]
)
@jwt_required()
def create_booking():

    try:

        current_user = get_current_user()

        if not current_user:

            return jsonify({

                "message":
                "User not found. Please log in again.",

            }), 404

        data = request.get_json(
            silent=True
        )

        if not data:

            return jsonify({

                "message":
                "No booking data received.",

            }), 400

        # ------------------------------------------------
        # REQUIRED FIELDS
        # ------------------------------------------------

        service_id = data.get(
            "serviceId"
        )

        category_id = data.get(
            "categoryId"
        )

        total = data.get(
            "total"
        )

        if service_id is None:

            return jsonify({

                "message":
                "Service is required.",

            }), 400

        if category_id is None:

            return jsonify({

                "message":
                "Service category is required.",

            }), 400

        if total is None:

            return jsonify({

                "message":
                "Booking total is required.",

            }), 400

        # ------------------------------------------------
        # VALIDATE SERVICE ID
        # ------------------------------------------------

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

            }), 400

        # ------------------------------------------------
        # VALIDATE TOTAL
        # ------------------------------------------------

        try:

            total = float(total)

        except (
            TypeError,
            ValueError
        ):

            return jsonify({

                "message":
                "Invalid booking total.",

            }), 400

        if total < 0:

            return jsonify({

                "message":
                "Booking total cannot be negative.",

            }), 400

        # ------------------------------------------------
        # CHECK SERVICE
        # ------------------------------------------------

        service = db.session.get(
            Service,
            service_id
        )

        if not service:

            return jsonify({

                "message":
                "Service not found.",

            }), 404

        # ------------------------------------------------
        # EXTRAS
        # ------------------------------------------------

        extras = data.get(
            "extras",
            []
        )

        if not isinstance(
            extras,
            list
        ):

            extras = []

        # ------------------------------------------------
        # CREATE BOOKING
        # ------------------------------------------------

        booking = Booking(

            user_id=current_user.id,

            service_id=service_id,

            category_id=str(
                category_id
            ),

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

            cleaning_type=data.get(
                "cleaningType"
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

        db.session.add(
            booking
        )

        db.session.commit()

        print(
            "======================================"
        )

        print(
            f"NEW ORDER CREATED"
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
            f"Category: "
            f"{get_category_name(category_id)}"
        )

        print(
            f"Total: Ksh {total}"
        )

        print(
            "======================================"
        )

        return jsonify({

            "message":
            "Booking created successfully.",

            "booking":
            serialize_booking(
                booking,
                include_customer=True
            ),

        }), 201

    except Exception as e:

        db.session.rollback()

        print(
            "BOOKING ERROR:",
            str(e)
        )

        return jsonify({

            "message":
            "Failed to create booking.",

            "error": str(e),

        }), 500


# =====================================================
# CUSTOMER - GET OWN BOOKINGS
# =====================================================

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
            str(e)
        )

        return jsonify({

            "message":
            "Failed to load your bookings.",

            "error": str(e),

        }), 500


# =====================================================
# ADMIN - GET ALL BOOKINGS
# =====================================================

@app.route(
    "/admin/bookings",
    methods=["GET"]
)
@jwt_required()
def admin_bookings():

    try:

        admin, error = admin_required()

        if error:

            return error

        bookings = Booking.query.order_by(
            Booking.id.desc()
        ).all()

        result = [

            serialize_booking(
                booking,
                include_customer=True
            )

            for booking in bookings

        ]

        print(
            f"ADMIN BOOKINGS: "
            f"{len(result)} booking(s) found."
        )

        return jsonify(
            result
        ), 200

    except Exception as e:

        print(
            "ADMIN BOOKINGS ERROR:",
            str(e)
        )

        return jsonify({

            "message":
            "Failed to load bookings.",

            "error": str(e),

        }), 500


# =====================================================
# ADMIN - GET ONE BOOKING
# =====================================================

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
            str(e)
        )

        return jsonify({

            "message":
            "Failed to load booking.",

            "error": str(e),

        }), 500


# =====================================================
# ADMIN - UPDATE BOOKING STATUS
# =====================================================

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

        # -------------------------------------------------
        # COMPLETED TASKS ARE AUTOMATICALLY DELETED
        # -------------------------------------------------
        # Once the admin marks a task as Completed, the
        # booking is permanently removed from the database.
        #
        # The frontend can use "deleted": True to remove
        # the task immediately from the admin dashboard.
        # -------------------------------------------------

        if status == "Completed":

            booking_id_deleted = booking.id
            customer_id = booking.user_id

            db.session.delete(booking)
            db.session.commit()

            print(
                "======================================"
            )

            print(
                "BOOKING COMPLETED AND DELETED"
            )

            print(
                f"Booking ID: {booking_id_deleted}"
            )

            print(
                f"Previous Status: {old_status}"
            )

            print(
                f"New Status: {status}"
            )

            print(
                f"Customer ID: {customer_id}"
            )

            print(
                f"Completed By: {admin.email}"
            )

            print(
                "======================================"
            )

            return jsonify({

                "message":
                "Task completed and deleted successfully.",

                "deleted": True,

                "bookingId":
                booking_id_deleted,

                "status":
                "Completed",

            }), 200

        # -------------------------------------------------
        # ALL OTHER STATUSES ARE KEPT
        # -------------------------------------------------

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

            "deleted": False,

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
            str(e)
        )

        return jsonify({

            "message":
            "Failed to update booking status.",

            "error": str(e),

        }), 500


# =====================================================
# ADMIN - DELETE BOOKING
# =====================================================

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
            str(e)
        )

        return jsonify({

            "message":
            "Failed to delete booking.",

            "error": str(e),

        }), 500


# =====================================================
# ADMIN - GET ALL USERS
# =====================================================

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

                "id": user.id,

                "name": user.name,

                "email": user.email,

                "role": user.role,

            }

            for user in users

        ]), 200

    except Exception as e:

        print(
            "ADMIN USERS ERROR:",
            str(e)
        )

        return jsonify({

            "message":
            "Failed to load users.",

            "error": str(e),

        }), 500


# =====================================================
# ADMIN - GET DASHBOARD STATISTICS
# =====================================================

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

        total_bookings = Booking.query.count()

        pending_bookings = Booking.query.filter_by(
            status="Pending"
        ).count()

        confirmed_bookings = Booking.query.filter_by(
            status="Confirmed"
        ).count()

        in_progress_bookings = Booking.query.filter_by(
            status="In Progress"
        ).count()

        completed_bookings = Booking.query.filter_by(
            status="Completed"
        ).count()

        cancelled_bookings = Booking.query.filter_by(
            status="Cancelled"
        ).count()

        total_users = User.query.count()

        total_revenue = 0

        bookings = Booking.query.all()

        for booking in bookings:

            if booking.status != "Cancelled":

                total_revenue += float(
                    booking.total or 0
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
            str(e)
        )

        return jsonify({

            "message":
            "Failed to load dashboard.",

            "error": str(e),

        }), 500


# =====================================================
# CREATE DATABASE
# =====================================================

def initialize_database():

    with app.app_context():

        db.create_all()

        print(
            "======================================"
        )

        print(
            "DATABASE INITIALIZED"
        )

        print(
            "======================================"
        )

        # ---------------------------------------------
        # CREATE DEFAULT ADMIN
        # ---------------------------------------------

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

            # Make sure the configured admin account
            # actually has admin privileges.

            if str(
                admin.role
            ).lower() != "admin":

                admin.role = "admin"

                db.session.commit()

                print(
                    "EXISTING ADMIN ACCOUNT "
                    "PROMOTED TO ADMIN"
                )


# =====================================================
# STARTUP
# =====================================================

initialize_database()


# =====================================================
# RUN SERVER
# =====================================================

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