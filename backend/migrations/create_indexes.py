"""
Migration: Create database indexes for optimal query performance
Run once: python migrations/create_indexes.py
"""
from database import users, projects, tasks, sprints

def create_indexes():
    """Create database indexes for optimal performance"""
    print("Creating database indexes...")
    
    try:
        # Users collection indexes
        try:
            users.create_index([("email", 1)], unique=True, name="email_1")
        except Exception:
            pass  # Index already exists
        try:
            users.create_index([("role", 1)])
        except Exception:
            pass
        print("✓ Users indexes created")
        
        # Projects collection indexes
        try:
            projects.create_index([("owner_id", 1)])
        except Exception:
            pass
        try:
            projects.create_index([("member_ids", 1)])
        except Exception:
            pass
        try:
            projects.create_index([("status", 1)])
        except Exception:
            pass
        try:
            projects.create_index([("created_at", -1)])
        except Exception:
            pass
        print("✓ Projects indexes created")
        
        # Tasks collection indexes (CRITICAL for performance)
        try:
            tasks.create_index([("project_id", 1)])  # Most important - filter by project
        except Exception:
            pass
        try:
            tasks.create_index([("sprint_id", 1)])
        except Exception:
            pass
        try:
            tasks.create_index([("assignee_id", 1)])
        except Exception:
            pass
        try:
            tasks.create_index([("status", 1)])
        except Exception:
            pass
        try:
            tasks.create_index([("created_by", 1)])
        except Exception:
            pass
        try:
            tasks.create_index([("ticket_id", 1)], unique=True)
        except Exception:
            pass
        try:
            tasks.create_index([("created_at", -1)])
        except Exception:
            pass
        try:
            tasks.create_index([("due_date", 1)])
        except Exception:
            pass
        # Compound indexes for common queries
        try:
            tasks.create_index([("project_id", 1), ("status", 1)])
        except Exception:
            pass
        try:
            tasks.create_index([("project_id", 1), ("sprint_id", 1)])
        except Exception:
            pass
        try:
            tasks.create_index([("project_id", 1), ("in_backlog", 1)])
        except Exception:
            pass
        print("✓ Tasks indexes created")
        
        # Sprints collection indexes
        try:
            sprints.create_index([("project_id", 1)])
        except Exception:
            pass
        try:
            sprints.create_index([("status", 1)])
        except Exception:
            pass
        try:
            sprints.create_index([("start_date", 1)])
        except Exception:
            pass
        try:
            sprints.create_index([("end_date", 1)])
        except Exception:
            pass
        # Compound index for active sprints query
        try:
            sprints.create_index([("project_id", 1), ("status", 1)])
        except Exception:
            pass
        print("✓ Sprints indexes created")
        
        print("✅ All database indexes created successfully!")
    except Exception as e:
        print(f"Error creating indexes: {e}")

if __name__ == "__main__":
    create_indexes()
