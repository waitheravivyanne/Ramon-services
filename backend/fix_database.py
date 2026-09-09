from app import app
from database import db
from sqlalchemy import text


with app.app_context():

    columns = {
        "payment_status": "VARCHAR(30) DEFAULT 'Pending'",
        "payment_method": "VARCHAR(30)",
        "payment_phone": "VARCHAR(20)",
        "mpesa_receipt": "VARCHAR(100)",
        "checkout_request_id": "VARCHAR(150)",
        "merchant_request_id": "VARCHAR(150)",
        "payment_result_code": "VARCHAR(30)",
        "payment_result_description": "TEXT",
        "payment_paid_at": "DATETIME",
    }

    # Get the columns that already exist
    existing = {
        row[1]
        for row in db.session.execute(
            text("PRAGMA table_info(bookings)")
        ).fetchall()
    }

    print("Existing bookings columns:")
    print(existing)

    # Add missing columns
    for column, definition in columns.items():

        if column not in existing:

            db.session.execute(
                text(
                    f"ALTER TABLE bookings "
                    f"ADD COLUMN {column} {definition}"
                )
            )

            print(f"Added column: {column}")

        else:

            print(f"Already exists: {column}")

    db.session.commit()

    print()
    print("==========================================")
    print("DATABASE PAYMENT COLUMNS UPDATED SUCCESSFULLY")
    print("==========================================")