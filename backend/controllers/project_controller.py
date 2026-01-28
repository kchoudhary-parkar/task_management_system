import json
from models.project import Project
from models.user import User
from utils.response import success_response, error_response
from utils.validators import validate_required_fields
from utils.github_utils import (
    add_collaborator, create_webhook, encrypt_token, 
    parse_repo_url, get_github_headers
)
from controllers.team_chat_controller import initialize_project_channels
from bson import ObjectId
import os
import requests

def create_project(body_str, user_id):
    """Create a new project - requires admin or super-admin role"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    # Check if user has admin or super-admin role
    user = User.find_by_id(user_id)
    if not user:
        return error_response("User not found", 404)
    
    user_role = user.get("role", "member")
    if user_role not in ["admin", "super-admin"]:
        return error_response("Access denied. Only admins can create projects.", 403)
    
    try:
        data = json.loads(body_str)
    except:
        return error_response("Invalid JSON", 400)
    
    # Validate required fields
    required = ["name"]
    validation_error = validate_required_fields(data, required)
    if validation_error:
        return error_response(validation_error, 400)
    
    # Validate name length
    if len(data["name"].strip()) < 3:
        return error_response("Project name must be at least 3 characters", 400)
    
    # Create project with user_id
    project_data = {
        "name": data["name"].strip(),
        "description": data.get("description", "").strip(),
        "user_id": user_id,
        "git_repo_url": data.get("git_repo_url", "").strip(),
        "git_provider": data.get("git_provider", "github"),
        "git_access_token": ""
    }
    
    # If GitHub repo URL is provided, set up integration
    github_token = data.get("git_access_token", "") or os.getenv("GITHUB_TOKEN")
    git_repo_url = project_data["git_repo_url"]
    
    if git_repo_url and github_token:
        # Validate GitHub repo access
        try:
            owner, repo = parse_repo_url(git_repo_url)
            check_url = f"https://api.github.com/repos/{owner}/{repo}"
            
            print(f"[GitHub Validation] Checking: {check_url}")
            print(f"[GitHub Validation] Token preview: {github_token[:15]}...")
            
            response = requests.get(check_url, headers=get_github_headers(github_token))
            
            print(f"[GitHub Validation] Response status: {response.status_code}")
            
            if response.status_code == 401:
                return error_response("Invalid GitHub access token. Please check your token and permissions.", 400)
            elif response.status_code == 404:
                return error_response(f"GitHub repository '{owner}/{repo}' not found or no access. Make sure the repo exists and token has 'repo' permission.", 400)
            elif response.status_code != 200:
                error_msg = response.json().get('message', 'Unknown error') if response.text else 'Unknown error'
                print(f"[GitHub Validation] Error: {error_msg}")
                return error_response(f"GitHub API error: {error_msg}", 400)
            
            # Encrypt and store token
            project_data["git_access_token"] = encrypt_token(github_token)
            
        except ValueError as e:
            # URL parsing error
            return error_response(f"Invalid GitHub URL format. Expected: https://github.com/owner/repo or git@github.com:owner/repo.git Error: {str(e)}", 400)
        except Exception as e:
            print(f"[GitHub Validation] Exception: {str(e)}")
            return error_response(f"GitHub integration error: {str(e)}", 400)
    
    project = Project.create(project_data)
    
    # Convert ObjectId to string for JSON response
    project_id = str(project["_id"])
    project["_id"] = project_id
    project["created_at"] = project["created_at"].isoformat()
    project["updated_at"] = project["updated_at"].isoformat()
    
    # 🆕 Initialize default chat channels for this project
    initialize_project_channels(project_id)
    
    return success_response({
        "message": "Project created successfully",
        "project": project
    }, 201)

def get_user_projects(user_id):
    """Get all projects for the logged-in user (owned or member)"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    # Get projects where user is owner or member
    projects_list = Project.find_by_user_or_member(user_id)
    
    # Convert ObjectId and datetime to strings
    for project in projects_list:
        project["_id"] = str(project["_id"])
        project["created_at"] = project["created_at"].isoformat()
        project["updated_at"] = project["updated_at"].isoformat()
        # Add owner_id for frontend
        project["owner_id"] = project["user_id"]
        # Add flag to indicate if current user is the owner
        project["is_owner"] = project["user_id"] == user_id
    
    return success_response({
        "projects": projects_list,
        "count": len(projects_list)
    })

def get_project_by_id(project_id, user_id):
    """Get a specific project by ID"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    project = Project.find_by_id(project_id)
    
    if not project:
        return error_response("Project not found", 404)
    
    # Check if user is owner or member of this project
    if not Project.is_member(project_id, user_id):
        return error_response("Access denied. You are not a member of this project.", 403)
    
    # Convert ObjectId and datetime to strings
    project["_id"] = str(project["_id"])
    project["created_at"] = project["created_at"].isoformat()
    project["updated_at"] = project["updated_at"].isoformat()
    
    # Add owner_id for frontend to determine permissions
    project["owner_id"] = project["user_id"]
    
    return success_response({"project": project})

def update_project(body_str, project_id, user_id):
    """Update a project - only owner can update"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
    except:
        return error_response("Invalid JSON", 400)
    
    # Check if project exists and user owns it
    project = Project.find_by_id(project_id)
    if not project:
        return error_response("Project not found", 404)
    
    if project["user_id"] != user_id:
        return error_response("Access denied. You don't own this project.", 403)
    
    # Prepare update data
    update_data = {}
    if "name" in data and data["name"].strip():
        if len(data["name"].strip()) < 3:
            return error_response("Project name must be at least 3 characters", 400)
        update_data["name"] = data["name"].strip()
    
    if "description" in data:
        update_data["description"] = data["description"].strip()
    
    if not update_data:
        return error_response("No valid fields to update", 400)
    
    # Update project
    success = Project.update(project_id, update_data)
    
    if success:
        updated_project = Project.find_by_id(project_id)
        updated_project["_id"] = str(updated_project["_id"])
        updated_project["created_at"] = updated_project["created_at"].isoformat()
        updated_project["updated_at"] = updated_project["updated_at"].isoformat()
        
        return success_response({
            "message": "Project updated successfully",
            "project": updated_project
        })
    else:
        return error_response("Failed to update project", 500)

def delete_project(project_id, user_id):
    """Delete a project - only owner can delete"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    # Check if project exists and user owns it
    project = Project.find_by_id(project_id)
    if not project:
        return error_response("Project not found", 404)
    
    if project["user_id"] != user_id:
        return error_response("Access denied. You don't own this project.", 403)
    
    # Delete project
    success = Project.delete(project_id)
    
    if success:
        return success_response({
            "message": "Project deleted successfully"
        })
    else:
        return error_response("Failed to delete project", 500)