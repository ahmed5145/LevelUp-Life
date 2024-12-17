from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from .models import Rewards, RewardsSchema, Users, db
from flask_cors import CORS

rewards_bp = Blueprint('rewards', __name__, url_prefix='/api/rewards')
CORS(rewards_bp, supports_credentials=True, origins=["http://localhost:3000", "http://127.0.0.1:3000"])

rewards_schema = RewardsSchema()
rewards_schemas = RewardsSchema(many=True)

# Fetch all rewards
@rewards_bp.route('', methods=['GET'])
@jwt_required()
def get_rewards():
    """Retrieve all rewards for the current user"""
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    rewards = Rewards.query.filter_by(user_id=user.id).all()
    return jsonify(rewards_schemas.dump(rewards)), 200

# Create a reward
@rewards_bp.route('', methods=['POST'])
@jwt_required()
def create_reward():
    """Create a new reward for the user"""
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()

    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    title = data.get('title')
    price = data.get('price')

    if not title or not price:
        return jsonify({"error": "Both title and price are required"}), 400

    new_reward = Rewards(user_id=user.id, title=title, price=price)
    db.session.add(new_reward)
    db.session.commit()

    return jsonify(rewards_schema.dump(new_reward)), 201

# Purchase a reward
@rewards_bp.route('/<int:reward_id>/buy', methods=['POST'])
@jwt_required()
def buy_reward(reward_id):
    """Allow the user to purchase a reward"""
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()

    reward = Rewards.query.filter_by(id=reward_id, user_id=user.id).first()

    if not reward:
        return jsonify({"error": "Reward not found"}), 404

    if user.coins < reward.price:
        return jsonify({"error": "Not enough coins to purchase this reward"}), 400

    # Deduct the coins
    user.coins -= reward.price
    db.session.commit()

    return jsonify({"message": f"Reward '{reward.title}' purchased!", "coins": user.coins}), 200

# Delete a reward
@rewards_bp.route('/<int:reward_id>', methods=['DELETE'])
@jwt_required()
def delete_reward(reward_id):
    """Delete a reward"""
    current_user_google_id = get_jwt_identity()
    user = Users.query.filter_by(google_id=current_user_google_id).first()

    reward = Rewards.query.filter_by(id=reward_id, user_id=user.id).first()

    if not reward:
        return jsonify({"error": "Reward not found"}), 404

    db.session.delete(reward)
    db.session.commit()

    return jsonify({"message": "Reward deleted successfully"}), 200
