"""
Migration script to add in_backlog field to existing tasks
Run this once to update all existing tasks in the database
"""
from database import tasks

def migrate_backlog_field():
    # Update all tasks that don't have the in_backlog field
    result = tasks.update_many(
        {"in_backlog": {"$exists": False}},
        {"$set": {
            "in_backlog": False,
            "moved_to_backlog_at": None
        }}
    )
    
    print(f"Migration completed!")
    print(f"Updated {result.modified_count} tasks with in_backlog field")
    
    # Also update any tasks with sprint_id=None but no in_backlog field
    # These should not be in backlog unless explicitly moved there
    result2 = tasks.update_many(
        {"sprint_id": None, "in_backlog": {"$exists": True}, "in_backlog": {"$ne": True}},
        {"$set": {"in_backlog": False}}
    )
    print(f"Ensured {result2.modified_count} tasks without sprint are not in backlog")

if __name__ == "__main__":
    migrate_backlog_field()
