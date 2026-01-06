import json
from models.task import Task
from models.project import Project
from models.user import User
from utils.response import success_response, error_response, datetime_to_iso
from utils.validators import validate_required_fields
from utils.ticket_utils import generate_ticket_id
from utils.label_utils import validate_label, normalize_label
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
    
    # Validate issue type
    valid_issue_types = ["task", "bug", "story", "epic"]
    issue_type = data.get("issue_type", "task").lower()
    if issue_type not in valid_issue_types:
        return error_response(f"Issue type must be one of: {', '.join(valid_issue_types)}", 400)
    
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
    
    # Generate unique ticket ID
    try:
        ticket_id = generate_ticket_id(project_id, issue_type)
    except Exception as e:
        return error_response(f"Failed to generate ticket ID: {str(e)}", 500)
    
    # Validate and normalize labels
    labels = data.get("labels", [])
    if labels:
        if not isinstance(labels, list):
            return error_response("Labels must be an array", 400)
        
        normalized_labels = []
        for label in labels:
            if not isinstance(label, str):
                return error_response("Each label must be a string", 400)
            
            is_valid, error_msg = validate_label(label)
            if not is_valid:
                return error_response(f"Invalid label '{label}': {error_msg}", 400)
            
            normalized_labels.append(normalize_label(label))
        
        # Remove duplicates
        labels = list(set(normalized_labels))
    
    # Create task
    task_data = {
        "ticket_id": ticket_id,
        "issue_type": issue_type,
        "title": data["title"].strip(),
        "description": data.get("description", "").strip(),
        "project_id": project_id,
        "priority": priority,
        "status": status,
        "assignee_id": assignee_id,
        "assignee_name": assignee_name,
        "assignee_email": assignee_email,
        "due_date": data.get("due_date"),
        "labels": labels,
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
    
    if "issue_type" in data:
        valid_issue_types = ["bug", "task", "story", "epic"]
        if data["issue_type"] not in valid_issue_types:
            return error_response(f"Issue type must be one of: {', '.join(valid_issue_types)}", 400)
        update_data["issue_type"] = data["issue_type"]
    
    if "labels" in data:
        # Validate labels if provided
        labels = data["labels"]
        if not isinstance(labels, list):
            return error_response("Labels must be a list", 400)
        update_data["labels"] = labels
    
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


def add_label_to_task(task_id, body_str, user_id):
    """Add a label to a task"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
    except:
        return error_response("Invalid JSON", 400)
    
    # Validate required fields
    if "label" not in data:
        return error_response("Label is required", 400)
    
    label = data["label"]
    
    # Validate label
    is_valid, error_msg = validate_label(label)
    if not is_valid:
        return error_response(f"Invalid label: {error_msg}", 400)
    
    # Normalize label
    label = normalize_label(label)
    
    # Check if task exists
    task = Task.find_by_id(task_id)
    if not task:
        return error_response("Task not found", 404)
    
    # Check if user is member of the project
    if not Project.is_member(task["project_id"], user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    # Add label
    success = Task.add_label(task_id, label)
    
    if success:
        return success_response({
            "message": "Label added successfully",
            "label": label
        })
    else:
        return success_response({
            "message": "Label already exists on this task",
            "label": label
        })


def remove_label_from_task(task_id, label, user_id):
    """Remove a label from a task"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    # Normalize label
    label = normalize_label(label)
    
    # Check if task exists
    task = Task.find_by_id(task_id)
    if not task:
        return error_response("Task not found", 404)
    
    # Check if user is member of the project
    if not Project.is_member(task["project_id"], user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    # Remove label
    success = Task.remove_label(task_id, label)
    
    if success:
        return success_response({
            "message": "Label removed successfully",
            "label": label
        })
    else:
        return error_response("Label not found on this task", 404)


def get_project_labels(project_id, user_id):
    """Get all unique labels used in a project"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    # Check if project exists
    project = Project.find_by_id(project_id)
    if not project:
        return error_response("Project not found", 404)
    
    # Check if user is member or owner
    if not Project.is_member(project_id, user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    # Get all tasks for project
    tasks_list = Task.find_by_project(project_id)
    
    # Collect all unique labels
    labels = set()
    for task in tasks_list:
        if "labels" in task and task["labels"]:
            labels.update(task["labels"])
    
    return success_response({
        "labels": sorted(list(labels))
    })

def add_attachment_to_task(task_id, body_str, user_id):
    """Add an attachment (URL) to a task"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
    except:
        return error_response("Invalid JSON", 400)
    
    # Validate required fields
    required = ["name", "url"]
    validation_error = validate_required_fields(data, required)
    if validation_error:
        return error_response(validation_error, 400)
    
    # Validate URL format
    url = data["url"].strip()
    if not url.startswith(("http://", "https://")):
        return error_response("URL must start with http:// or https://", 400)
    
    # Validate name length
    name = data["name"].strip()
    if len(name) < 1 or len(name) > 100:
        return error_response("Attachment name must be 1-100 characters", 400)
    
    # Check if task exists
    task = Task.find_by_id(task_id)
    if not task:
        return error_response("Task not found", 404)
    
    # Check if user is member of the project
    if not Project.is_member(task["project_id"], user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    # Get user info
    user = User.find_by_id(user_id)
    if not user:
        return error_response("User not found", 404)
    
    # Add attachment
    attachment_data = {
        "name": name,
        "url": url,
        "added_by": user_id,
        "added_by_name": user["name"]
    }
    
    success, attachment = Task.add_attachment(task_id, attachment_data)
    
    if success:
        return success_response({
            "message": "Attachment added successfully",
            "attachment": attachment
        })
    else:
        return error_response("Failed to add attachment", 500)


def remove_attachment_from_task(task_id, body_str, user_id):
    """Remove an attachment from a task"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
    except:
        return error_response("Invalid JSON", 400)
    
    # Validate required fields
    if "url" not in data:
        return error_response("URL is required", 400)
    
    url = data["url"]
    
    # Check if task exists
    task = Task.find_by_id(task_id)
    if not task:
        return error_response("Task not found", 404)
    
    # Check if user is member of the project
    if not Project.is_member(task["project_id"], user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    # Remove attachment
    success = Task.remove_attachment(task_id, url)
    
    if success:
        return success_response({
            "message": "Attachment removed successfully"
        })
    else:
        return error_response("Attachment not found on this task", 404)


def add_link_to_task(task_id, body_str, user_id):
    """Add a link to another task"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
    except:
        return error_response("Invalid JSON", 400)
    
    # Accept either linked_task_id (MongoDB _id) or linked_ticket_id (TMS-001, etc.)
    linked_task_id = data.get("linked_task_id")
    linked_ticket_id = data.get("linked_ticket_id")
    link_type = data.get("type")
    
    if not link_type:
        return error_response("Missing required field: type", 400)
    
    if not linked_task_id and not linked_ticket_id:
        return error_response("Missing required field: linked_task_id or linked_ticket_id", 400)
    
    # Validate link type
    valid_link_types = ["blocks", "blocked-by", "relates-to", "duplicates"]
    if link_type not in valid_link_types:
        return error_response(f"Link type must be one of: {', '.join(valid_link_types)}", 400)
    
    # Check if source task exists
    task = Task.find_by_id(task_id)
    if not task:
        return error_response("Task not found", 404)
    
    # Find linked task by ticket_id or task_id
    linked_task = None
    if linked_ticket_id:
        # Search by ticket_id (e.g., TMS-001)
        linked_task = Task.find_by_ticket_id(linked_ticket_id)
        if not linked_task:
            return error_response(f"Task with ticket ID '{linked_ticket_id}' not found", 404)
        linked_task_id = str(linked_task["_id"])
    else:
        # Search by MongoDB _id
        linked_task = Task.find_by_id(linked_task_id)
        if not linked_task:
            return error_response("Linked task not found", 404)
    
    # Check if user is member of both projects
    if not Project.is_member(task["project_id"], user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    if not Project.is_member(linked_task["project_id"], user_id):
        return error_response("Access denied. You are not a member of the linked task's project.", 403)
    
    # Prevent self-linking
    if task_id == linked_task_id:
        return error_response("Cannot link a task to itself", 400)
    
    # Check if link already exists
    if "links" in task:
        for link in task["links"]:
            if link["linked_task_id"] == linked_task_id and link["type"] == link_type:
                return error_response("This link already exists", 400)
    
    # Add link
    link_data = {
        "type": link_type,
        "linked_task_id": linked_task_id,
        "linked_ticket_id": linked_task.get("ticket_id", "")
    }
    
    success, link = Task.add_link(task_id, link_data)
    
    if success:
        # Create reverse link automatically for bidirectional relationships
        reverse_link_map = {
            "blocks": "blocked-by",
            "blocked-by": "blocks",
            "relates-to": "relates-to",
            "duplicates": "duplicated-by"
        }
        
        if link_type in reverse_link_map:
            reverse_link_type = reverse_link_map[link_type]
            reverse_link_data = {
                "type": reverse_link_type,
                "linked_task_id": task_id,
                "linked_ticket_id": task.get("ticket_id", "")
            }
            # Add reverse link (ignore if it fails)
            Task.add_link(linked_task_id, reverse_link_data)
        
        return success_response({
            "message": "Link added successfully",
            "link": link
        })
    else:
        return error_response("Failed to add link", 500)


def remove_link_from_task(task_id, body_str, user_id):
    """Remove a link from a task"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
    except:
        return error_response("Invalid JSON", 400)
    
    # Validate required fields
    required = ["linked_task_id", "type"]
    validation_error = validate_required_fields(data, required)
    if validation_error:
        return error_response(validation_error, 400)
    
    linked_task_id = data["linked_task_id"]
    link_type = data["type"]
    
    # Check if task exists
    task = Task.find_by_id(task_id)
    if not task:
        return error_response("Task not found", 404)
    
    # Check if user is member of the project
    if not Project.is_member(task["project_id"], user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    # Remove link
    success = Task.remove_link(task_id, linked_task_id, link_type)
    
    if success:
        # Remove reverse link automatically
        reverse_link_map = {
            "blocks": "blocked-by",
            "blocked-by": "blocks",
            "relates-to": "relates-to",
            "duplicates": "duplicated-by"
        }
        
        if link_type in reverse_link_map:
            reverse_link_type = reverse_link_map[link_type]
            # Remove reverse link (ignore if it fails)
            Task.remove_link(linked_task_id, task_id, reverse_link_type)
        
        return success_response({
            "message": "Link removed successfully"
        })
    else:
        return error_response("Link not found or failed to remove", 404)
