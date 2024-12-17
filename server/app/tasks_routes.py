from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Tasks, TasksSchema, Users, db
from sqlalchemy.orm import joinedload
from flask_cors import CORS

tasks_bp = Blueprint('tasks', __name__, url_prefix='/api/tasks')
CORS(tasks_bp, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

tasks_schema = TasksSchema()
tasks_schemas = TasksSchema(many=True)

@tasks_bp.route('', methods=['GET'])
@jwt_required()
def get_tasks():
    """Retrieve all tasks for the current user"""
    current_user_google_id = get_jwt_identity()
    print("User id: ", current_user_google_id)
    user = Users.query.filter_by(google_id=current_user_google_id).first()
 
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    tasks = Tasks.query.filter_by(user_id=user.id).all()
    return jsonify(tasks_schemas.dump(tasks)), 200

@tasks_bp.route('', methods=['POST'])
@jwt_required()
def create_task():
    """Create a new task for the current user"""
    current_user_email = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_email).first()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    data = request.get_json()
    
    # Validate input
    if not data or 'title' not in data:
        return jsonify({"error": "Title is required"}), 400
    
    new_task = Tasks(
        user_id=user.id,
        title=data['title'],
        description=data.get('description', ''),
        difficulty=data.get('difficulty', 1)
    )
    
    db.session.add(new_task)
    db.session.commit()
    
    return jsonify(tasks_schema.dump(new_task)), 200

@tasks_bp.route('/<int:task_id>', methods=['PUT'])
@jwt_required()
def update_task(task_id):
    """Update a specific task"""
    current_user_email = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_email).first()
    
    task = Tasks.query.filter_by(id=task_id, user_id=user.id).first()
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    data = request.get_json()
    
    # Update task status (completed/not completed)
    if 'status' in data:
        task.status = data['status']
        
        # Award coins based on task difficulty
        if data['status']:
            coins_awarded = task.difficulty * 10
            user.coins += coins_awarded
        
    # Allow updating other fields
    if 'title' in data:
        task.title = data['title']
    if 'description' in data:
        task.description = data['description']
    if 'difficulty' in data:
        task.difficulty = data['difficulty']
    
    db.session.commit()
    
    return jsonify(tasks_schema.dump(task)), 200

@tasks_bp.route('/<int:task_id>', methods=['DELETE'])
@jwt_required()
def delete_task(task_id):
    """Delete a specific task"""
    current_user_email = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_email).first()
    
    task = Tasks.query.filter_by(id=task_id, user_id=user.id).first()
    
    if not task:
        return jsonify({"error": "Task not found"}), 404
    
    db.session.delete(task)
    db.session.commit()
    
    return jsonify({"message": "Task deleted successfully"}), 200