import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/taskdb")
JWT_SECRET = os.getenv("JWT_SECRET", "your-super-secret-jwt-key-change-this")
JWT_EXPIRY_HOURS = 24