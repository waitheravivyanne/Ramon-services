from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


# =====================================================
# USER
# =====================================================

class User(db.Model):

    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(255),
        nullable=False
    )

    role = db.Column(
        db.String(20),
        default="customer"
    )


# =====================================================
# SERVICE
# =====================================================

class Service(db.Model):

    __tablename__ = "services"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(
        db.String(100),
        nullable=False
    )

    description = db.Column(
        db.String(300)
    )

    price = db.Column(
        db.Float,
        nullable=False
    )

    location = db.Column(
        db.String(100)
    )

    provider = db.Column(
        db.String(100)
    )


# =====================================================
# BOOKING
# =====================================================

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

    category_id = db.Column(
        db.String(50)
    )

    total = db.Column(
        db.Float,
        nullable=False
    )

    status = db.Column(
        db.String(30),
        default="Pending",
        nullable=False
    )

    date = db.Column(
        db.String(50)
    )

    time = db.Column(
        db.String(50)
    )

    address = db.Column(
        db.String(200)
    )

    city = db.Column(
        db.String(100)
    )

    estate = db.Column(
        db.String(100)
    )

    house_number = db.Column(
        db.String(100)
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

    notes = db.Column(
        db.Text
    )

    extras = db.Column(
        db.Text
    )

    # Relationships
    user = db.relationship(
        "User",
        backref="bookings"
    )

    service = db.relationship(
        "Service",
        backref="bookings"
    )