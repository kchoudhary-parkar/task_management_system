import json
from models.task import Task
from models.project import Project
from models.user import User
from utils.response import success_response, error_response, datetime_to_iso
from utils.validators import validate_required_fields
from bson import ObjectId

def create_task(body_str, user_id):
    """Create a new task - requires authentication"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
    except:
        return error_response("Invalid JSON", 400)
    
    # Validate required fields
    required = ["title", "project_id"]
    validation_error = validate_required_fields(data, required)
    if validation_error:
        return error_response(validation_error, 400)
    
    # Validate title length
    if len(data["title"].strip()) < 3:
        return error_response("Task title must be at least 3 characters", 400)
    
    project_id = data["project_id"]
    
    # Check if project exists
    project = Project.find_by_id(project_id)
    if not project:
        return error_response("Project not found", 404)
    
    # Check if user is member or owner
    if not Project.is_member(project_id, user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    # Validate priority
    valid_priorities = ["Low", "Medium", "High"]
    priority = data.get("priority", "Medium")
    if priority not in valid_priorities:
        return error_response(f"Priority must be one of: {', '.join(valid_priorities)}", 400)
    
    # Validate status
    valid_statuses = ["To Do", "In Progress", "Testing", "Incomplete", "Done"]
    status = data.get("status", "To Do")
    if status not in valid_statuses:
        return error_response(f"Status must be one of: {', '.join(valid_statuses)}", 400)
    
    # Validate assignee if provided
    assignee_id = data.get("assignee_id")
    assignee_name = "Unassigned"
    assignee_email = ""
    
    if assignee_id:
        # Check if assignee is a project member
        if not Project.is_member(project_id, assignee_id):
            return error_response("Assignee must be a project member", 400)
        
        # Get assignee info
        assignee = User.find_by_id(assignee_id)
        if assignee:
            assignee_name = assignee["name"]
            assignee_email = assignee["email"]
    
    # Create task
    task_data = {
        "title": data["title"].strip(),
        "description": data.get("description", "").strip(),
        "project_id": project_id,
        "priority": priority,
        "status": status,
        "assignee_id": assignee_id,
        "assignee_name": assignee_name,
        "assignee_email": assignee_email,
        "due_date": data.get("due_date"),
        "created_by": user_id
    }
    
    task = Task.create(task_data)
    
    # Convert ObjectId and datetime to strings
    task["_id"] = str(task["_id"])
    task["created_at"] = datetime_to_iso(task["created_at"])
    task["updated_at"] = datetime_to_iso(task["updated_at"])
    
    return success_response({
        "message": "Task created successfully",
        "task": task
    }, 201)


def get_project_tasks(project_id, user_id):
    """Get all tasks for a project"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    # Check if project exists
    project = Project.find_by_id(project_id)
    if not project:
        return error_response("Project not found", 404)
    
    # Check if user is member or owner
    if not Project.is_member(project_id, user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    tasks_list = Task.find_by_project(project_id)
    
    # Convert ObjectId and datetime to strings
    for task in tasks_list:
        task["_id"] = str(task["_id"])
        task["created_at"] = datetime_to_iso(task["created_at"])
        task["updated_at"] = datetime_to_iso(task["updated_at"])
    
    return success_response({
        "tasks": tasks_list,
        "count": len(tasks_list)
    })


def get_task_by_id(task_id, user_id):
    """Get a specific task by ID"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    task = Task.find_by_id(task_id)
    
    if not task:
        return error_response("Task not found", 404)
    
    # Check if user is member of the project
    if not Project.is_member(task["project_id"], user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    # Convert ObjectId and datetime to strings
    task["_id"] = str(task["_id"])
    task["created_at"] = datetime_to_iso(task["created_at"])
    task["updated_at"] = datetime_to_iso(task["updated_at"])
    
    return success_response({"task": task})


def update_task(body_str, task_id, user_id):
    """Update a task"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
    except:
        return error_response("Invalid JSON", 400)
    
    # Check if task exists
    task = Task.find_by_id(task_id)
    if not task:
        return error_response("Task not found", 404)
    
    # Check if user is member of the project
    if not Project.is_member(task["project_id"], user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    # Prepare update data
    update_data = {}
    
    if "title" in data:
        if len(data["title"].strip()) < 3:
            return error_response("Task title must be at least 3 characters", 400)
        update_data["title"] = data["title"].strip()
    
    if "description" in data:
        update_data["description"] = data["description"].strip()
    
    if "priority" in data:
        valid_priorities = ["Low", "Medium", "High"]
        if data["priority"] not in valid_priorities:
            return error_response(f"Priority must be one of: {', '.join(valid_priorities)}", 400)
        update_data["priority"] = data["priority"]
    
    if "status" in data:
        valid_statuses = ["To Do", "In Progress", "Testing", "Incomplete", "Done"]
        if data["status"] not in valid_statuses:
            return error_response(f"Status must be one of: {', '.join(valid_statuses)}", 400)
        
        # Comment is optional for status changes (allows Kanban drag-drop)
        # If comment is provided, it will be logged in activity
        update_data["status"] = data["status"]
    
    if "assignee_id" in data:
        assignee_id = data["assignee_id"]
        if assignee_id:
            # Check if assignee is a project member
            if not Project.is_member(task["project_id"], assignee_id):
                return error_response("Assignee must be a project member", 400)
            
            # Get assignee info
            assignee = User.find_by_id(assignee_id)
            if assignee:
                update_data["assignee_id"] = assignee_id
                update_data["assignee_name"] = assignee["name"]
                update_data["assignee_email"] = assignee["email"]
        else:
            # Unassign
            update_data["assignee_id"] = None
            update_data["assignee_name"] = "Unassigned"
            update_data["assignee_email"] = ""
    
    if "due_date" in data:
        update_data["due_date"] = data["due_date"]
    
    if not update_data and not data.get("comment"):
        return error_response("No valid fields to update", 400)
    
    # Get user info for activity log
    current_user = User.find_by_id(user_id)
    user_name = current_user["name"] if current_user else "Unknown"
    
    # Update task
    success = Task.update(task_id, update_data)
    
    if success:
        # Add activity log for status change with comment
        if "status" in data:
            old_status = task.get("status", "To Do")
            # Only log if status actually changed
            if old_status != data["status"]:
                activity_data = {
                    "user_id": user_id,
                    "user_name": user_name,
                    "action": "status_change",
                    "comment": data.get("comment", ""),
                    "old_value": old_status,
                    "new_value": data["status"]
                }
                Task.add_activity(task_id, activity_data)
        # Add activity log for comment only (no status change)
        elif data.get("comment", "").strip():
            activity_data = {
                "user_id": user_id,
                "user_name": user_name,
                "action": "comment",
                "comment": data.get("comment", "").strip(),
                "old_value": None,
                "new_value": None
            }
            Task.add_activity(task_id, activity_data)
        
        updated_task = Task.find_by_id(task_id)
        updated_task["_id"] = str(updated_task["_id"])
        updated_task["created_at"] = datetime_to_iso(updated_task["created_at"])
        updated_task["updated_at"] = datetime_to_iso(updated_task["updated_at"])
        
        return success_response({
            "message": "Task updated successfully",
            "task": updated_task
        })
    else:
        return error_response("Failed to update task", 500)


def delete_task(task_id, user_id):
    """Delete a task"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    # Check if task exists
    task = Task.find_by_id(task_id)
    if not task:
        return error_response("Task not found", 404)
    
    # Check if user is member of the project
    if not Project.is_member(task["project_id"], user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    # Delete task
    success = Task.delete(task_id)
    
    if success:
        return success_response({
            "message": "Task deleted successfully"
        })
    else:
        return error_response("Failed to delete task", 500)


def get_my_tasks(user_id):
    """Get all tasks assigned to the logged-in user with project and owner details"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    tasks_list = Task.find_by_assignee(user_id)
    
    # Enrich tasks with project name and owner name
    from database import db
    for task in tasks_list:
        task["_id"] = str(task["_id"])
        task["created_at"] = datetime_to_iso(task["created_at"])
        task["updated_at"] = datetime_to_iso(task["updated_at"])
        
        # Get project details
        project = db.projects.find_one({"_id": ObjectId(task["project_id"])})
        if project:
            task["project_name"] = project.get("name", "Unknown Project")
            
            # Get owner details
            owner = db.users.find_one({"_id": ObjectId(project["user_id"])})
            if owner:
                task["created_by_name"] = owner.get("name", "Unknown")
                task["created_by_email"] = owner.get("email", "")
    
    return success_response({
        "tasks": tasks_list,
        "count": len(tasks_list)
    })
