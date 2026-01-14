"""
Database initialization script
Creates the hardcoded super-admin account if it doesn't exist
"""
import os
from dotenv import load_dotenv
from database import users
from utils.auth_utils import hash_password

def initialize_super_admin():
    """
    Ensure the hardcoded super-admin exists in the database
    Email: superadmin@gmail.com
    Password: superadmin
    """
    SUPER_ADMIN_EMAIL = os.getenv("SADMIN_EMAIL")
    SUPER_ADMIN_PASSWORD = os.getenv("SADMIN_PASSWORD")
    SUPER_ADMIN_NAME = os.getenv("SADMIN_NAME")
    
    # Check if super-admin already exists
    existing_super_admin = users.find_one({"email": SUPER_ADMIN_EMAIL})
    
    if existing_super_admin:
        print(f"✓ Super-admin account already exists: {SUPER_ADMIN_EMAIL}")
        # Ensure role is set correctly (in case it was changed)
        if existing_super_admin.get("role") != "super-admin":
            users.update_one(
                {"email": SUPER_ADMIN_EMAIL},
                {"$set": {"role": "super-admin"}}
            )
            print(f"✓ Updated role to super-admin for: {SUPER_ADMIN_EMAIL}")
    else:
        # Create the super-admin account
        hashed_password = hash_password(SUPER_ADMIN_PASSWORD)
        users.insert_one({
            "name": SUPER_ADMIN_NAME,
            "email": SUPER_ADMIN_EMAIL,
            "password": hashed_password,
            "role": "super-admin"
        })
        print(f"✓ Created super-admin account: {SUPER_ADMIN_EMAIL}")
        print(f"  Password: {SUPER_ADMIN_PASSWORD}")
        print(f"  ⚠️  Please change the password after first login!")

if __name__ == "__main__":
    initialize_super_admin()
