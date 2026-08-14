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

from models import db, User, Service, Booking

import json


# =====================================================
# APP
# =====================================================

app = Flask(__name__)

CORS(app)


app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///service.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

app.config["JWT_SECRET_KEY"] = "secret-key-change-this"


db.init_app(app)

jwt = JWTManager(app)


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

    existing_user = User.query.filter_by(
        email=email
    ).first()

    if existing_user:

        return jsonify({
            "message": "Email already exists."
        }), 400

    user = User(

        name=name,

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

    })


# =====================================================
# PROFILE
# =====================================================

@app.route("/profile")
@jwt_required()
def profile():

    current_user = get_jwt_identity()

    user = User.query.get(
        current_user["id"]
    )

    if not user:

        return jsonify({
            "message": "User not found."
        }), 404

    return jsonify({

        "user": {

            "id": user.id,

            "name": user.name,

            "email": user.email,

            "role": user.role

        }

    })


# =====================================================
# GET SERVICES
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

    current_user = get_jwt_identity()

    data = request.get_json()

    if not data:

        return jsonify({
            "message": "No booking data received."
        }), 400

    service_id = data.get("serviceId")

    service = Service.query.get(service_id)

    if not service:

        return jsonify({
            "message": "Service not found."
        }), 404

    booking = Booking(

        user_id=current_user["id"],

        service_id=service_id,

        category_id=data.get("categoryId"),

        total=float(data.get("total", 0)),

        date=data.get("date"),

        time=data.get("time"),

        address=data.get("address"),

        city=data.get("city"),

        estate=data.get("estate"),

        house_number=data.get("houseNumber"),

        house_size=data.get("houseSize"),

        cleaning_type=data.get("cleaningType"),

        frequency=data.get("frequency"),

        notes=data.get("notes"),

        extras=json.dumps(
            data.get("extras", [])
        )

    )

    db.session.add(booking)

    db.session.commit()

    return jsonify({

        "message": "Booking created successfully.",

        "bookingId": booking.id

    }), 201


# =====================================================
# GET MY BOOKINGS
# =====================================================

@app.route("/bookings/my", methods=["GET"])
@jwt_required()
def my_bookings():

    current_user = get_jwt_identity()

    bookings = Booking.query.filter_by(
        user_id=current_user["id"]
    ).all()

    return jsonify([

        {

            "id": booking.id,

            "serviceId": booking.service_id,

            "categoryId": booking.category_id,

            "total": booking.total,

            "status": booking.status,

            "date": booking.date,

            "time": booking.time,

            "address": booking.address,

            "houseSize": booking.house_size,

            "cleaningType": booking.cleaning_type,

            "frequency": booking.frequency,

            "notes": booking.notes

        }

        for booking in bookings

    ])


# =====================================================
# ADD SERVICE
# =====================================================

@app.route("/services", methods=["POST"])
@jwt_required()
def add_service():

    current_user = get_jwt_identity()

    if current_user["role"] != "admin":

        return jsonify({
            "message": "Unauthorized."
        }), 403

    data = request.get_json()

    service = Service(

        title=data["name"],

        description=data.get("description"),

        price=data.get("price", 0),

        location=data.get("location"),

        provider=data.get("provider")

    )

    db.session.add(service)

    db.session.commit()

    return jsonify({

        "message": "Service added successfully."

    }), 201


# =====================================================
# UPDATE SERVICE
# =====================================================

@app.route("/services/<int:id>", methods=["PUT"])
@jwt_required()
def update_service(id):

    current_user = get_jwt_identity()

    if current_user["role"] != "admin":

        return jsonify({
            "message": "Unauthorized."
        }), 403

    service = Service.query.get_or_404(id)

    data = request.get_json()

    service.title = data.get(
        "name",
        service.title
    )

    service.description = data.get(
        "description",
        service.description
    )

    service.price = data.get(
        "price",
        service.price
    )

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

        "message": "Service updated successfully."

    })


# =====================================================
# DELETE SERVICE
# =====================================================

@app.route("/services/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_service(id):

    current_user = get_jwt_identity()

    if current_user["role"] != "admin":

        return jsonify({
            "message": "Unauthorized."
        }), 403

    service = Service.query.get_or_404(id)

    db.session.delete(service)

    db.session.commit()

    return jsonify({

        "message": "Service deleted successfully."

    })


# =====================================================
# CREATE DATABASE + SAMPLE SERVICES
# =====================================================

with app.app_context():

    db.create_all()

    if Service.query.count() == 0:

        sample_services = [

            Service(
                title="Cleaning",
                description="Professional home, office and school cleaning.",
                price=1500,
                location="Nairobi",
                provider="Ramon Cleaning Services"
            ),

            Service(
                title="Laundry",
                description="Professional washing, drying and ironing.",
                price=800,
                location="Nairobi",
                provider="Ramon Laundry"
            ),

            Service(
                title="Plumbing",
                description="Professional plumbing and repair services.",
                price=1000,
                location="Nairobi",
                provider="Ramon Plumbing"
            ),

            Service(
                title="Electrical",
                description="Professional electrical installation and repair.",
                price=1500,
                location="Nairobi",
                provider="Ramon Electrical"
            ),

            Service(
                title="Gardening",
                description="Garden maintenance and landscaping.",
                price=1000,
                location="Nairobi",
                provider="Ramon Gardening"
            ),

            Service(
                title="Painting",
                description="Interior and exterior painting services.",
                price=3000,
                location="Nairobi",
                provider="Ramon Painting"
            ),

            Service(
                title="Moving",
                description="House and office moving assistance.",
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
# RUN
# =====================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )