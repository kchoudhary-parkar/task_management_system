from database import users
from bson import ObjectId

class User:
    @staticmethod
    def find_by_email(email):
        return users.find_one({"email": email})

    @staticmethod
    def find_by_id(user_id):
        return users.find_one({"_id": ObjectId(user_id)})

    @staticmethod
    def create(user_data):
        return users.insert_one(user_data)
    
    @staticmethod
    def count_users():
        return users.count_documents({})
    
    @staticmethod
    def get_all_users():
        return list(users.find({}, {"password": 0}))
    
    @staticmethod
    def update_role(user_id, new_role):
        return users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": {"role": new_role}}
        )
    
    @staticmethod
    def find_super_admins():
        return list(users.find({"role": "super-admin"}))