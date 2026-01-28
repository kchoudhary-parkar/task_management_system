# """
# Migration: Initialize chat channels for existing projects
# Run once: python migrations/init_chat_channels.py
# """
# from database import db
# from datetime import datetime, timezone

# def init_chat_channels():
#     """Initialize default chat channels for all existing projects"""
#     print("Initializing chat channels for existing projects...")
    
#     try:
#         # Get all projects
#         projects = list(db.projects.find({}, {"_id": 1, "name": 1}))
        
#         print(f"Found {len(projects)} projects")
        
#         default_channels = [
#             {
#                 "name": "general",
#                 "description": "General project discussion"
#             },
#             {
#                 "name": "announcements",
#                 "description": "Important announcements"
#             },
#             {
#                 "name": "random",
#                 "description": "Off-topic discussions"
#             }
#         ]
        
#         initialized_count = 0
#         skipped_count = 0
        
#         for project in projects:
#             project_id = str(project["_id"])
            
#             # Check if channels already exist
#             existing = db.chat_channels.find_one({
#                 "project_id": project_id,
#                 "name": "general"
#             })
            
#             if existing:
#                 print(f"  ⊘ Skipped: {project.get('name', 'Unknown')} (already has channels)")
#                 skipped_count += 1
#                 continue
            
#             # Create default channels
#             for channel_info in default_channels:
#                 channel_data = {
#                     "project_id": project_id,
#                     "name": channel_info["name"],
#                     "description": channel_info["description"],
#                     "created_by": None,  # System created
#                     "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
#                     "updated_at": datetime.now(timezone.utc).replace(tzinfo=None)
#                 }
#                 db.chat_channels.insert_one(channel_data)
            
#             print(f"  ✓ Initialized: {project.get('name', 'Unknown')}")
#             initialized_count += 1
        
#         print(f"\n✅ Chat channels initialized successfully!")
#         print(f"   Initialized: {initialized_count} projects")
#         print(f"   Skipped: {skipped_count} projects (already had channels)")
        
#         # Create indexes for chat collections
#         print("\nCreating indexes for chat collections...")
        
#         # Chat channels indexes
#         try:
#             db.chat_channels.create_index([("project_id", 1)])
#             db.chat_channels.create_index([("name", 1)])
#             db.chat_channels.create_index([("project_id", 1), ("name", 1)], unique=True)
#             print("  ✓ Chat channels indexes created")
#         except Exception as e:
#             print(f"  ⚠ Chat channels indexes: {e}")
        
#         # Chat messages indexes
#         try:
#             db.chat_messages.create_index([("channel_id", 1)])
#             db.chat_messages.create_index([("project_id", 1)])
#             db.chat_messages.create_index([("user_id", 1)])
#             db.chat_messages.create_index([("created_at", -1)])
#             db.chat_messages.create_index([("channel_id", 1), ("created_at", -1)])
#             print("  ✓ Chat messages indexes created")
#         except Exception as e:
#             print(f"  ⚠ Chat messages indexes: {e}")
        
#     except Exception as e:
#         print(f"❌ Error initializing chat channels: {e}")
#         import traceback
#         traceback.print_exc()

# if __name__ == "__main__":
#     init_chat_channels()
"""
Migration: Initialize chat channels for existing projects
Run once: python migrations/init_chat_channels.py
"""
import sys
import os

# Add parent directory to path so we can import backend modules
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import db
from datetime import datetime, timezone

def init_chat_channels():
    """Initialize default chat channels for all existing projects"""
    print("Initializing chat channels for existing projects...")
    
    try:
        # Get all projects
        projects = list(db.projects.find({}, {"_id": 1, "name": 1}))
        
        print(f"Found {len(projects)} projects")
        
        default_channels = [
            {
                "name": "general",
                "description": "General project discussion"
            },
            {
                "name": "announcements",
                "description": "Important announcements"
            },
            {
                "name": "random",
                "description": "Off-topic discussions"
            }
        ]
        
        initialized_count = 0
        skipped_count = 0
        
        for project in projects:
            project_id = str(project["_id"])
            
            # Check if channels already exist
            existing = db.chat_channels.find_one({
                "project_id": project_id,
                "name": "general"
            })
            
            if existing:
                print(f"  ⊘ Skipped: {project.get('name', 'Unknown')} (already has channels)")
                skipped_count += 1
                continue
            
            # Create default channels
            for channel_info in default_channels:
                channel_data = {
                    "project_id": project_id,
                    "name": channel_info["name"],
                    "description": channel_info["description"],
                    "created_by": None,  # System created
                    "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
                    "updated_at": datetime.now(timezone.utc).replace(tzinfo=None)
                }
                db.chat_channels.insert_one(channel_data)
            
            print(f"  ✓ Initialized: {project.get('name', 'Unknown')}")
            initialized_count += 1
        
        print(f"\n✅ Chat channels initialized successfully!")
        print(f"   Initialized: {initialized_count} projects")
        print(f"   Skipped: {skipped_count} projects (already had channels)")
        
        # Create indexes for chat collections
        print("\nCreating indexes for chat collections...")
        
        # Chat channels indexes
        try:
            db.chat_channels.create_index([("project_id", 1)])
            db.chat_channels.create_index([("name", 1)])
            db.chat_channels.create_index([("project_id", 1), ("name", 1)], unique=True)
            print("  ✓ Chat channels indexes created")
        except Exception as e:
            print(f"  ⚠ Chat channels indexes: {e}")
        
        # Chat messages indexes
        try:
            db.chat_messages.create_index([("channel_id", 1)])
            db.chat_messages.create_index([("project_id", 1)])
            db.chat_messages.create_index([("user_id", 1)])
            db.chat_messages.create_index([("created_at", -1)])
            db.chat_messages.create_index([("channel_id", 1), ("created_at", -1)])
            print("  ✓ Chat messages indexes created")
        except Exception as e:
            print(f"  ⚠ Chat messages indexes: {e}")
        
    except Exception as e:
        print(f"❌ Error initializing chat channels: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    init_chat_channels()