from flask import Flask, request, jsonify
from flask_cors import CORS

from flask_jwt_extended import (
    JWTManager,
    create_access_token,
    jwt_required,
    get_jwt_identity
)

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

from database import db
from models import User, Service, Booking

import json


# =====================================================
# APP CONFIGURATION
# =====================================================

app = Flask(__name__)

CORS(
    app,
    resources={
        r"/*": {
            "origins": [
                "http://localhost:5173",
                "http://127.0.0.1:5173"
            ]
        }
    },
    supports_credentials=True
)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///service.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["JWT_SECRET_KEY"] = "secret-key-change-this"


db.init_app(app)

jwt = JWTManager(app)


# =====================================================
# HELPER FUNCTIONS
# =====================================================

def get_current_user():

    identity = get_jwt_identity()

    if not identity:
        return None

    user = User.query.get(identity["id"])

    return user


def admin_required():

    user = get_current_user()

    if not user:

        return None, (
            jsonify({
                "message": "User not found."
            }),
            404
        )

    if user.role != "admin":

        return None, (
            jsonify({
                "message": "Admin access required."
            }),
            403
        )

    return user, None


# =====================================================
# HOME
# =====================================================

@app.route("/")
def home():

    return jsonify({
        "message": "Ramon's Service Marketplace API is running."
    })


# =====================================================
# REGISTER
# =====================================================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    if not data:

        return jsonify({
            "message": "No data received."
        }), 400

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:

        return jsonify({
            "message": "Name, email and password are required."
        }), 400

    email = email.lower().strip()

    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:

        return jsonify({
            "message": "Email already exists."
        }), 400

    user = User(
        name=name.strip(),
        email=email,
        password=generate_password_hash(password),
        role="customer"
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({

        "message": "Account created successfully."

    }), 201


# =====================================================
# LOGIN
# =====================================================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    if not data:

        return jsonify({
            "message": "No data received."
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:

        return jsonify({
            "message": "Email and password are required."
        }), 400

    email = email.lower().strip()

    user = User.query.filter_by(
        email=email
    ).first()

    if not user:

        return jsonify({
            "message": "Account not found. Please register first."
        }), 401

    if not check_password_hash(
        user.password,
        password
    ):

        return jsonify({
            "message": "Incorrect password."
        }), 401

    token = create_access_token(

        identity={
            "id": user.id,
            "role": user.role
        }

    )

    return jsonify({

        "token": token,

        "user": {

            "id": user.id,

            "name": user.name,

            "email": user.email,

            "role": user.role

        }

    }), 200


# =====================================================
# PROFILE
# =====================================================

@app.route("/profile", methods=["GET"])
@jwt_required()
def profile():

    current_user = get_current_user()

    if not current_user:

        return jsonify({
            "message": "User not found."
        }), 404

    return jsonify({

        "user": {

            "id": current_user.id,

            "name": current_user.name,

            "email": current_user.email,

            "role": current_user.role

        }

    })


# =====================================================
# GET ALL SERVICES
# =====================================================

@app.route("/services", methods=["GET"])
def get_services():

    services = Service.query.all()

    return jsonify([

        {

            "id": service.id,

            "name": service.title,

            "description": service.description,

            "price": service.price,

            "location": service.location,

            "provider": service.provider

        }

        for service in services

    ])


# =====================================================
# GET ONE SERVICE
# =====================================================

@app.route("/services/<int:id>", methods=["GET"])
def get_service(id):

    service = Service.query.get_or_404(id)

    return jsonify({

        "id": service.id,

        "name": service.title,

        "description": service.description,

        "price": service.price,

        "location": service.location,

        "provider": service.provider

    })


# =====================================================
# CREATE BOOKING
# =====================================================

@app.route("/bookings", methods=["POST"])
@jwt_required()
def create_booking():

    current_user = get_current_user()

    if not current_user:

        return jsonify({
            "message": "User not found."
        }), 404

    data = request.get_json()

    if not data:

        return jsonify({
            "message": "No booking data received."
        }), 400

    service_id = data.get("serviceId")

    if not service_id:

        return jsonify({
            "message": "Service ID is required."
        }), 400

    service = Service.query.get(service_id)

    if not service:

        return jsonify({
            "message": "Service not found."
        }), 404

    try:

        total = float(
            data.get("total", 0)
        )

    except (TypeError, ValueError):

        return jsonify({
            "message": "Invalid total amount."
        }), 400


    # -------------------------------------------------
    # CREATE BOOKING
    # -------------------------------------------------

    booking = Booking(

        user_id=current_user.id,

        service_id=service_id,

        category_id=data.get(
            "categoryId"
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
            data.get(
                "extras",
                []
            )
        )

    )


    db.session.add(booking)

    db.session.commit()


    return jsonify({

        "message": "Booking created successfully.",

        "booking": {

            "id": booking.id,

            "userId": booking.user_id,

            "serviceId": booking.service_id,

            "categoryId": booking.category_id,

            "total": booking.total,

            "status": booking.status,

            "date": booking.date,

            "time": booking.time

        }

    }), 201


# =====================================================
# GET MY BOOKINGS
# =====================================================

@app.route("/bookings/my", methods=["GET"])
@jwt_required()
def my_bookings():

    current_user = get_current_user()

    if not current_user:

        return jsonify({
            "message": "User not found."
        }), 404

    bookings = Booking.query.filter_by(
        user_id=current_user.id
    ).order_by(
        Booking.id.desc()
    ).all()


    results = []


    for booking in bookings:

        service = Service.query.get(
            booking.service_id
        )


        try:

            extras = json.loads(
                booking.extras
            ) if booking.extras else []

        except (
            json.JSONDecodeError,
            TypeError
        ):

            extras = []


        results.append({

            "id": booking.id,

            "serviceId": booking.service_id,

            "serviceName": (

                service.title

                if service

                else "Unknown Service"

            ),

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

            "extras": extras

        })


    return jsonify(results), 200


# =====================================================
# ADMIN - GET ALL BOOKINGS
# =====================================================

@app.route("/admin/bookings", methods=["GET"])
@jwt_required()
def admin_bookings():

    current_user = get_jwt_identity()

    # ---------------------------------------------
    # Check that the logged-in user is an admin
    # ---------------------------------------------

    if current_user["role"] != "admin":

        return jsonify({
            "message": "Admin access required."
        }), 403


    # ---------------------------------------------
    # Get all bookings
    # ---------------------------------------------

    bookings = Booking.query.order_by(
        Booking.id.desc()
    ).all()


    # ---------------------------------------------
    # Return bookings
    # ---------------------------------------------

    result = []

    for booking in bookings:

        user = User.query.get(
            booking.user_id
        )

        service = Service.query.get(
            booking.service_id
        )


        result.append({

            "id": booking.id,

            "userId": booking.user_id,

            "customerName": (
                user.name
                if user
                else "Unknown"
            ),

            "customerEmail": (
                user.email
                if user
                else "Unknown"
            ),

            "serviceId": booking.service_id,

            "serviceName": (
                service.title
                if service
                else "Unknown Service"
            ),

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

            "extras": (
                json.loads(booking.extras)
                if booking.extras
                else []
            )

        })


    return jsonify(result), 200


# =====================================================
# ADMIN - GET ONE BOOKING
# =====================================================

@app.route(
    "/admin/bookings/<int:id>",
    methods=["GET"]
)
@jwt_required()
def admin_get_booking(id):

    admin, error = admin_required()

    if error:

        return error


    booking = Booking.query.get(id)

    if not booking:

        return jsonify({
            "message": "Booking not found."
        }), 404


    user = User.query.get(
        booking.user_id
    )

    service = Service.query.get(
        booking.service_id
    )


    try:

        extras = json.loads(
            booking.extras
        ) if booking.extras else []

    except (
        json.JSONDecodeError,
        TypeError
    ):

        extras = []


    return jsonify({

        "id": booking.id,


        "customer": {

            "id":
                user.id
                if user
                else None,

            "name":
                user.name
                if user
                else "Unknown",

            "email":
                user.email
                if user
                else "Unknown"

        },


        "service": {

            "id":
                service.id
                if service
                else None,

            "name":
                service.title
                if service
                else "Unknown Service"

        },


        "categoryId":
            booking.category_id,

        "total":
            booking.total,

        "status":
            booking.status,

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
            extras

    }), 200


# =====================================================
# ADMIN - UPDATE BOOKING STATUS
# =====================================================

@app.route(
    "/admin/bookings/<int:booking_id>",
    methods=["PUT"]
)
@jwt_required()
def update_booking_status(booking_id):

    admin, error = admin_required()

    if error:

        return error


    booking = Booking.query.get(
        booking_id
    )

    if not booking:

        return jsonify({
            "message": "Booking not found."
        }), 404


    data = request.get_json()

    if not data:

        return jsonify({
            "message": "No data received."
        }), 400


    new_status = data.get(
        "status"
    )


    allowed_statuses = [

        "Pending",

        "Confirmed",

        "In Progress",

        "Completed",

        "Cancelled"

    ]


    if new_status not in allowed_statuses:

        return jsonify({

            "message":
                "Invalid booking status.",

            "allowedStatuses":
                allowed_statuses

        }), 400


    booking.status = new_status

    db.session.commit()


    return jsonify({

        "message":
            "Booking status updated successfully.",

        "booking": {

            "id":
                booking.id,

            "status":
                booking.status

        }

    }), 200


# =====================================================
# ADMIN - DELETE BOOKING
# =====================================================

@app.route(
    "/admin/bookings/<int:id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_booking(id):

    admin, error = admin_required()

    if error:

        return error


    booking = Booking.query.get(id)

    if not booking:

        return jsonify({
            "message": "Booking not found."
        }), 404


    db.session.delete(
        booking
    )

    db.session.commit()


    return jsonify({

        "message":
            "Booking deleted successfully."

    }), 200


# =====================================================
# ADMIN - DASHBOARD STATISTICS
# =====================================================

@app.route(
    "/admin/dashboard",
    methods=["GET"]
)
@jwt_required()
def admin_dashboard():

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


    completed_bookings = Booking.query.filter_by(
        status="Completed"
    ).count()


    cancelled_bookings = Booking.query.filter_by(
        status="Cancelled"
    ).count()


    total_customers = User.query.filter_by(
        role="customer"
    ).count()


    total_services = Service.query.count()


    bookings = Booking.query.all()


    total_revenue = sum(

        booking.total

        for booking in bookings

        if booking.status != "Cancelled"

    )


    return jsonify({

        "totalBookings":
            total_bookings,

        "pendingBookings":
            pending_bookings,

        "confirmedBookings":
            confirmed_bookings,

        "completedBookings":
            completed_bookings,

        "cancelledBookings":
            cancelled_bookings,

        "totalCustomers":
            total_customers,

        "totalServices":
            total_services,

        "totalRevenue":
            total_revenue

    }), 200


# =====================================================
# ADD SERVICE
# =====================================================

@app.route(
    "/services",
    methods=["POST"]
)
@jwt_required()
def add_service():

    admin, error = admin_required()

    if error:

        return error


    data = request.get_json()

    if not data:

        return jsonify({
            "message": "No data received."
        }), 400


    if not data.get("name"):

        return jsonify({
            "message": "Service name is required."
        }), 400


    try:

        price = float(
            data.get(
                "price",
                0
            )
        )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "message": "Invalid price."
        }), 400


    service = Service(

        title=data["name"],

        description=data.get(
            "description"
        ),

        price=price,

        location=data.get(
            "location"
        ),

        provider=data.get(
            "provider"
        )

    )


    db.session.add(
        service
    )

    db.session.commit()


    return jsonify({

        "message":
            "Service added successfully.",

        "serviceId":
            service.id

    }), 201


# =====================================================
# UPDATE SERVICE
# =====================================================

@app.route(
    "/services/<int:id>",
    methods=["PUT"]
)
@jwt_required()
def update_service(id):

    admin, error = admin_required()

    if error:

        return error


    service = Service.query.get_or_404(
        id
    )


    data = request.get_json()

    if not data:

        return jsonify({
            "message": "No data received."
        }), 400


    service.title = data.get(
        "name",
        service.title
    )


    service.description = data.get(
        "description",
        service.description
    )


    try:

        if "price" in data:

            service.price = float(
                data["price"]
            )

    except (
        TypeError,
        ValueError
    ):

        return jsonify({
            "message": "Invalid price."
        }), 400


    service.location = data.get(
        "location",
        service.location
    )


    service.provider = data.get(
        "provider",
        service.provider
    )


    db.session.commit()


    return jsonify({

        "message":
            "Service updated successfully."

    }), 200


# =====================================================
# DELETE SERVICE
# =====================================================

@app.route(
    "/services/<int:id>",
    methods=["DELETE"]
)
@jwt_required()
def delete_service(id):

    admin, error = admin_required()

    if error:

        return error


    service = Service.query.get_or_404(
        id
    )


    db.session.delete(
        service
    )

    db.session.commit()


    return jsonify({

        "message":
            "Service deleted successfully."

    }), 200


# =====================================================
# CREATE DATABASE + SAMPLE SERVICES
# =====================================================

with app.app_context():

    db.create_all()


# =====================================================
# ENSURE RAMON IS ADMIN
# =====================================================

with app.app_context():

    admin_user = User.query.filter_by(
        email="admin@ramonsmarketplace.com"
    ).first()

    if admin_user:

        admin_user.role = "admin"

        db.session.commit()

        print("=================================")
        print("ADMIN ACCOUNT VERIFIED")
        print("Name:", admin_user.name)
        print("Email:", admin_user.email)
        print("Role:", admin_user.role)
        print("=================================")

    else:

        print("=================================")
        print("ADMIN ACCOUNT NOT FOUND")
        print("=================================")

    if Service.query.count() == 0:

        sample_services = [

            Service(
                title="Cleaning",
                description=(
                    "Professional home, office "
                    "and school cleaning."
                ),
                price=1500,
                location="Nairobi",
                provider="Ramon Cleaning Services"
            ),

            Service(
                title="Laundry",
                description=(
                    "Professional washing, "
                    "drying and ironing."
                ),
                price=800,
                location="Nairobi",
                provider="Ramon Laundry"
            ),

            Service(
                title="Plumbing",
                description=(
                    "Professional plumbing "
                    "and repair services."
                ),
                price=1000,
                location="Nairobi",
                provider="Ramon Plumbing"
            ),

            Service(
                title="Electrical",
                description=(
                    "Professional electrical "
                    "installation and repair."
                ),
                price=1500,
                location="Nairobi",
                provider="Ramon Electrical"
            ),

            Service(
                title="Gardening",
                description=(
                    "Garden maintenance "
                    "and landscaping."
                ),
                price=1000,
                location="Nairobi",
                provider="Ramon Gardening"
            ),

            Service(
                title="Painting",
                description=(
                    "Interior and exterior "
                    "painting services."
                ),
                price=3000,
                location="Nairobi",
                provider="Ramon Painting"
            ),

            Service(
                title="Moving",
                description=(
                    "House and office "
                    "moving assistance."
                ),
                price=5000,
                location="Nairobi",
                provider="Ramon Movers"
            )

        ]


        db.session.add_all(
            sample_services
        )

        db.session.commit()



# =====================================================
# RUN APPLICATION
# =====================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )