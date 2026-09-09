from app import app
from database import db

# IMPORTANT:
# Import all models before db.create_all()
from models import User, Service, Booking, Order


with app.app_context():

    print("Creating/checking database tables...")

    db.create_all()

    print("======================================")
    print("DATABASE INITIALIZATION COMPLETE")
    print("======================================")

    print("Users table:     users")
    print("Services table:  services")
    print("Bookings table:  bookings")
    print("Orders table:    orders")
