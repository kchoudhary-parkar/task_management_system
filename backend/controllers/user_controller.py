from database import db
from utils.response import success_response, error_response

def search_users_by_email(email_query):
    """Search users by email (for adding to project team)"""
    try:
        if not email_query or len(email_query.strip()) < 2:
            return error_response("Please enter at least 2 characters to search", 400)
        
        # Search for users whose email contains the query (case-insensitive)
        users = list(db.users.find(
            {"email": {"$regex": email_query, "$options": "i"}},
            {"_id": 1, "name": 1, "email": 1}
        ).limit(10))
        
        # Convert ObjectId to string
        for user in users:
            user["_id"] = str(user["_id"])
        
        return success_response({"users": users}, 200)
    except Exception as e:
        return error_response(f"Error searching users: {str(e)}", 500)
