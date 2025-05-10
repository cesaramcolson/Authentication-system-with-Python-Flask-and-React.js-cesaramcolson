"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200

@api.route('/user', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    return jsonify({"user": user.serialize()}), 200

#signup endpoint
@api.route('/signup', methods=['POST'])
def signup():
    username = request.json.get('username')
    email = request.json.get('email')
    password = request.json.get('password')
    name = request.json.get('name')
    last_name = request.json.get('last_name')
    date_of_birth_str = request.json.get('date_of_birth')

    if not username or not email or not password:
        return jsonify({"error": "Missing required parameters"}), 400
    
    if User.query.filter_by(email=email).first() or User.query.filter_by(username=username).first():
        return jsonify({"error": "user already exist"}), 409
    
    try:
        date_of_birth = datetime.strptime(date_of_birth_str, "%Y-%m-%d").date() if date_of_birth_str else None
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    user = User(
        username=username,
        email=email,
        name=name,
        last_name=last_name,
        date_of_birth=date_of_birth
    )
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    token = user.generate_token()
    return jsonify({
        "token": token,
        "user": user.serialize()
    }), 201

#login endpoint
@api.route('/login', methods=['POST'])
def login():
    email = request.json.get('email')
    password = request.json.get('password')

    if not email or not password:
        return jsonify({"error": "Missing required parameters"}), 400

    user = User.query.filter_by(email=email).first()

    if user is None or not user.check_password(password) or not user.is_active:
        return jsonify({"error": "Invalid credentials or inactive user"}), 401

    token = user.generate_token()
    return jsonify({
        "token": token,
        "user": user.serialize()
    }), 201

#private data endpoint
@api.route('/private-data', methods=['GET'])
@jwt_required()
def private_data():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    return jsonify({"private-data": user.serialize()}), 200


#update users data only when logged in
@api.route('/user', methods=['PUT'])
@jwt_required()
def update_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    username = request.json.get('username')
    email = request.json.get('email')
    password = request.json.get('password')
    name = request.json.get('name')
    last_name = request.json.get('last_name')
    date_of_birth_str = request.json.get('date_of_birth')

    if username and username != user.username:
        if User.query.filter_by(username=username).first():
            return jsonify({"error": "Username already taken"}), 409
        user.username = username
    if email and email != user.email:
        if User.query.filter_by(email=email).first():
            return jsonify({"error": "Email already in use"}), 409
        user.email = email
    if password:
        user.set_password(password)
    if name:
        user.name = name
    if last_name:
        user.last_name = last_name
    if date_of_birth_str:
        try:
            user.date_of_birth = datetime.strptime(date_of_birth_str, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD."}), 400

    db.session.commit()
    return jsonify({"message": "User updated successfully", "user": user.serialize()}), 200


#delete user method only when logged in
@api.route('/user', methods=['DELETE'])
@jwt_required()
def delete_user():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "User deleted successfully"}), 200


