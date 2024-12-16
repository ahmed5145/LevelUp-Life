from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Users, Habits, db

rpg_bp = Blueprint('rpg', __name__, url_prefix='/api/rpg')

# Constants for leveling and HP
XP_PER_LEVEL = 100
MAX_HP = 100

# Helper function to calculate level based on XP
def calculate_level(xp):
    return xp // XP_PER_LEVEL + 1

@rpg_bp.route('/update_habit', methods=['POST'])
@jwt_required()
def update_habit():
    """Update habit and apply rewards/penalties."""
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    habit_id = data.get('habit_id')
    is_good = data.get('is_good')

    habit = Habits.query.filter_by(id=habit_id, user_id=user.id).first()

    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    if is_good:
        # Good habit: Reward XP and coins
        xp_reward = 10  # Example value
        coin_reward = 5  # Example value
        user.xp += xp_reward
        user.coins += coin_reward
    else:
        # Bad habit: Penalize HP
        hp_penalty = 15  # Example value
        if user.hp >= hp_penalty:
            user.hp -= hp_penalty
        else:
            # User "dies": Apply punishment
            user.hp = MAX_HP  # Reset HP
            penalty = 20  # Example penalty (lose coins)
            user.coins = max(user.coins - penalty, 0)

    # Check if user levels up
    new_level = calculate_level(user.xp)
    if new_level > user.level:
        user.level = new_level
        # Optional: Give level-up rewards
        user.coins += 50  # Example reward for leveling up

    db.session.commit()
    return jsonify({
        "message": "Habit updated successfully",
        "xp": user.xp,
        "level": user.level,
        "coins": user.coins,
        "hp": user.hp
    }), 200

@rpg_bp.route('/status', methods=['GET'])
@jwt_required()
def get_status():
    """Retrieve the current user's RPG status."""
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({
        "level": user.level,
        "xp": user.xp,
        "coins": user.coins,
        "hp": user.hp
    }), 200
