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

app.config["JWT_SECRET_KEY"] = "secret-key-change-this"


db.init_app(app)

jwt = JWTManager(app)



# REGISTER USER

@app.route("/register", methods=["POST"])
def register():

    data = request.json


    existing_user = User.query.filter_by(
        email=data["email"]
    ).first()


    if existing_user:

        return jsonify(
            {
            "message":"Email already exists"
            }
        ),400



    user = User(

        name=data["name"],

        email=data["email"],

        password=generate_password_hash(
            data["password"]
        ),

        role=data["role"]

    )


    db.session.add(user)

    db.session.commit()


    return jsonify(
        {
        "message":"Account created successfully"
        }
    )




# LOGIN USER

@app.route("/login", methods=["POST"])
def login():

    data=request.json


    user=User.query.filter_by(
        email=data["email"]
    ).first()



    if user and check_password_hash(
        user.password,
        data["password"]
    ):


        token=create_access_token(
            identity={
                "id":user.id,
                "role":user.role
            }
        )


        return jsonify(
            {
            "token":token,
            "role":user.role,
            "name":user.name
            }
        )



    return jsonify(
        {
        "message":"Invalid credentials"
        }
    ),401




# PROTECTED PROFILE

@app.route("/profile")
@jwt_required()
def profile():

    current_user=get_jwt_identity()


    return jsonify(
        {
        "user":current_user
        }
    )





if __name__=="__main__":

    with app.app_context():

        db.create_all()


    app.run(debug=True)