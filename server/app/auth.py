import os
from flask import Flask, redirect, request, url_for, Blueprint, jsonify
from flask_login import (
    LoginManager,
    current_user,
    login_required,
    login_user,
    logout_user,
)
import requests
from .config import db, mm, create_app
from .models import Users
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity, get_csrf_token, set_access_cookies
from flask_cors import CORS
from .tasks_routes import tasks_bp
from .routes import routes_bp
from .rpg_routes import rpg_bp
from .habits_routes import habits_bp
from datetime import datetime
from .rewards_routes import rewards_bp



app = create_app()
with app.app_context():
    db.create_all()
CORS(app)
CORS(app, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
GOOGLE_DISCOVERY_URL = (
    "https://accounts.google.com/.well-known/openid-configuration"
)

app.config['JWT_SECRET_KEY']= os.getenv("JWT_SECRET_KEY")
app.config['JWT_TOKEN_LOCATION']= ['cookies']
app.config['JWT_COOKIE_CSRF_PROTECT'] = True  # Enable CSRF protection
app.config['JWT_ACCESS_COOKIE_PATH'] = '/'      # Make JWT cookies accessible globally
app.config['JWT_COOKIE_SAMESITE'] = 'Lax'       # Allow same-site requests
app.config['JWT_COOKIE_SECURE'] = False         # Use `True` if using HTTPS

jwt= JWTManager(app)

app.register_blueprint(tasks_bp)
app.register_blueprint(routes_bp)
app.register_blueprint(rpg_bp)
app.register_blueprint(habits_bp)
app.register_blueprint(rewards_bp)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    google_id = email

    if not email or not password or not username:
        return jsonify({"error": "Missing required fields"}), 400

    if Users.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400

    user = Users(email=email, username=username, google_id=google_id)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    jwt_token = create_access_token(identity=email)
    response = jsonify({"message": "Signup successful"})
    set_access_cookies(response, jwt_token)
    return response, 201


@app.route('/login', methods=['POST'])
def email_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = Users.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    jwt_token = create_access_token(identity=email)
    response = jsonify({"message": "Login successful"})
    set_access_cookies(response, jwt_token)

    response.set_cookie('access_token_cookie', value=jwt_token, httponly=True, samesite='Lax')

    return response, 200

@app.route('/google/login', methods=['POST'])
def google_login():
    auth_code = request.get_json()['code']
    data = {
        'code': auth_code,
        'client_id': GOOGLE_CLIENT_ID,
        'client_secret': GOOGLE_CLIENT_SECRET,
        'redirect_uri': 'postmessage',
        'grant_type': 'authorization_code'
    }

    response = requests.post('https://oauth2.googleapis.com/token', data=data).json()
    headers = {
        'Authorization': f'Bearer {response["access_token"]}'
    }
    user_info = requests.get('https://www.googleapis.com/oauth2/v3/userinfo', headers=headers).json()
    unique_id = user_info['sub']
    user = Users.query.filter_by(google_id=unique_id).first()
    if not user:
        user = Users(google_id=unique_id, username=user_info['given_name'])
        db.session.add(user)
        db.session.commit()

    jwt_token = create_access_token(identity=user.google_id)
    response = jsonify({"message": "Google login successful"})
    set_access_cookies(response, jwt_token)

    # Set cookies to be secure (add `secure=True` if using HTTPS)
    response.set_cookie('access_token_cookie', value=jwt_token, httponly=True, samesite='Lax')

    return response, 200

@jwt.expired_token_loader
def handle_expired_token(jwt_header, jwt_payload):
    # Remove cookie
    response= jsonify({"msg": "The token has expired. Please log in again"})
    response.status_code = 401
    response.set_cookie("access_token_cookie", "", expires=0)
    return response

@app.route('/api/validate', methods=['GET'])
@jwt_required()
def validate_token():
    return jsonify({"msg": "token is valid"})

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")