from pymongo import MongoClient
from pymongo.errors import OperationFailure
import sys

# Test with the exact connection string
uri = "mongodb+srv://Admin:Lkbd2sXR80uUBd5T@jira-task-management.croznmu.mongodb.net/taskdb?retryWrites=true&w=majority&appName=jira-task-management"

print("Testing MongoDB Atlas connection...")
print(f"Username: Admin")
print(f"Password: Lkbd2sXR80uUBd5T")
print(f"Cluster: jira-task-management.croznmu.mongodb.net")
print(f"Database: taskdb")
print("\nAttempting connection...")

try:
    client = MongoClient(uri, serverSelectionTimeoutMS=5000)
    # Force connection
    db = client.taskdb
    db.command('ping')
    print("\n✓ SUCCESS: Connected to MongoDB Atlas!")
    print(f"✓ Database: {db.name}")
    print(f"✓ Collections: {db.list_collection_names()}")
    client.close()
except OperationFailure as e:
    print(f"\n✗ AUTHENTICATION FAILED: {e}")
    print("\nDouble-check in MongoDB Atlas:")
    print("1. Go to Security → Database Access")
    print("2. Click EDIT on user 'anage_db_user'")
    print("3. Click 'Edit Password'")
    print("4. Make sure password is EXACTLY: pENxg5pnsxmL9I6z")
    print("5. Click 'Update User'")
    sys.exit(1)
except Exception as e:
    print(f"\n✗ CONNECTION ERROR: {e}")
    sys.exit(1)
