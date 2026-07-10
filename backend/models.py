from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):

    id=db.Column(
        db.Integer,
        primary_key=True
    )

    name=db.Column(
        db.String(100)
    )

    email=db.Column(
        db.String(120),
        unique=True
    )

    password=db.Column(
        db.String(200)
    )

    role=db.Column(
        db.String(20)
    )



class Service(db.Model):

    id=db.Column(
        db.Integer,
        primary_key=True
    )

    title=db.Column(
        db.String(100)
    )

    description=db.Column(
        db.String(300)
    )

    price=db.Column(
        db.Float
    )

    location=db.Column(
        db.String(100)
    )

    provider=db.Column(
        db.String(100)
    )