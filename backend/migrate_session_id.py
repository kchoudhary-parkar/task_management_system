"""
Migration: Add session_id index and update existing sessions
This migration adds session_id to existing sessions for the new security model
"""
import uuid
from database import db
from bson import ObjectId

def migrate_session_ids():
    print("Starting session_id migration...")
    
    # 1. Update existing sessions without session_id FIRST
    print("\n1. Updating existing sessions with session_id...")
    sessions_without_id = list(db.sessions.find({"session_id": {"$exists": False}}))
    count = 0
    
    for session in sessions_without_id:
        session_id = str(uuid.uuid4())
        db.sessions.update_one(
            {"_id": session["_id"]},
            {"$set": {"session_id": session_id}}
        )
        count += 1
    
    print(f"   ✓ Updated {count} existing sessions with unique session_id")
    
    # 2. Now create unique index on session_id
    print("\n2. Creating session_id unique index...")
    try:
        db.sessions.create_index("session_id", unique=True)
        print("   ✓ session_id unique index created")
    except Exception as e:
        if "already exists" in str(e) or "index already exists" in str(e).lower():
            print("   ✓ session_id index already exists")
        else:
            raise
    
    # 3. Show session statistics
    print("\n3. Session Statistics:")
    total_sessions = db.sessions.count_documents({})
    active_sessions = db.sessions.count_documents({"is_active": True})
    sessions_with_id = db.sessions.count_documents({"session_id": {"$exists": True}})
    print(f"   Total sessions: {total_sessions}")
    print(f"   Active sessions: {active_sessions}")
    print(f"   Sessions with session_id: {sessions_with_id}")
    
    print("\n✅ Migration completed successfully!")
    print("\nSecurity Model:")
    print("   • Each token now contains a unique session_id")
    print("   • session_id MUST exist in database AND belong to token's user_id")
    print("   • Token theft prevention: Stolen tokens fail session-to-user validation")
    print("   • Even on same device/browser, session ownership is verified")

if __name__ == "__main__":
    try:
        migrate_session_ids()
    except Exception as e:
        print(f"\n❌ Migration failed: {str(e)}")
