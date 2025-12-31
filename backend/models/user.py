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