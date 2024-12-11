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
from config import db, mm, create_app
from models import Users
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity, get_csrf_token, set_access_cookies
from flask_cors import CORS

app = create_app()
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


@app.route('/google/login', methods=['POST'])
def login():
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
    user_info= requests.get('https://www.googleapis.com/oauth2/v3/userinfo', headers=headers).json()
    unique_id= user_info['sub']
    user= Users.query.filter_by(google_id=unique_id).first()
    if user:
        login_user(user)
    else:
        user= Users(google_id=unique_id, username=user_info['given_name'])
        db.session.add(user)
        db.session.commit()
        login_user(user)

    jwt_token = create_access_token(identity=unique_id)  # Create a JWT token
    response = jsonify(user=user_info)
    set_access_cookies(response, jwt_token)
    csrf_token= get_csrf_token(jwt_token)
    response.set_cookie('csrf_access_token', value=csrf_token, secure=False)
    response.set_cookie('access_token_cookie', value=jwt_token, secure=False, samesite='Strict', max_age=3600)
    return response, 200

@app.after_request
def after_request(response):
    return response

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0")
