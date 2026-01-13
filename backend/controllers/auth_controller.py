import json
from utils.auth_utils import (
    hash_password, verify_password, create_token, verify_token,
    blacklist_token, revoke_all_user_tokens, get_active_sessions
)
from utils.response import json_response, error_response
from models.user import User
from utils.validators import validate_email, validate_password  # implement simple ones

def register(body, ip_address=None, user_agent=None):
    data = json.loads(body)
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    # All registrations are members by default
    role = "member"

    if not all([name, email, password]):
        return error_response("Missing fields", 400)

    if User.find_by_email(email):
        return error_response("Email already exists", 409)

    hashed = hash_password(password)
    user_data = {
        "name": name,
        "email": email,
        "password": hashed,
        "role": role,
        "token_version": 1  # Initialize token version for security
    }
    result = User.create(user_data)
    return json_response({"message": "Registered successfully", "user_id": str(result.inserted_id)}, 201)

def login(body, ip_address=None, user_agent=None):
    """
    Login with enhanced security:
    - Creates token with IP/User-Agent binding
    - Tracks session for security monitoring
    """
    data = json.loads(body)
    email = data.get("email")
    password = data.get("password")

    user = User.find_by_email(email)
    if not user or not verify_password(password, user["password"]):
        return error_response("Invalid credentials", 401)

    # Create secure token with session tracking
    token, token_id = create_token(
        str(user["_id"]),
        ip_address=ip_address,
        user_agent=user_agent
    )
    
    return json_response({
        "token": token,
        "token_id": token_id,  # Return token_id for logout
        "user": {
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    })

def logout(user_id, body):
    """
    Secure logout:
    - Blacklists current token
    - Deactivates session
    - Token becomes unusable immediately
    """
    try:
        data = json.loads(body) if body else {}
        token_id = data.get("token_id")
        
        if not token_id:
            return error_response("Token ID required for logout", 400)
        
        # Blacklist the token
        success = blacklist_token(token_id, user_id, reason="user_logout")
        
        if success:
            return json_response({"message": "Logged out successfully"}, 200)
        else:
            return error_response("Logout failed", 500)
            
    except Exception as e:
        print(f"[ERROR] Logout error: {str(e)}")
        return error_response(f"Logout error: {str(e)}", 500)

def logout_all_sessions(user_id):
    """
    Logout from all devices:
    - Revokes all tokens by incrementing token version
    - Use when account compromised or password changed
    """
    try:
        success = revoke_all_user_tokens(user_id, reason="logout_all_devices")
        
        if success:
            return json_response({
                "message": "Logged out from all devices successfully"
            }, 200)
        else:
            return error_response("Failed to logout from all devices", 500)
            
    except Exception as e:
        print(f"[ERROR] Logout all sessions error: {str(e)}")
        return error_response(f"Error: {str(e)}", 500)

def get_user_sessions(user_id):
    """
    Get user's active sessions for security dashboard
    Shows where user is logged in
    """
    try:
        sessions = get_active_sessions(user_id)
        return json_response({"sessions": sessions}, 200)
    except Exception as e:
        print(f"[ERROR] Get sessions error: {str(e)}")
        return error_response(f"Error: {str(e)}", 500)

def profile(user_id):
    user = User.find_by_id(user_id)
    if not user:
        return error_response("User not found", 404)
    return json_response({
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "role": user["role"]
    })