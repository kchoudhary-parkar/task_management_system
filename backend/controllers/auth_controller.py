import json
from utils.auth_utils import hash_password, verify_password, create_token, verify_token
from utils.response import json_response, error_response
from models.user import User
from utils.validators import validate_email, validate_password  # implement simple ones

def register(body):
    data = json.loads(body)
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    role = data.get("role", "member")  # default role

    if not all([name, email, password]):
        return error_response("Missing fields", 400)

    if User.find_by_email(email):
        return error_response("Email already exists", 409)

    hashed = hash_password(password)
    user_data = {
        "name": name,
        "email": email,
        "password": hashed,
        "role": role
    }
    result = User.create(user_data)
    return json_response({"message": "Registered successfully", "user_id": str(result.inserted_id)}, 201)

def login(body):
    data = json.loads(body)
    email = data.get("email")
    password = data.get("password")

    user = User.find_by_email(email)
    if not user or not verify_password(password, user["password"]):
        return error_response("Invalid credentials", 401)

    token = create_token(user["_id"])
    return json_response({"token": token, "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user["role"]}})

def profile(user_id):
    user = User.find_by_id(user_id)
    if not user:
        return error_response("User not found", 404)
    return json_response({"id": str(user["_id"]), "name": user["name"], "email": user["email"], "role": user["role"]})

# Logout can be client-side only (delete token), or later add blacklist if needed