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

from models import db, User, Service

app = Flask(__name__)

CORS(app)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///service.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = "secret-key-change-this"

db.init_app(app)

jwt = JWTManager(app)


# ===========================================
# HOME
# ===========================================

@app.route("/")
def home():
    return jsonify({
        "message": "Ramon's Service Marketplace API is running."
    })


# ===========================================
# REGISTER
# ===========================================

@app.route("/register", methods=["POST"])
def register():

    data = request.get_json()

    existing_user = User.query.filter_by(
        email=data["email"]
    ).first()

    if existing_user:
        return jsonify({
            "message": "Email already exists"
        }), 400

    user = User(
        name=data["name"],
        email=data["email"],
        password=generate_password_hash(data["password"]),
        role="customer"
    )

    db.session.add(user)
    db.session.commit()

    return jsonify({
        "message": "Account created successfully"
    })


# ===========================================
# LOGIN
# ===========================================

@app.route("/login", methods=["POST"])
def login():

    data = request.get_json()

    user = User.query.filter_by(
        email=data["email"]
    ).first()

    if user and check_password_hash(
        user.password,
        data["password"]
    ):

        token = create_access_token(
            identity={
                "id": user.id,
                "role": user.role
            }
        )

        return jsonify({
            "token": token,
            "user":{
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role
            }
        })

    return jsonify({
        "message": "Invalid credentials"
    }), 401


# ===========================================
# PROFILE
# ===========================================

@app.route("/profile")
@jwt_required()
def profile():

    current_user = get_jwt_identity()

    return jsonify({
        "user": current_user
    })


# ===========================================
# GET ALL SERVICES
# ===========================================

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
class Booking(db.Model):

    __tablename__ = "bookings"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id"),
        nullable=False
    )

    service_id = db.Column(
        db.Integer,
        db.ForeignKey("services.id"),
        nullable=False
    )

    total = db.Column(
        db.Float,
        nullable=False
    )

    status = db.Column(
        db.String(30),
        default="Pending"
    )

    date = db.Column(
        db.String(50)
    )

    address = db.Column(
        db.String(200)
    )

    house_size = db.Column(
        db.String(50)
    )

    cleaning_type = db.Column(
        db.String(100)
    )

    frequency = db.Column(
        db.String(100)
    )

# ===========================================
# GET ONE SERVICE
# ===========================================

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


# ===========================================
# ADD SERVICE
# ===========================================

@app.route("/services", methods=["POST"])
@jwt_required()
def add_service():

    current_user = get_jwt_identity()

    if current_user["role"] != "admin":

        return jsonify({
            "message": "Unauthorized"
        }), 403

    data = request.get_json()

    service = Service(

        title=data["name"],

        description=data["description"],

        price=data["price"],

        location=data["location"],

        provider=data["provider"]

    )

    db.session.add(service)

    db.session.commit()

    return jsonify({
        "message": "Service added successfully"
    }), 201


# ===========================================
# UPDATE SERVICE
# ===========================================

@app.route("/services/<int:id>", methods=["PUT"])
@jwt_required()
def update_service(id):

    current_user = get_jwt_identity()

    if current_user["role"] != "admin":

        return jsonify({
            "message": "Unauthorized"
        }), 403

    service = Service.query.get_or_404(id)

    data = request.get_json()

    service.title = data["name"]
    service.description = data["description"]
    service.price = data["price"]
    service.location = data["location"]
    service.provider = data["provider"]

    db.session.commit()

    return jsonify({
        "message": "Service updated successfully"
    })


# ===========================================
# DELETE SERVICE
# ===========================================

@app.route("/services/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_service(id):

    current_user = get_jwt_identity()

    if current_user["role"] != "admin":

        return jsonify({
            "message": "Unauthorized"
        }), 403

    service = Service.query.get_or_404(id)

    db.session.delete(service)

    db.session.commit()

    return jsonify({
        "message": "Service deleted successfully"
    })


# ===========================================
# INSERT SAMPLE SERVICES
# ===========================================

with app.app_context():

    db.create_all()

    if Service.query.count() == 0:

        sample_services = [

            Service(
                title="Cleaning",
                description="Professional home, office and school cleaning",
                price=1500,
                location="Nairobi",
                provider="Ramon Cleaning Services"
            ),

            Service(
                title="Laundry",
                description="Professional washing and ironing",
                price=800,
                location="Nairobi",
                provider="Ramon Laundry"
            )

        ]

        db.session.add_all(sample_services)

        db.session.commit()


# ===========================================
# RUN SERVER
# ===========================================

if __name__ == "__main__":
    app.run(debug=True)