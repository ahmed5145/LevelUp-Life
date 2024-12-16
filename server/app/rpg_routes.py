from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Users, Tasks, db

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

@rpg_bp.route('/update_habit', methods=['POST'])
@jwt_required()
def update_habit():
    """Update habit and apply rewards/penalties dynamically based on difficulty."""
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    habit_id = data.get('habit_id')
    is_good = data.get('is_good')

    # Fetch habit by habit_id and ensure it belongs to the current user
    habit = Tasks.query.filter_by(id=habit_id, user_id=user.id).first()

    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    # Determine XP, coin rewards, and penalties based on difficulty
    difficulty_multiplier =  1  # Rewards increase with streak
    xp_reward = 10 * difficulty_multiplier  # XP scales with streak
    coin_reward = 5 * difficulty_multiplier  # Coins scale with streak
    hp_penalty = 10 * difficulty_multiplier  # HP penalty scales with streak

    if is_good:
        # Apply good habit rewards
        user.xp += xp_reward
        user.coins += coin_reward
          # Increment streak for good habit
    else:
        # Apply bad habit penalties
        if user.hp > hp_penalty:
            user.hp -= hp_penalty
        else:
            # User "dies": reset HP and deduct coins as a penalty
            user.hp = MAX_HP
            penalty = 20 * difficulty_multiplier
            user.coins = max(user.coins - penalty, 0)

          # Reset streak for bad habit

    # Check if user levels up
    new_level = calculate_level(user.xp)
    if new_level > user.level:
        user.level = new_level
        user.coins += 50  # Level-up reward

    db.session.commit()
    return jsonify({
        "message": "Habit updated successfully",
        "xp": user.xp,
        "level": user.level,
        "coins": user.coins,
        "hp": user.hp,
        
    }), 200