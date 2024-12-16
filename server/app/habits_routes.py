from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Habits, HabitsSchema, Users, db
from sqlalchemy.orm import joinedload
from flask_cors import CORS

habits_bp = Blueprint('habits', __name__, url_prefix='/api/habits')
CORS(habits_bp, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

habits_schema = HabitsSchema()
habits_schemas = HabitsSchema(many=True)

@habits_bp.route('', methods=['GET'])
@jwt_required()
def get_habits():
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404
    
    habits = Habits.query.filter_by(user_id=user.id).all()
    return jsonify(habits_schemas.dump(habits)), 200

@habits_bp.route('', methods=['POST'])
@jwt_required()
def create_habit():
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json() 
    # Validate input
    if not data or 'title' not in data:
        return jsonify({"error": "title is required"}), 400
    
    new_habits = Habits(
        user_id=user.id,
        title=data['title'],
        nature=data.get('nature', 'Good'),
        streak= 0
    )
    db.session.add(new_habits)
    db.session.commit()
    return jsonify(habits_schema.dump(new_habits)), 200

@habits_bp.route('/<int:habits_id>', methods=['DELETE'])
@jwt_required()
def delete_task(habits_id):
    current_user_google_id= get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()
    
    habit = Habits.query.filter_by(id=habits_id, user_id=user.id).first()
    
    if not habit:
        return jsonify({"error": "Task not found"}), 404
    
    db.session.delete(habit)
    db.session.commit()
    return jsonify({"message": "Task deleted successfully"}), 200






