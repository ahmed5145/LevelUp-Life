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
jwt= JWTManager(app)

app.register_blueprint(tasks_bp)
app.register_blueprint(routes_bp)
app.register_blueprint(rpg_bp)

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
def email_login():  # Renamed to email_login
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = Users.query.filter_by(email=email).first()

    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401

    jwt_token = create_access_token(identity=email)
    response = jsonify({"message": "Login successful"})
    set_access_cookies(response, jwt_token)
    return response, 200

@app.route('/google/login', methods=['POST'])
def google_login():  # Renamed to google_login
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
    if user:
        login_user(user)
    else:
        user = Users(google_id=unique_id, username=user_info['given_name'])
        db.session.add(user)
        db.session.commit()
        login_user(user)

    jwt_token = create_access_token(identity=user_info['sub'])  # Create a JWT token
    response = jsonify(user=user_info)
    csrf_token = get_csrf_token(jwt_token)
    response.set_cookie('csrf_access_token', value=csrf_token, secure=False, domain='localhost')
    response.set_cookie('csrf_access_token', value=csrf_token, secure=False, domain='127.0.0.1')
    response.set_cookie('access_token_cookie', value=jwt_token, secure=False, max_age=3600, domain='localhost')
    response.set_cookie('access_token_cookie', value=jwt_token, secure=False, max_age=3600, domain='127.0.0.1')
    return response, 200

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")