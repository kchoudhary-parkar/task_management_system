"""
Dashboard Controller - Analytics and Reports
"""
import json
from datetime import datetime, timedelta
from bson import ObjectId
from utils.auth_utils import verify_token
from database import db

def serialize_datetime(obj):
    """Convert datetime objects to ISO format strings"""
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

def convert_dates_to_strings(data):
    """Recursively convert all datetime objects in a data structure to strings"""
    if isinstance(data, dict):
        return {key: convert_dates_to_strings(value) for key, value in data.items()}
    elif isinstance(data, list):
        return [convert_dates_to_strings(item) for item in data]
    elif isinstance(data, datetime):
        return data.isoformat()
    else:
        return data

def get_dashboard_analytics(user_id):
    """
    Get comprehensive dashboard analytics for the logged-in user
    Returns: task stats, project stats, upcoming deadlines, recent activity
    OPTIMIZED with MongoDB aggregation and field projection
    """
    try:
        # Verify authentication
        if not user_id:
            return {
                "success": False,
                "status": 401,
                "headers": [("Content-Type", "application/json")],
                "body": json.dumps({"success": False, "error": "Authentication required"})
            }
        
        from models.user import User
        user = User.find_by_id(user_id)
        if not user:
            return {
                "success": False,
                "status": 404,
                "headers": [("Content-Type", "application/json")],
                "body": json.dumps({"success": False, "error": "User not found"})
            }
        
        user_role = user.get("role")
        
        # ⚡ OPTIMIZATION: Use field projection to only fetch needed fields
        projects_collection = db["projects"]
        tasks_collection = db["tasks"]
        
        # Find projects where user is owner or member (only essential fields)
        user_projects = list(projects_collection.find(
            {
                "$or": [
                    {"user_id": user_id},
                    {"members": {"$elemMatch": {"user_id": user_id}}}
                ]
            },
            {
                "_id": 1,
                "name": 1,
                "user_id": 1,
                "status": 1
            }
        ))
        
        project_ids_str = [str(p["_id"]) for p in user_projects]
        
        # ⚡ OPTIMIZATION: Use MongoDB aggregation to count instead of loading all tasks
        # Get task counts using aggregation (much faster than loading all tasks)
        my_tasks_pipeline = [
            {"$match": {"assignee_id": user_id}},
            {
                "$group": {
                    "_id": "$status",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        status_counts = {item["_id"]: item["count"] for item in tasks_collection.aggregate(my_tasks_pipeline)}
        
        # Calculate task statistics
        total = sum(status_counts.values())
        task_stats = {
            "total": total,
            "pending": sum(status_counts.get(s, 0) for s in ["To Do", "In Progress", "Testing", "Dev Complete"]),
            "in_progress": status_counts.get("In Progress", 0),
            "done": status_counts.get("Done", 0),
            "closed": status_counts.get("Closed", 0),
            "overdue": 0,  # Calculated separately
            "status_counts": status_counts
        }
        
        # ⚡ Count overdue tasks using aggregation
        now = datetime.now()
        overdue_count = tasks_collection.count_documents({
            "assignee_id": user_id,
            "status": {"$nin": ["Done", "Closed"]},
            "due_date": {"$lt": now}
        })
        task_stats["overdue"] = overdue_count
        
        # Calculate project statistics
        owned_count = len([p for p in user_projects if p.get("user_id") == user_id])
        active_count = len([p for p in user_projects if p.get("status") == "Active"])
        
        project_stats = {
            "total": len(user_projects),
            "owned": owned_count,
            "member_of": len(user_projects) - owned_count,
            "active": active_count,
            "completed": len(user_projects) - active_count
        }
        
        # ⚡ OPTIMIZATION: Get priority distribution using aggregation
        priority_pipeline = [
            {
                "$match": {
                    "assignee_id": user_id,
                    "status": {"$nin": ["Done", "Closed"]}
                }
            },
            {
                "$group": {
                    "_id": "$priority",
                    "count": {"$sum": 1}
                }
            }
        ]
        
        priority_counts = {item["_id"]: item["count"] for item in tasks_collection.aggregate(priority_pipeline)}
        priority_distribution = {
            "High": priority_counts.get("High", 0),
            "Medium": priority_counts.get("Medium", 0),
            "Low": priority_counts.get("Low", 0)
        }
        
        # Get upcoming deadlines (tasks due within next 6 days, only fetch essential fields)
        end_date = now + timedelta(days=6)
        
        # Get all tasks with due dates for the user (not Done/Closed)
        upcoming_tasks_query = list(tasks_collection.find(
            {
                "assignee_id": user_id,
                "status": {"$nin": ["Done", "Closed"]},
                "due_date": {"$exists": True, "$ne": None}
            },
            {
                "_id": 1,
                "title": 1,
                "due_date": 1,
                "priority": 1,
                "status": 1,
                "project_id": 1
            }
        ))
        
        project_map = {str(p["_id"]): p.get("name", "Unknown") for p in user_projects}
        
        upcoming_deadlines = []
        for task in upcoming_tasks_query:
            due_date = task.get("due_date")
            if not due_date:
                continue
                
            # Convert string dates to datetime if needed
            if isinstance(due_date, str):
                try:
                    due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
                except:
                    continue
            
            # Only include tasks due within next 6 days (and not past due)
            if isinstance(due_date, datetime):
                days_until = (due_date - now).days
                # Include tasks due today up to 6 days from now
                if 0 <= days_until <= 6:
                    upcoming_deadlines.append({
                        "task_id": str(task["_id"]),
                        "title": task.get("title", ""),
                        "due_date": due_date.isoformat(),
                        "priority": task.get("priority", "Low"),
                        "status": task.get("status", "To Do"),
                        "project_id": str(task.get("project_id", "")),
                        "project_name": project_map.get(str(task.get("project_id")), "Unknown"),
                        "days_until": days_until
                    })
        
        # Sort by due date (nearest first)
        upcoming_deadlines.sort(key=lambda x: x["days_until"])
        
        # ⚡ Get project progress using aggregation (much faster!)
        project_progress = []
        for project in user_projects[:10]:  # Limit to 10 projects
            project_id_str = str(project["_id"])
            
            # Count total and completed tasks using aggregation
            total_count = tasks_collection.count_documents({"project_id": project_id_str})
            completed_count = tasks_collection.count_documents({"project_id": project_id_str, "status": "Closed"})
            
            progress_percentage = (completed_count / total_count * 100) if total_count > 0 else 0
            
            project_progress.append({
                "project_id": project_id_str,
                "project_name": project.get("name", ""),
                "total_tasks": total_count,
                "completed_tasks": completed_count,
                "progress_percentage": round(progress_percentage, 1)
            })
        
        project_progress.sort(key=lambda x: x["progress_percentage"], reverse=True)
        
        # ⚡ Get recent activity using direct query with limit and sort (much faster!)
        recent_task_docs = list(tasks_collection.find(
            {"assignee_id": user_id},
            {
                "_id": 1,
                "title": 1,
                "status": 1,
                "priority": 1,
                "project_id": 1,
                "updated_at": 1
            }
        ).sort("updated_at", -1).limit(10))
        
        recent_activities = []
        for task in recent_task_docs:
            updated_at = task.get("updated_at", "")
            if isinstance(updated_at, datetime):
                updated_at = updated_at.isoformat()
            
            recent_activities.append({
                "task_id": str(task["_id"]),
                "title": task.get("title", ""),
                "status": task.get("status", ""),
                "priority": task.get("priority", ""),
                "project_name": project_map.get(str(task.get("project_id")), "Unknown"),
                "project_id": str(task.get("project_id", "")),
                "updated_at": updated_at
            })
        
        # Prepare response
        analytics = {
            "task_stats": task_stats,
            "project_stats": project_stats,
            "priority_distribution": priority_distribution,
            "status_distribution": status_counts,  # Add back for frontend compatibility
            "upcoming_deadlines": upcoming_deadlines[:15],  # Limit to 15
            "project_progress": project_progress[:10],  # Top 10 projects
            "recent_activities": recent_activities
        }
        
        response_data = {
            "success": True,
            "analytics": analytics
        }
        
        return {
            "success": True,
            "status": 200,
            "headers": [("Content-Type", "application/json")],
            "body": json.dumps(response_data)
        }
        
    except Exception as e:
        print(f"Error in get_dashboard_analytics: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "status": 500,
            "headers": [("Content-Type", "application/json")],
            "body": json.dumps({"success": False, "error": f"Failed to fetch dashboard analytics: {str(e)}"})
        }


def get_downloadable_report(user_id):
    """
    Get detailed report data for download (CSV/PDF)
    Returns comprehensive data about user's tasks and projects
    OPTIMIZED: Limited to 100 most recent tasks with field projection
    """
    try:
        # Verify authentication
        if not user_id:
            return {
                "success": False,
                "status": 401,
                "headers": [("Content-Type", "application/json")],
                "body": json.dumps({"success": False, "error": "Authentication required"})
            }
        
        from models.user import User
        user = User.find_by_id(user_id)
        if not user:
            return {
                "success": False,
                "status": 404,
                "headers": [("Content-Type", "application/json")],
                "body": json.dumps({"success": False, "error": "User not found"})
            }
        
        # Get user's projects and tasks
        projects_collection = db["projects"]
        tasks_collection = db["tasks"]
        
        # ⚡ OPTIMIZATION: Only fetch essential project fields
        user_projects = list(projects_collection.find(
            {
                "$or": [
                    {"user_id": user_id},
                    {"members": {"$elemMatch": {"user_id": user_id}}}
                ]
            },
            {
                "_id": 1,
                "name": 1,
                "status": 1,
                "created_at": 1
            }
        ))
        
        project_ids_str = [str(p["_id"]) for p in user_projects]
        
        # ⚡ OPTIMIZATION: Limit to 100 most recent tasks, only essential fields
        my_tasks = list(tasks_collection.find(
            {"assignee_id": user_id},
            {
                "_id": 1,
                "ticket_id": 1,
                "title": 1,
                "status": 1,
                "priority": 1,
                "due_date": 1,
                "project_id": 1,
                "created_at": 1,
                "updated_at": 1
            }
        ).sort("updated_at", -1).limit(100))
        
        # ⚡ Use aggregation to count tasks efficiently
        status_pipeline = [
            {"$match": {"assignee_id": user_id}},
            {"$group": {"_id": "$status", "count": {"$sum": 1}}}
        ]
        status_counts = {item["_id"]: item["count"] for item in tasks_collection.aggregate(status_pipeline)}
        
        total_tasks = sum(status_counts.values())
        completed_tasks = sum(status_counts.get(s, 0) for s in ["Done", "Closed"])
        pending_tasks = total_tasks - completed_tasks
        
        # Prepare detailed report data
        report_data = {
            "generated_at": datetime.now().isoformat(),
            "user_info": {
                "user_id": user_id,
                "name": user.get("name", ""),
                "email": user.get("email", ""),
                "role": user.get("role", "")
            },
            "projects": [],
            "my_tasks": [],
            "summary": {
                "total_projects": len(user_projects),
                "total_tasks": total_tasks,
                "pending_tasks": pending_tasks,
                "completed_tasks": completed_tasks,
                "note": "Showing 100 most recent tasks"
            }
        }
        
        # Create project map for faster lookup
        project_map = {str(p["_id"]): p for p in user_projects}
        
        # Add project details with aggregated task counts
        for project in user_projects:
            project_id_str = str(project["_id"])
            
            # ⚡ Count tasks using aggregation
            total_count = tasks_collection.count_documents({"project_id": project_id_str})
            completed_count = tasks_collection.count_documents({
                "project_id": project_id_str,
                "status": {"$in": ["Done", "Closed"]}
            })
            
            created_at = project.get("created_at", "")
            if isinstance(created_at, datetime):
                created_at = created_at.isoformat()
            
            report_data["projects"].append({
                "project_id": project_id_str,
                "name": project.get("name", ""),
                "status": project.get("status", ""),
                "created_at": created_at,
                "total_tasks": total_count,
                "completed_tasks": completed_count
            })
        
        # Add task details (limited to 100 most recent)
        for task in my_tasks:
            project = project_map.get(str(task.get("project_id")))
            
            # Convert datetime fields to strings
            created_at = task.get("created_at", "")
            if isinstance(created_at, datetime):
                created_at = created_at.isoformat()
            
            updated_at = task.get("updated_at", "")
            if isinstance(updated_at, datetime):
                updated_at = updated_at.isoformat()
            
            due_date = task.get("due_date", "")
            if isinstance(due_date, datetime):
                due_date = due_date.isoformat()
            
            report_data["my_tasks"].append({
                "task_id": str(task["_id"]),
                "ticket_id": task.get("ticket_id", ""),
                "title": task.get("title", ""),
                "status": task.get("status", ""),
                "priority": task.get("priority", ""),
                "due_date": due_date,
                "project_name": project.get("name", "") if project else "",
                "created_at": created_at,
                "updated_at": updated_at
            })
        
        response_data = {
            "success": True,
            "report": report_data
        }
        
        return {
            "success": True,
            "status": 200,
            "headers": [("Content-Type", "application/json")],
            "body": json.dumps(response_data)
        }
        
    except Exception as e:
        print(f"Error in get_downloadable_report: {str(e)}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "status": 500,
            "headers": [("Content-Type", "application/json")],
            "body": json.dumps({"success": False, "error": f"Failed to generate report: {str(e)}"})
        }
