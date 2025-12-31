import re

def validate_email(email: str) -> bool:
    """Basic email validation using regex"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password: str) -> bool:
    """Password must be at least 6 characters"""
    return len(password) >= 6

def validate_required_fields(data: dict, required_fields: list) -> str:
    """Validate that all required fields are present in data
    Returns error message if validation fails, None if valid"""
    for field in required_fields:
        if field not in data or not data[field]:
            return f"Missing required field: {field}"
    return None