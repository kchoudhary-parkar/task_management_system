from database import tasks
from bson import ObjectId
from datetime import datetime, timezone

class Task:
    @staticmethod
    def create(task_data):
        """Create a new task"""
        task = {
            "ticket_id": task_data.get("ticket_id"),  # Unique ticket ID (e.g., PROJ-123)
            "issue_type": task_data.get("issue_type", "task"),  # bug, task, story, epic
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
            "labels": task_data.get("labels", []),  # List of labels/tags
            "attachments": task_data.get("attachments", []),  # List of attachments {name, url, added_by, added_at}
            "links": task_data.get("links", []),  # Ticket relationships {type, linked_task_id, linked_ticket_id}
            "activities": [],  # Activity log with comments and status changes
            "created_at": datetime.now(timezone.utc).replace(tzinfo=None),  # Store as naive UTC
            "updated_at": datetime.now(timezone.utc).replace(tzinfo=None)  # Store as naive UTC
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
    def find_by_ticket_id(ticket_id):
        """Find task by ticket ID (e.g., TMS-001)"""
        return tasks.find_one({"ticket_id": ticket_id.upper()})

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
        update_data["updated_at"] = datetime.now(timezone.utc).replace(tzinfo=None)  # Store as naive UTC
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
            "timestamp": datetime.now(timezone.utc).replace(tzinfo=None).isoformat()  # Store UTC time
        }
        result = tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$push": {"activities": activity}, "$set": {"updated_at": datetime.now(timezone.utc).replace(tzinfo=None)}}
        )
        return result.modified_count > 0

    @staticmethod
    def delete(task_id):
        """Delete a task"""
        result = tasks.delete_one({"_id": ObjectId(task_id)})
        return result.deleted_count > 0
    
    @staticmethod
    def add_label(task_id, label):
        """Add a label to task"""
        result = tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$addToSet": {"labels": label}}
        )
        return result.modified_count > 0
    
    @staticmethod
    def remove_label(task_id, label):
        """Remove a label from task"""
        result = tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$pull": {"labels": label}}
        )
        return result.modified_count > 0
    
    @staticmethod
    def find_by_label(project_id, label):
        """Find all tasks with a specific label in a project"""
        return list(tasks.find({"project_id": project_id, "labels": label}).sort("created_at", -1))
    
    @staticmethod
    def add_attachment(task_id, attachment_data):
        """Add an attachment to task"""
        attachment = {
            "name": attachment_data.get("name"),
            "url": attachment_data.get("url"),
            "added_by": attachment_data.get("added_by"),
            "added_by_name": attachment_data.get("added_by_name"),
            "added_at": datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
        }
        result = tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$push": {"attachments": attachment}}
        )
        return result.modified_count > 0, attachment
    
    @staticmethod
    def remove_attachment(task_id, attachment_url):
        """Remove an attachment from task by URL"""
        result = tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$pull": {"attachments": {"url": attachment_url}}}
        )
        return result.modified_count > 0
    
    @staticmethod
    def add_link(task_id, link_data):
        """Add a link to another task"""
        link = {
            "type": link_data.get("type"),  # blocks, blocked-by, relates-to, duplicates
            "linked_task_id": link_data.get("linked_task_id"),
            "linked_ticket_id": link_data.get("linked_ticket_id"),
            "created_at": datetime.now(timezone.utc).replace(tzinfo=None).isoformat()
        }
        result = tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$push": {"links": link}}
        )
        return result.modified_count > 0, link
    
    @staticmethod
    def remove_link(task_id, linked_task_id, link_type):
        """Remove a link to another task"""
        result = tasks.update_one(
            {"_id": ObjectId(task_id)},
            {"$pull": {"links": {"linked_task_id": linked_task_id, "type": link_type}}}
        )
        return result.modified_count > 0
    
    @staticmethod
    @staticmethod
    def delete_by_project(project_id):
        """Delete all tasks for a project"""
        result = tasks.delete_many({"project_id": project_id})
        return result.deleted_count

    @staticmethod
    def unassign_user_tasks(project_id, user_id):
        """Unassign all tasks assigned to a specific user in a project"""
        result = tasks.update_many(
            {
                "project_id": project_id,
                "assignee_id": user_id
            },
            {
                "$set": {
                    "assignee_id": None,
                    "assignee_name": "Unassigned",
                    "assignee_email": "",
                    "updated_at": datetime.now(timezone.utc).replace(tzinfo=None)
                }
            }
        )
        return result.modified_count
