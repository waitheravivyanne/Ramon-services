# from database import db
# from datetime import datetime


# # ============================================================
# # USER MODEL
# # ============================================================

# class User(db.Model):

#     __tablename__ = "user"

#     id = db.Column(
#         db.Integer,
#         primary_key=True
#     )

#     name = db.Column(
#         db.String(100),
#         nullable=False
#     )

#     email = db.Column(
#         db.String(120),
#         unique=True,
#         nullable=False
#     )

#     phone = db.Column(
#         db.String(20),
#         nullable=True
#     )

#     password = db.Column(
#         db.String(200),
#         nullable=False
#     )

#     role = db.Column(
#         db.String(20),
#         default="customer"
#     )

#     reset_token_hash = db.Column(
#         db.String(128),
#         nullable=True
#     )

#     reset_token_expires = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     # --------------------------------------------------------
#     # RELATIONSHIP
#     # One user can have many bookings
#     # --------------------------------------------------------

#     bookings = db.relationship(
#         "Booking",
#         back_populates="customer",
#         foreign_keys="Booking.user_id",
#         lazy=True
#     )

#     # --------------------------------------------------------
#     # RELATIONSHIP
#     # One user can have many orders
#     # --------------------------------------------------------

#     orders = db.relationship(
#         "Order",
#         back_populates="customer",
#         foreign_keys="Order.user_id",
#         lazy=True
#     )


# # ============================================================
# # SERVICE MODEL
# # ============================================================

# class Service(db.Model):

#     __tablename__ = "services"

#     id = db.Column(
#         db.Integer,
#         primary_key=True
#     )

#     title = db.Column(
#         db.String(150),
#         nullable=False
#     )

#     description = db.Column(
#         db.Text,
#         nullable=True
#     )

#     price = db.Column(
#         db.Float,
#         nullable=True
#     )

#     location = db.Column(
#         db.String(150),
#         nullable=True
#     )

#     provider = db.Column(
#         db.String(150),
#         nullable=True
#     )

#     # --------------------------------------------------------
#     # One service can have many bookings
#     # --------------------------------------------------------

#     bookings = db.relationship(
#         "Booking",
#         back_populates="service",
#         lazy=True
#     )

#     # --------------------------------------------------------
#     # One service can have many orders
#     # --------------------------------------------------------

#     orders = db.relationship(
#         "Order",
#         back_populates="service",
#         lazy=True
#     )


# # ============================================================
# # BOOKING MODEL
# # ============================================================

# class Booking(db.Model):

#     __tablename__ = "bookings"

#     id = db.Column(
#         db.Integer,
#         primary_key=True
#     )

#     # --------------------------------------------------------
#     # CUSTOMER
#     # IMPORTANT:
#     # The User table is called "user", not "users".
#     # --------------------------------------------------------

#     user_id = db.Column(
#         db.Integer,
#         db.ForeignKey("user.id"),
#         nullable=False
#     )

#     # --------------------------------------------------------
#     # SERVICE
#     # --------------------------------------------------------

#     service_id = db.Column(
#         db.Integer,
#         db.ForeignKey("services.id"),
#         nullable=False
#     )

#     # --------------------------------------------------------
#     # CUSTOMER RELATIONSHIP
#     # This allows:
#     #
#     # booking.customer.name
#     # booking.customer.email
#     # booking.customer.phone
#     # --------------------------------------------------------

#     customer = db.relationship(
#         "User",
#         back_populates="bookings",
#         foreign_keys=[user_id]
#     )

#     # --------------------------------------------------------
#     # SERVICE RELATIONSHIP
#     # This allows:
#     #
#     # booking.service.title
#     # booking.service.price
#     # --------------------------------------------------------

#     service = db.relationship(
#         "Service",
#         back_populates="bookings",
#         foreign_keys=[service_id]
#     )

#     # --------------------------------------------------------
#     # BOOKING CATEGORY
#     # --------------------------------------------------------

#     category_id = db.Column(
#         db.String(50),
#         nullable=False
#     )

#     # --------------------------------------------------------
#     # PRICE
#     # --------------------------------------------------------

#     total = db.Column(
#         db.Float,
#         nullable=False,
#         default=0
#     )

#     # --------------------------------------------------------
#     # BOOKING STATUS
#     # --------------------------------------------------------

#     status = db.Column(
#         db.String(30),
#         default="Pending"
#     )

#     # --------------------------------------------------------
#     # DATE & TIME
#     # --------------------------------------------------------

#     date = db.Column(
#         db.String(30),
#         nullable=True
#     )

#     time = db.Column(
#         db.String(30),
#         nullable=True
#     )

#     # --------------------------------------------------------
#     # LOCATION
#     # --------------------------------------------------------

#     address = db.Column(
#         db.String(255),
#         nullable=True
#     )

#     city = db.Column(
#         db.String(100),
#         nullable=True
#     )

#     estate = db.Column(
#         db.String(100),
#         nullable=True
#     )

#     house_number = db.Column(
#         db.String(100),
#         nullable=True
#     )

#     # --------------------------------------------------------
#     # CLEANING INFORMATION
#     # --------------------------------------------------------

#     house_size = db.Column(
#         db.String(100),
#         nullable=True
#     )

#     cleaning_type = db.Column(
#         db.String(100),
#         nullable=True
#     )

#     frequency = db.Column(
#         db.String(100),
#         nullable=True
#     )

#     # --------------------------------------------------------
#     # NOTES
#     # --------------------------------------------------------

#     notes = db.Column(
#         db.Text,
#         nullable=True
#     )

#     # --------------------------------------------------------
#     # EXTRAS
#     # Stored as text/JSON string
#     # --------------------------------------------------------

#     extras = db.Column(
#         db.Text,
#         nullable=True
#     )

#     # ========================================================
#     # PAYMENT INFORMATION
#     # ========================================================

#     payment_status = db.Column(
#         db.String(30),
#         default="Pending"
#     )

#     payment_method = db.Column(
#         db.String(30),
#         nullable=True
#     )

#     payment_phone = db.Column(
#         db.String(20),
#         nullable=True
#     )

#     mpesa_receipt = db.Column(
#         db.String(100),
#         nullable=True
#     )

#     checkout_request_id = db.Column(
#         db.String(150),
#         nullable=True
#     )

#     merchant_request_id = db.Column(
#         db.String(150),
#         nullable=True
#     )

#     payment_result_code = db.Column(
#         db.String(30),
#         nullable=True
#     )

#     payment_result_description = db.Column(
#         db.Text,
#         nullable=True
#     )

#     payment_paid_at = db.Column(
#         db.DateTime,
#         nullable=True
#     )

#     # ========================================================
#     # CREATED DATE
#     # ========================================================

#     created_at = db.Column(
#         db.DateTime,
#         default=datetime.utcnow,
#         nullable=True
#     )


# # ============================================================
# # ORDER MODEL
# # ============================================================

# class Order(db.Model):

#     __tablename__ = "orders"

#     id = db.Column(
#         db.Integer,
#         primary_key=True
#     )

#     # --------------------------------------------------------
#     # CUSTOMER
#     # IMPORTANT:
#     # Use "user.id", NOT "users.id"
#     # --------------------------------------------------------

#     user_id = db.Column(
#         db.Integer,
#         db.ForeignKey("user.id"),
#         nullable=True
#     )

#     # --------------------------------------------------------
#     # SERVICE
#     # --------------------------------------------------------

#     service_id = db.Column(
#         db.Integer,
#         db.ForeignKey("services.id"),
#         nullable=True
#     )

#     # --------------------------------------------------------
#     # CUSTOMER RELATIONSHIP
#     # --------------------------------------------------------

#     customer = db.relationship(
#         "User",
#         back_populates="orders",
#         foreign_keys=[user_id]
#     )

#     # --------------------------------------------------------
#     # SERVICE RELATIONSHIP
#     # --------------------------------------------------------

#     service = db.relationship(
#         "Service",
#         back_populates="orders",
#         foreign_keys=[service_id]
#     )

#     # --------------------------------------------------------
#     # ORDER TOTAL
#     # --------------------------------------------------------

#     total = db.Column(
#         db.Float,
#         nullable=False,
#         default=0
#     )

#     # --------------------------------------------------------
#     # ORDER STATUS
#     # --------------------------------------------------------

#     status = db.Column(
#         db.String(30),
#         default="Pending"
#     )

#     # --------------------------------------------------------
#     # CREATED DATE
#     # --------------------------------------------------------

#     created_at = db.Column(
#         db.DateTime,
#         default=datetime.utcnow,
#         nullable=True
#     )

from database import db
from datetime import datetime


class User(db.Model):
    __tablename__ = "user"

    id = db.Column(db.Integer, primary_key=True)

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        unique=True,
        nullable=False
    )

    phone = db.Column(
        db.String(20)
    )

    password = db.Column(
        db.String(200),
        nullable=False
    )

    role = db.Column(
        db.String(20),
        default="customer"
    )

    reset_token_hash = db.Column(
        db.String(128),
        nullable=True
    )

    reset_token_expires = db.Column(
        db.DateTime,
        nullable=True
    )

    bookings = db.relationship(
        "Booking",
        back_populates="customer",
        foreign_keys="Booking.user_id",
        lazy=True
    )

    orders = db.relationship(
        "Order",
        back_populates="user",
        foreign_keys="Order.user_id",
        lazy=True
    )


class Service(db.Model):
    __tablename__ = "services"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    title = db.Column(
        db.String(150),
        nullable=False
    )

    description = db.Column(
        db.Text,
        nullable=True
    )

    price = db.Column(
        db.Float,
        nullable=True
    )

    location = db.Column(
        db.String(150),
        nullable=True
    )

    provider = db.Column(
        db.String(150),
        nullable=True
    )

    bookings = db.relationship(
        "Booking",
        back_populates="service",
        lazy=True
    )

    orders = db.relationship(
        "Order",
        back_populates="service",
        lazy=True
    )


class Booking(db.Model):
    __tablename__ = "bookings"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=False
    )

    service_id = db.Column(
        db.Integer,
        db.ForeignKey("services.id"),
        nullable=False
    )

    customer = db.relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="bookings"
    )

    service = db.relationship(
        "Service",
        foreign_keys=[service_id],
        back_populates="bookings"
    )

    category_id = db.Column(
        db.String(50),
        nullable=False
    )

    total = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    status = db.Column(
        db.String(30),
        default="Pending"
    )

    date = db.Column(
        db.String(30),
        nullable=True
    )

    time = db.Column(
        db.String(30),
        nullable=True
    )

    address = db.Column(
        db.String(255),
        nullable=True
    )

    city = db.Column(
        db.String(100),
        nullable=True
    )

    estate = db.Column(
        db.String(100),
        nullable=True
    )

    house_number = db.Column(
        db.String(100),
        nullable=True
    )

    house_size = db.Column(
        db.String(100),
        nullable=True
    )

    cleaning_type = db.Column(
        db.String(100),
        nullable=True
    )

    frequency = db.Column(
        db.String(100),
        nullable=True
    )

    notes = db.Column(
        db.Text,
        nullable=True
    )

    extras = db.Column(
        db.Text,
        nullable=True
    )

    payment_status = db.Column(
        db.String(30),
        default="Pending"
    )

    payment_method = db.Column(
        db.String(30),
        nullable=True
    )

    payment_phone = db.Column(
        db.String(20),
        nullable=True
    )

    mpesa_receipt = db.Column(
        db.String(100),
        nullable=True
    )

    checkout_request_id = db.Column(
        db.String(150),
        nullable=True
    )

    merchant_request_id = db.Column(
        db.String(150),
        nullable=True
    )

    payment_result_code = db.Column(
        db.String(30),
        nullable=True
    )

    payment_result_description = db.Column(
        db.Text,
        nullable=True
    )

    payment_paid_at = db.Column(
        db.DateTime,
        nullable=True
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        nullable=True
    )


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey("user.id"),
        nullable=True
    )

    service_id = db.Column(
        db.Integer,
        db.ForeignKey("services.id"),
        nullable=True
    )

    user = db.relationship(
        "User",
        foreign_keys=[user_id],
        back_populates="orders"
    )

    service = db.relationship(
        "Service",
        foreign_keys=[service_id],
        back_populates="orders"
    )

    total = db.Column(
        db.Float,
        nullable=False,
        default=0
    )

    status = db.Column(
        db.String(30),
        default="Pending"
    )

    created_at = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )
