"""
Database Migration: Enhanced Team Chat Features

This script creates the necessary collections and indexes for:
- Message reactions
- Mentions
- File attachments
- Read receipts

Run this script once to set up the enhanced chat database schema:
python backend/migrations/setup_enhanced_chat.py
"""

import os
import sys
from datetime import datetime

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database import db
def setup_enhanced_chat_schema():
    """Create collections and indexes for enhanced chat features"""
    print("=" * 60)
    print("Enhanced Team Chat Database Setup")
    print("=" * 60)
    print()
        
    # ============================================
    # 1. REACTIONS COLLECTION
    # ============================================
    print("Setting up chat_reactions collection...")
    
    reactions_collection = db["chat_reactions"]
    
    # Create indexes for reactions
    reactions_collection.create_index([("message_id", 1)])
    reactions_collection.create_index([("channel_id", 1)])
    reactions_collection.create_index([("user_id", 1)])
    reactions_collection.create_index([("message_id", 1), ("user_id", 1), ("emoji", 1)], unique=True)
    reactions_collection.create_index([("created_at", -1)])
    
    print("✓ chat_reactions collection created with indexes")
    print("  - message_id (indexed)")
    print("  - channel_id (indexed)")
    print("  - user_id (indexed)")
    print("  - (message_id, user_id, emoji) unique compound index")
    print("  - created_at (indexed, descending)")
    print()
    
    # ============================================
    # 2. MENTIONS COLLECTION
    # ============================================
    print("Setting up chat_mentions collection...")
    
    mentions_collection = db["chat_mentions"]
    
    # Create indexes for mentions
    mentions_collection.create_index([("mentioned_user_id", 1)])
    mentions_collection.create_index([("message_id", 1)])
    mentions_collection.create_index([("channel_id", 1)])
    mentions_collection.create_index([("project_id", 1)])
    mentions_collection.create_index([("mentioned_user_id", 1), ("read", 1)])
    mentions_collection.create_index([("created_at", -1)])
    
    print("✓ chat_mentions collection created with indexes")
    print("  - mentioned_user_id (indexed)")
    print("  - message_id (indexed)")
    print("  - channel_id (indexed)")
    print("  - project_id (indexed)")
    print("  - (mentioned_user_id, read) compound index")
    print("  - created_at (indexed, descending)")
    print()
    
    # ============================================
    # 3. UPDATE CHAT_MESSAGES COLLECTION
    # ============================================
    print("Updating chat_messages collection...")
    
    messages_collection = db["chat_messages"]
    
    # Add new indexes for enhanced features
    messages_collection.create_index([("text", "text")])  # Text search index
    
    # Update existing messages to have new fields if needed
    result = messages_collection.update_many(
        {"edited": {"$exists": False}},
        {"$set": {"edited": False}}
    )
    print(f"✓ Updated {result.modified_count} messages with 'edited' field")
    
    result = messages_collection.update_many(
        {"read_by": {"$exists": False}},
        {"$set": {"read_by": []}}
    )
    print(f"✓ Updated {result.modified_count} messages with 'read_by' field")
    print()
    
    # ============================================
    # 4. VERIFY COLLECTIONS
    # ============================================
    print("Verifying collections...")
    
    collections = db.list_collection_names()
    required_collections = [
        "chat_channels",
        "chat_messages",
        "chat_reactions",
        "chat_mentions"
    ]
    
    for coll in required_collections:
        if coll in collections:
            count = db[coll].count_documents({})
            print(f"✓ {coll}: {count} documents")
        else:
            print(f"✗ {coll}: NOT FOUND")
    
    print()
    
    # ============================================
    # 5. SAMPLE DATA (Optional)
    # ============================================
    print("Would you like to add sample reactions/mentions? (y/n): ", end="")
    add_sample = input().strip().lower()
    
    if add_sample == 'y':
        print("\nAdding sample data...")
        
        # Get a sample message
        sample_message = messages_collection.find_one({})
        
        if sample_message:
            # Add sample reaction
            reactions_collection.insert_one({
                "message_id": sample_message["_id"],
                "channel_id": sample_message["channel_id"],
                "user_id": sample_message["user_id"],
                "emoji": "👍",
                "created_at": datetime.utcnow()
            })
            print("✓ Added sample reaction")
            
            # Add sample mention
            mentions_collection.insert_one({
                "message_id": sample_message["_id"],
                "channel_id": sample_message["channel_id"],
                "project_id": sample_message["project_id"],
                "mentioned_user_id": sample_message["user_id"],
                "by_user_id": sample_message["user_id"],
                "read": False,
                "created_at": datetime.utcnow()
            })
            print("✓ Added sample mention")
        else:
            print("⚠ No messages found - skipping sample data")
    
    print()
    print("=" * 60)
    print("✅ Enhanced Team Chat setup complete!")
    print("=" * 60)
    print()
    print("New Features Available:")
    print("  ✓ Message reactions (emoji responses)")
    print("  ✓ @Mentions with notifications")
    print("  ✓ File attachments")
    print("  ✓ Message editing")
    print("  ✓ Message deletion")
    print("  ✓ Read receipts")
    print("  ✓ Message search")
    print("  ✓ Reply threads")
    print()
    print("Next Steps:")
    print("  1. Update your router.py with enhanced routes")
    print("  2. Update your server.py with route parsing")
    print("  3. Update frontend TeamChat component")
    print("  4. Test the new features!")
    print()

if __name__ == "__main__":
    try:
        setup_enhanced_chat_schema()
    except Exception as e:
        print(f"\n❌ Error during setup: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)