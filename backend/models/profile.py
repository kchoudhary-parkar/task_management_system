from database import db
from bson import ObjectId

profiles = db.profiles

class Profile:
    @staticmethod
    def find_by_user(user_id):
        """Find profile by user ID"""
        return profiles.find_one({"user_id": user_id})
    
    @staticmethod
    def create(user_id):
        """Create new profile for user"""
        profile = {
            "user_id": user_id,
            "personal": {},
            "education": [],
            "certificates": [],
            "organization": {}
        }
        result = profiles.insert_one(profile)
        profile["_id"] = str(result.inserted_id)
        return profile
    
    @staticmethod
    def update_personal(user_id, personal_data):
        """Update personal information"""
        result = profiles.update_one(
            {"user_id": user_id},
            {"$set": {"personal": personal_data}},
            upsert=True
        )
        return result.modified_count > 0 or result.upserted_id is not None
    
    @staticmethod
    def update_education(user_id, education_list):
        """Update education list"""
        result = profiles.update_one(
            {"user_id": user_id},
            {"$set": {"education": education_list}},
            upsert=True
        )
        return result.modified_count > 0 or result.upserted_id is not None
    
    @staticmethod
    def update_certificates(user_id, certificates_list):
        """Update certificates list"""
        result = profiles.update_one(
            {"user_id": user_id},
            {"$set": {"certificates": certificates_list}},
            upsert=True
        )
        return result.modified_count > 0 or result.upserted_id is not None
    
    @staticmethod
    def update_organization(user_id, organization_data):
        """Update organization information"""
        result = profiles.update_one(
            {"user_id": user_id},
            {"$set": {"organization": organization_data}},
            upsert=True
        )
        return result.modified_count > 0 or result.upserted_id is not None
