from flask_login import login_required, current_user
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Tasks, TasksSchema, Users, db
from sqlalchemy.orm import joinedload, load_only
from flask_cors import CORS

routes_bp = Blueprint('routes_bp', __name__, url_prefix='/api')
CORS(routes_bp, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

@routes_bp.route('/avatar', methods=['GET'])
@jwt_required()
def get_avatar():
    """Retrieve the current avatar"""
    current_user_google_id = get_jwt_identity()
    avatar= db.session.query(Users.avatar).filter_by(google_id=current_user_google_id).scalar()

    if avatar is None:
        return jsonify({"Error": "User not found"}), 404
    return jsonify({"avatar": avatar}), 200

@routes_bp.route('/avatar/select', methods=['POST'])
@jwt_required()
def select_avatar():
    current_user_googleid= get_jwt_identity()
    data= request.json
    new_avatar= data.get("avatar")

    if not new_avatar:
        return jsonify({"error": "Avatar not provided"}), 400
    user = Users.query.filter_by(google_id=current_user_googleid).first()
    if not user:
        return jsonify({"error": "User not found"}), 404
    user.avatar= new_avatar
    db.session.commit()
    return jsonify({"avatar": new_avatar}), 200

@routes_bp.route('/navbarAvatar', methods=['GET'])
@jwt_required()
def get_frame():
    """Retrieve the current avatar"""
    current_user_google_id = get_jwt_identity()
    navbarAvatar= db.session.query(Users.frame, Users.avatar).filter_by(google_id=current_user_google_id).first()

    if navbarAvatar is None: # User is doesn't have a frame
        return jsonify({"error": "User not in database"}), 400
    return jsonify({"frame": navbarAvatar.frame, "avatar": navbarAvatar.avatar}), 200
