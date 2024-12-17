from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Users, Habits, db, Tasks

rpg_bp = Blueprint('rpg', __name__, url_prefix='/api/rpg')

# Constants for leveling and HP
XP_PER_LEVEL = 100
MAX_HP = 100

# Helper function to calculate level based on XP
def calculate_level(xp):
    return xp // XP_PER_LEVEL + 1

@rpg_bp.route('/status', methods=['GET'])
@jwt_required()  # Ensures JWT authentication
def get_status():
    """Retrieve the current user's RPG status."""
    # Extract the current user's Google ID from JWT
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()

    # Return 404 if the user is not found
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Return the user's RPG status
    return jsonify({
        "level": user.level,
        "xp": user.xp,
        "coins": user.coins,
        "hp": user.hp
    }), 200

@rpg_bp.route('/update_task', methods=['POST'])
@jwt_required()
def update_task():
    """Update task and apply rewards/penalties dynamically based on difficulty."""
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    print(data)
    task_id = data.get('task_id')

    # Fetch habit by habit_id and ensure it belongs to the current user
    task = Tasks.query.filter_by(id=task_id, user_id=user.id).first()

    if not task:
        return jsonify({"error": "Task not found"}), 404

    # Determine rewards and penalties based on difficulty
    difficulty_multiplier = task.difficulty or 1  # Assume default 1 if difficulty is None
    xp_reward = 1 * difficulty_multiplier
    hp_reward = 3.5 * difficulty_multiplier

    user.xp += xp_reward
    user.hp += hp_reward # Increment streak for good habit

    # Check if user levels up
    new_level = calculate_level(user.xp)
    if new_level > user.level:
        user.level = new_level
        if user.level % 10 == 0:
            get_frame= user.frame
            get_frame= get_frame.split('-')
            frame_tier= int(get_frame[0]) + 1
            new_frame= str(frame_tier) + '-'+ get_frame[1]
            user.frame= new_frame
        user.coins += 50  # Level-up reward

    db.session.commit()
    return jsonify({
        "message": "Task Completed",
        "xp": user.xp,
        "level": user.level,
        "coins": user.coins,
        "hp": user.hp,
    }), 200

@rpg_bp.route('/update_habit', methods=['POST'])
@jwt_required()
def update_habit():
    """Update habit and apply rewards/penalties dynamically based on difficulty."""
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    print(data)
    habit_id = data.get('habit_id')
    is_good = data.get('good_or_bad')  # Expect this to be a boolean

    # Fetch habit by habit_id and ensure it belongs to the current user
    habit = Habits.query.filter_by(id=habit_id, user_id=user.id).first()

    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    # Determine rewards and penalties based on difficulty
    difficulty_multiplier = 1  # Assume default 1 if difficulty is None
    xp_reward = 10 * difficulty_multiplier
    coin_reward = 5 * difficulty_multiplier
    hp_penalty = 10 * difficulty_multiplier

    if is_good =="good":
        # Apply good habit rewards
        user.xp += xp_reward
        user.coins += coin_reward
        habit.streak += 1  # Increment streak for good habit
    else:
        # Apply bad habit penalties
        if user.hp > hp_penalty:
            user.hp -= hp_penalty
        else:
            # User "dies": reset HP and deduct coins as a penalty
            user.hp = MAX_HP
            user.level= max(user.level-1, 1)
            penalty = 20 * difficulty_multiplier
            user.coins = max(user.coins - penalty, 0)
            habit.streak += 1

    # Check if user levels up
    new_level = calculate_level(user.xp)
    if new_level > user.level:
        user.level = new_level
        if user.level % 10 == 0:
            get_frame= user.frame
            get_frame= get_frame.split('-')
            frame_tier= int(get_frame[0]) + 1
            new_frame= str(frame_tier) + '-'+ get_frame[1]
            user.frame= new_frame
        user.coins += 50  # Level-up reward

    db.session.commit()
    return jsonify({
        "message": "Habit updated successfully",
        "xp": user.xp,
        "level": user.level,
        "coins": user.coins,
        "hp": user.hp,
        "streak": habit.streak
    }), 200