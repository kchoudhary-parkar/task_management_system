from pymongo import MongoClient
from config import MONGO_URI

# Connect to MongoDB Atlas Cloud
client = MongoClient(MONGO_URI)
db = client["taskdb"]  # Explicitly specify database name
users = db.users
projects = db.projects
tasks = db.tasks
sprints = db.sprints