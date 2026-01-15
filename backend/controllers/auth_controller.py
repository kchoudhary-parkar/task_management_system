# import json
# from utils.auth_utils import (
#     hash_password, verify_password, create_token, verify_token,
#     blacklist_token, revoke_all_user_tokens, get_active_sessions
# )
# from utils.response import json_response, error_response
# from models.user import User
# from utils.validators import validate_email, validate_password  # implement simple ones

# def register(body, ip_address=None, user_agent=None):
#     data = json.loads(body)
#     name = data.get("name")
#     email = data.get("email")
#     password = data.get("password")
#     # All registrations are members by default
#     role = "member"

#     if not all([name, email, password]):
#         return error_response("Missing fields", 400)

#     if User.find_by_email(email):
#         return error_response("Email already exists", 409)

#     hashed = hash_password(password)
#     user_data = {
#         "name": name,
#         "email": email,
#         "password": hashed,
#         "role": role,
#         "token_version": 1  # Initialize token version for security
#     }
#     result = User.create(user_data)
#     return json_response({"message": "Registered successfully", "user_id": str(result.inserted_id)}, 201)

# def login(body, ip_address=None, user_agent=None):
#     """
#     Login with enhanced security:
#     - Creates token with IP/User-Agent binding
#     - Tracks session for security monitoring
#     """
#     data = json.loads(body)
#     email = data.get("email")
#     password = data.get("password")

#     user = User.find_by_email(email)
#     if not user or not verify_password(password, user["password"]):
#         return error_response("Invalid credentials", 401)

#     # Create secure token with session tracking
#     token, token_id, tab_session_key = create_token(
#         str(user["_id"]),
#         ip_address=ip_address,
#         user_agent=user_agent
#     )
    
#     return json_response({
#         "token": token,
#         "token_id": token_id,  # Return token_id for logout
#         "tab_session_key": tab_session_key,  # 🔐 Return tab key for client storage
#         "user": {
#             "id": str(user["_id"]),
#             "name": user["name"],
#             "email": user["email"],
#             "role": user["role"]
#         }
#     })

# def logout(user_id, body):
#     """
#     Secure logout:
#     - Blacklists current token
#     - Deactivates session
#     - Token becomes unusable immediately
#     """
#     try:
#         data = json.loads(body) if body else {}
#         token_id = data.get("token_id")
        
#         if not token_id:
#             return error_response("Token ID required for logout", 400)
        
#         # Blacklist the token
#         success = blacklist_token(token_id, user_id, reason="user_logout")
        
#         if success:
#             return json_response({"message": "Logged out successfully"}, 200)
#         else:
#             return error_response("Logout failed", 500)
            
#     except Exception as e:
#         print(f"[ERROR] Logout error: {str(e)}")
#         return error_response(f"Logout error: {str(e)}", 500)

# def logout_all_sessions(user_id):
#     """
#     Logout from all devices:
#     - Revokes all tokens by incrementing token version
#     - Use when account compromised or password changed
#     """
#     try:
#         success = revoke_all_user_tokens(user_id, reason="logout_all_devices")
        
#         if success:
#             return json_response({
#                 "message": "Logged out from all devices successfully"
#             }, 200)
#         else:
#             return error_response("Failed to logout from all devices", 500)
            
#     except Exception as e:
#         print(f"[ERROR] Logout all sessions error: {str(e)}")
#         return error_response(f"Error: {str(e)}", 500)

# def get_user_sessions(user_id):
#     """
#     Get user's active sessions for security dashboard
#     Shows where user is logged in
#     """
#     try:
#         sessions = get_active_sessions(user_id)
#         return json_response({"sessions": sessions}, 200)
#     except Exception as e:
#         print(f"[ERROR] Get sessions error: {str(e)}")
#         return error_response(f"Error: {str(e)}", 500)

# def profile(user_id):
#     user = User.find_by_id(user_id)
#     if not user:
#         return error_response("User not found", 404)
#     return json_response({
#         "id": str(user["_id"]),
#         "name": user["name"],
#         "email": user["email"],
#         "role": user["role"]
#     })
import json
from utils.auth_utils import (
    hash_password, verify_password, create_token, verify_token,
    blacklist_token, revoke_all_user_tokens, get_active_sessions
)
from utils.response import json_response, error_response
from models.user import User
from utils.validators import (
    validate_email, validate_password, validate_username, 
    check_password_strength
)

def register(body, ip_address=None, user_agent=None):
    """
    Enhanced registration with comprehensive validation
    """
    try:
        data = json.loads(body)
        name = data.get("name", "").strip()
        email = data.get("email", "").strip()
        password = data.get("password", "")
        confirm_password = data.get("confirm_password", "")
        
        # All registrations are members by default
        role = "member"

        # Validate required fields
        if not all([name, email, password]):
            return error_response("Missing required fields", 400)

        # Validate username/name
        name_valid, name_errors = validate_username(name)
        if not name_valid:
            return error_response({
                "message": "Invalid name",
                "errors": name_errors
            }, 400)

        # Validate email format
        if not validate_email(email):
            return error_response("Invalid email format", 400)

        # Validate password with enhanced requirements
        password_valid, password_errors = validate_password(password)
        if not password_valid:
            return error_response({
                "message": "Password does not meet requirements",
                "errors": password_errors
            }, 400)

        # Check password confirmation if provided
        if confirm_password and password != confirm_password:
            return error_response("Passwords do not match", 400)

        # Check if email already exists
        existing_user = User.find_by_email(email)
        if existing_user:
            return error_response("Email already exists", 409)

        # Hash password and create user
        hashed = hash_password(password)
        user_data = {
            "name": name,
            "email": email,
            "password": hashed,
            "role": role,
            "token_version": 1  # Initialize token version for security
        }
        
        result = User.create(user_data)
        
        # Get password strength for response
        strength = check_password_strength(password)
        
        return json_response({
            "message": "Registered successfully",
            "user_id": str(result.inserted_id),
            "password_strength": strength
        }, 201)
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON data", 400)
    except Exception as e:
        print(f"[ERROR] Registration error: {str(e)}")
        return error_response(f"Registration failed: {str(e)}", 500)


def login(body, ip_address=None, user_agent=None):
    """
    Login with enhanced security:
    - Creates token with IP/User-Agent binding
    - Tracks session for security monitoring
    """
    try:
        data = json.loads(body)
        email = data.get("email", "").strip()
        password = data.get("password", "")

        # Validate required fields
        if not email or not password:
            return error_response("Email and password are required", 400)

        # Find user by email
        user = User.find_by_email(email)
        if not user:
            return error_response("Invalid credentials", 401)
        
        # Verify password
        if not verify_password(password, user["password"]):
            return error_response("Invalid credentials", 401)

        # Create secure token with session tracking
        token, token_id, tab_session_key = create_token(
            str(user["_id"]),
            ip_address=ip_address,
            user_agent=user_agent
        )
        
        return json_response({
            "token": token,
            "token_id": token_id,  # Return token_id for logout
            "tab_session_key": tab_session_key,  # Return tab key for client storage
            "user": {
                "id": str(user["_id"]),
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        })
    except json.JSONDecodeError:
        return error_response("Invalid JSON data", 400)
    except Exception as e:
        print(f"[ERROR] Login error: {str(e)}")
        return error_response(f"Login failed: {str(e)}", 500)


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


def refresh_session(user_id, ip_address=None, user_agent=None):
    """
    Create a new tab session for an existing token.
    Called when opening app in a new tab with valid token but no tab session key.
    """
    try:
        # Verify user exists
        user = User.find_by_id(user_id)
        if not user:
            return error_response("User not found", 404)
        
        # Create a new tab session key (reuse token creation logic but only return tab key)
        from utils.auth_utils import generate_tab_session_key
        import secrets
        
        tab_session_key = secrets.token_urlsafe(32)
        
        # Store this session in the database (optional, for tracking)
        # For now, just return the new tab key
        
        return json_response({
            "tab_session_key": tab_session_key,
            "message": "New tab session created"
        }, 200)
        
    except Exception as e:
        print(f"[ERROR] Refresh session error: {str(e)}")
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


def change_password(user_id, body):
    """
    Change user password with validation
    """
    try:
        data = json.loads(body)
        current_password = data.get("current_password", "")
        new_password = data.get("new_password", "")
        confirm_password = data.get("confirm_password", "")
        
        # Validate required fields
        if not current_password or not new_password:
            return error_response("Current and new password are required", 400)
        
        # Get user
        user = User.find_by_id(user_id)
        if not user:
            return error_response("User not found", 404)
        
        # Verify current password
        if not verify_password(current_password, user["password"]):
            return error_response("Current password is incorrect", 401)
        
        # Validate new password
        password_valid, password_errors = validate_password(new_password)
        if not password_valid:
            return error_response({
                'message': 'New password does not meet requirements',
                'errors': password_errors
            }, 400)
        
        # Check password confirmation
        if confirm_password and new_password != confirm_password:
            return error_response("New passwords do not match", 400)
        
        # Check if new password is same as current
        if verify_password(new_password, user["password"]):
            return error_response("New password must be different from current password", 400)
        
        # Update password
        new_password_hash = hash_password(new_password)
        User.update(user_id, {"password": new_password_hash})
        
        # Revoke all existing tokens for security
        revoke_all_user_tokens(user_id, reason="password_changed")
        
        strength = check_password_strength(new_password)
        
        return json_response({
            'message': 'Password changed successfully. Please login again.',
            'password_strength': strength
        })
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON data", 400)
    except Exception as e:
        print(f"[ERROR] Change password error: {str(e)}")
        return error_response(f"Error: {str(e)}", 500)


def profile(user_id):
    """Get user profile"""
    try:
        user = User.find_by_id(user_id)
        if not user:
            return error_response("User not found", 404)
        
        return json_response({
            "id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        })
    except Exception as e:
        print(f"[ERROR] Profile error: {str(e)}")
        return error_response(f"Error: {str(e)}", 500)