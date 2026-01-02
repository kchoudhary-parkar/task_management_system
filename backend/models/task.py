from database import tasks
from bson import ObjectId
from datetime import datetime

class Task:
    @staticmethod
    def create(task_data):
        """Create a new task"""
        task = {
            "title": task_data.get("title"),
            "description": task_data.get("description", ""),
            "project_id": task_data.get("project_id"),
            "sprint_id": task_data.get("sprint_id"),  # Sprint ID or None for backlog
            "priority": task_data.get("priority", "Medium"),  # Low, Medium, High
            "status": task_data.get("status", "To Do"),  # To Do, In Progress, Done
            "assignee_id": task_data.get("assignee_id"),  # User ID of assignee
            "assignee_name": task_data.get("assignee_name", "Unassigned"),
            "assignee_email": task_data.get("assignee_email", ""),
            "due_date": task_data.get("due_date"),  # ISO format date string
            "created_by": task_data.get("created_by"),  # User ID of creator
            "activities": [],  # Activity log with comments and status changes
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        result = tasks.insert_one(task)
        task["_id"] = result.inserted_id
        return task

    @staticmethod
    def find_by_id(task_id):
        """Find task by ID"""
        try:
            return tasks.find_one({"_id": ObjectId(task_id)})
        except:
            return None

    @staticmethod
    def find_by_project(project_id):
        """Get all tasks for a project"""
        return list(tasks.find({"project_id": project_id}).sort("created_at", -1))

    @staticmethod
    def find_by_sprint(sprint_id):
        """Get all tasks in a sprint"""
        return list(tasks.find({"sprint_id": sprint_id}).sort("created_at", -1))

    @staticmethod
    def find_backlog(project_id):
        """Get all tasks not in any sprint (backlog)"""
        return list(tasks.find({"project_id": project_id, "sprint_id": None}).sort("created_at", -1))

    @staticmethod
    def find_by_assignee(user_id):
        """Get all tasks assigned to a user"""
        return list(tasks.find({"assignee_id": user_id}).sort("created_at", -1))

    @staticmethod
    def update(task_id, update_data):
        """Update task details"""
        update_data["updated_at"] = datetime.utcnow()
        result = tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$set": update_data}
        )
        return result.modified_count > 0

    @staticmethod
    def add_activity(task_id, activity_data):
        """Add an activity/comment to task"""
        activity = {
            "user_id": activity_data.get("user_id"),
            "user_name": activity_data.get("user_name"),
            "action": activity_data.get("action"),  # "comment", "status_change", "assigned", etc.
            "comment": activity_data.get("comment", ""),
            "old_value": activity_data.get("old_value"),
            "new_value": activity_data.get("new_value"),
            "timestamp": datetime.utcnow().isoformat()
        }
        result = tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$push": {"activities": activity}, "$set": {"updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

    @staticmethod
    def delete(task_id):
        """Delete a task"""
        result = tasks.delete_one({"_id": ObjectId(task_id)})
        return result.deleted_count > 0

    @staticmethod
    def delete_by_project(project_id):
        """Delete all tasks for a project"""
        result = tasks.delete_many({"project_id": project_id})
        return result.deleted_count