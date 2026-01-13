"""
Migration Script: Add Token Security Features
=============================================
This script adds necessary fields and collections for the enhanced JWT security:
1. Adds token_version field to existing users
2. Creates sessions collection for tracking active sessions
3. Creates token_blacklist collection for logout functionality
4. Creates security_logs collection for monitoring
5. Creates indexes for performance

Run this ONCE after updating the code.
"""

from database import db
import datetime

def migrate_add_security_features():
    print("=" * 60)
    print("MIGRATION: Adding Token Security Features")
    print("=" * 60)
    
    # Step 1: Add token_version to existing users
    print("\n[1/5] Adding token_version to existing users...")
    result = db.users.update_many(
        {"token_version": {"$exists": False}},
        {"$set": {"token_version": 1}}
    )
    print(f"   ✓ Updated {result.modified_count} users with token_version=1")
    
    # Step 2: Create sessions collection
    print("\n[2/5] Creating sessions collection...")
    if "sessions" not in db.list_collection_names():
        db.create_collection("sessions")
        print("   ✓ Sessions collection created")
    else:
        print("   ✓ Sessions collection already exists")
    
    # Create indexes for sessions
    db.sessions.create_index("token_id", unique=True)
    db.sessions.create_index([("user_id", 1), ("is_active", 1)])
    db.sessions.create_index("expires_at", expireAfterSeconds=0)  # Auto-delete expired sessions
    print("   ✓ Indexes created on sessions collection")
    
    # Step 3: Create token_blacklist collection
    print("\n[3/5] Creating token_blacklist collection...")
    if "token_blacklist" not in db.list_collection_names():
        db.create_collection("token_blacklist")
        print("   ✓ Token blacklist collection created")
    else:
        print("   ✓ Token blacklist collection already exists")
    
    # Create indexes for blacklist
    db.token_blacklist.create_index("token_id", unique=True)
    db.token_blacklist.create_index([("user_id", 1)])
    db.token_blacklist.create_index("expires_at", expireAfterSeconds=0)  # Auto-cleanup
    print("   ✓ Indexes created on token_blacklist collection")
    
    # Step 4: Create security_logs collection
    print("\n[4/5] Creating security_logs collection...")
    if "security_logs" not in db.list_collection_names():
        db.create_collection("security_logs")
        print("   ✓ Security logs collection created")
    else:
        print("   ✓ Security logs collection already exists")
    
    # Create indexes for security logs
    db.security_logs.create_index([("user_id", 1), ("timestamp", -1)])
    db.security_logs.create_index("timestamp", expireAfterSeconds=2592000)  # Keep logs for 30 days
    print("   ✓ Indexes created on security_logs collection")
    
    # Step 5: Create index on users.token_version
    print("\n[5/5] Creating index on users.token_version...")
    db.users.create_index("token_version")
    print("   ✓ Index created on users.token_version")
    
    # Summary
    print("\n" + "=" * 60)
    print("MIGRATION COMPLETED SUCCESSFULLY")
    print("=" * 60)
    print("\n✅ Token security features enabled:")
    print("   • Token versioning (revoke all tokens)")
    print("   • Token blacklisting (secure logout)")
    print("   • Session tracking (monitor active logins)")
    print("   • Security logging (audit trail)")
    print("   • Automatic cleanup (expired tokens/sessions)")
    print("\n⚠️  IMPORTANT:")
    print("   • All existing user sessions will remain valid")
    print("   • Users may need to re-login after token expiry")
    print("   • Tokens now bound to IP/User-Agent for extra security")
    print("\n" + "=" * 60)

if __name__ == "__main__":
    try:
        migrate_add_security_features()
    except Exception as e:
        print(f"\n❌ MIGRATION FAILED: {str(e)}")
        import traceback
        traceback.print_exc()
