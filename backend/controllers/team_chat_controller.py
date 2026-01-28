"""
Team Chat Controller
Handles project-based team chat with real-time messaging
"""
import json
from datetime import datetime, timezone
from bson import ObjectId
from database import db
from models.project import Project
from models.user import User
from utils.response import success_response, error_response, datetime_to_iso


def get_user_chat_projects(user_id):
    """
    Get all projects where user is owner or member (for chat sidebar)
    Returns simplified project list with unread counts
    """
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        # Get all projects where user is owner or member
        user_projects = list(db.projects.find({
            "$or": [
                {"user_id": user_id},
                {"members.user_id": user_id}
            ]
        }, {
            "_id": 1,
            "name": 1,
            "prefix": 1,
            "user_id": 1
        }).sort("name", 1))
        
        projects_data = []
        for project in user_projects:
            project_id = str(project["_id"])
            
            # Get channels for this project
            channels = list(db.chat_channels.find(
                {"project_id": project_id},
                {"_id": 1, "name": 1}
            ).sort("name", 1))
            
            # Calculate total unread for project
            total_unread = 0
            for channel in channels:
                channel_id = str(channel["_id"])
                unread_count = db.chat_messages.count_documents({
                    "channel_id": channel_id,
                    "user_id": {"$ne": user_id},
                    "read_by": {"$ne": user_id}
                })
                total_unread += unread_count
            
            projects_data.append({
                "id": project_id,
                "name": project["name"],
                "color": generate_project_color(project.get("prefix", project["name"])),
                "unread": total_unread,
                "is_owner": project["user_id"] == user_id
            })
        
        return success_response({
            "projects": projects_data,
            "count": len(projects_data)
        })
    
    except Exception as e:
        print(f"Error getting user chat projects: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f"Failed to get projects: {str(e)}", 500)


def get_project_channels(project_id, user_id):
    """
    Get all channels for a project with unread counts
    """
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        # Check if user is member of the project
        if not Project.is_member(project_id, user_id):
            return error_response("Access denied. You are not a member of this project.", 403)
        
        # Get all channels for project
        channels = list(db.chat_channels.find(
            {"project_id": project_id},
            {"_id": 1, "name": 1, "description": 1, "created_at": 1}
        ).sort("name", 1))
        
        channels_data = []
        for channel in channels:
            channel_id = str(channel["_id"])
            
            # Get unread count for this user in this channel
            unread_count = db.chat_messages.count_documents({
                "channel_id": channel_id,
                "user_id": {"$ne": user_id},
                "read_by": {"$ne": user_id}
            })
            
            # Get last message timestamp
            last_message = db.chat_messages.find_one(
                {"channel_id": channel_id},
                {"created_at": 1}
            )
            
            channels_data.append({
                "id": channel_id,
                "name": channel["name"],
                "description": channel.get("description", ""),
                "unread": unread_count,
                "last_message_at": datetime_to_iso(last_message["created_at"]) if last_message else None,
                "created_at": datetime_to_iso(channel["created_at"])
            })
        
        return success_response({
            "channels": channels_data,
            "count": len(channels_data)
        })
    
    except Exception as e:
        print(f"Error getting project channels: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f"Failed to get channels: {str(e)}", 500)


def get_channel_messages(channel_id, user_id, query_params=None):
    """
    Get messages for a channel with pagination
    Query params: limit (default 50), before (message_id for pagination)
    """
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        # Get channel to verify access
        channel = db.chat_channels.find_one({"_id": ObjectId(channel_id)})
        if not channel:
            return error_response("Channel not found", 404)
        
        project_id = channel["project_id"]
        
        # Check if user is member of the project
        if not Project.is_member(project_id, user_id):
            return error_response("Access denied. You are not a member of this project.", 403)
        
        # Parse query params
        limit = int(query_params.get("limit", 50)) if query_params else 50
        before_id = query_params.get("before") if query_params else None
        
        # Build query
        query = {"channel_id": channel_id}
        if before_id:
            try:
                query["_id"] = {"$lt": ObjectId(before_id)}
            except:
                pass
        
        # Get messages
        messages = list(db.chat_messages.find(
            query,
            {
                "_id": 1,
                "user_id": 1,
                "text": 1,
                "created_at": 1,
                "updated_at": 1,
                "edited": 1
            }
        ).sort("created_at", -1).limit(limit))
        
        # Reverse to get chronological order
        messages.reverse()
        
        # Enrich with user data
        user_ids = list(set([msg["user_id"] for msg in messages]))
        users = list(db.users.find(
            {"_id": {"$in": [ObjectId(uid) for uid in user_ids]}},
            {"_id": 1, "name": 1, "email": 1}
        ))
        user_map = {str(u["_id"]): u for u in users}
        
        messages_data = []
        for msg in messages:
            user_data = user_map.get(msg["user_id"], {})
            user_name = user_data.get("name", "Unknown")
            
            # Generate avatar initials
            name_parts = user_name.split()
            avatar = "".join([part[0].upper() for part in name_parts[:2]]) if name_parts else "U"
            
            messages_data.append({
                "id": str(msg["_id"]),
                "user": user_name,
                "userId": msg["user_id"],
                "avatar": avatar,
                "time": datetime_to_iso(msg["created_at"]),
                "timestamp": datetime_to_iso(msg["created_at"]),
                "text": msg["text"],
                "color": generate_user_color(msg["user_id"]),
                "edited": msg.get("edited", False)
            })
        
        # Mark messages as read
        db.chat_messages.update_many(
            {
                "channel_id": channel_id,
                "user_id": {"$ne": user_id},
                "read_by": {"$ne": user_id}
            },
            {"$addToSet": {"read_by": user_id}}
        )
        
        return success_response({
            "messages": messages_data,
            "has_more": len(messages) == limit
        })
    
    except Exception as e:
        print(f"Error getting channel messages: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f"Failed to get messages: {str(e)}", 500)


def send_message(body_str, channel_id, user_id):
    """
    Send a message to a channel
    """
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
        text = data.get("text", "").strip()
        
        if not text:
            return error_response("Message text is required", 400)
        
        if len(text) > 5000:
            return error_response("Message too long (max 5000 characters)", 400)
        
        # Get channel to verify access
        channel = db.chat_channels.find_one({"_id": ObjectId(channel_id)})
        if not channel:
            return error_response("Channel not found", 404)
        
        project_id = channel["project_id"]
        
        # Check if user is member of the project
        if not Project.is_member(project_id, user_id):
            return error_response("Access denied. You are not a member of this project.", 403)
        
        # Get user info
        user = User.find_by_id(user_id)
        if not user:
            return error_response("User not found", 404)
        
        user_name = user["name"]
        name_parts = user_name.split()
        avatar = "".join([part[0].upper() for part in name_parts[:2]]) if name_parts else "U"
        
        # Create message
        message_data = {
            "channel_id": channel_id,
            "project_id": project_id,
            "user_id": user_id,
            "text": text,
            "read_by": [user_id],  # Creator has read it
            "edited": False,
            "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
            "updated_at": datetime.now(timezone.utc).replace(tzinfo=None)
        }
        
        result = db.chat_messages.insert_one(message_data)
        message_id = str(result.inserted_id)
        
        # Return message data
        message_response = {
            "id": message_id,
            "user": user_name,
            "userId": user_id,
            "avatar": avatar,
            "time": datetime_to_iso(message_data["created_at"]),
            "timestamp": datetime_to_iso(message_data["created_at"]),
            "text": text,
            "color": generate_user_color(user_id),
            "edited": False
        }
        
        return success_response({
            "message": "Message sent successfully",
            "data": message_response
        }, 201)
    
    except json.JSONDecodeError:
        return error_response("Invalid JSON", 400)
    except Exception as e:
        print(f"Error sending message: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f"Failed to send message: {str(e)}", 500)


def create_channel(body_str, project_id, user_id):
    """
    Create a new channel in a project (owner only)
    """
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
        name = data.get("name", "").strip().lower()
        description = data.get("description", "").strip()
        
        if not name:
            return error_response("Channel name is required", 400)
        
        if len(name) < 2 or len(name) > 50:
            return error_response("Channel name must be 2-50 characters", 400)
        
        # Validate name format (alphanumeric and hyphens only)
        import re
        if not re.match(r'^[a-z0-9-]+$', name):
            return error_response("Channel name can only contain lowercase letters, numbers, and hyphens", 400)
        
        # Check if project exists and user is owner
        project = Project.find_by_id(project_id)
        if not project:
            return error_response("Project not found", 404)
        
        if project["user_id"] != user_id:
            return error_response("Only project owner can create channels", 403)
        
        # Check if channel already exists
        existing = db.chat_channels.find_one({
            "project_id": project_id,
            "name": name
        })
        
        if existing:
            return error_response("Channel with this name already exists", 400)
        
        # Create channel
        channel_data = {
            "project_id": project_id,
            "name": name,
            "description": description,
            "created_by": user_id,
            "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
            "updated_at": datetime.now(timezone.utc).replace(tzinfo=None)
        }
        
        result = db.chat_channels.insert_one(channel_data)
        channel_id = str(result.inserted_id)
        
        return success_response({
            "message": "Channel created successfully",
            "channel": {
                "id": channel_id,
                "name": name,
                "description": description,
                "created_at": datetime_to_iso(channel_data["created_at"])
            }
        }, 201)
    
    except json.JSONDecodeError:
        return error_response("Invalid JSON", 400)
    except Exception as e:
        print(f"Error creating channel: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f"Failed to create channel: {str(e)}", 500)


def delete_channel(channel_id, user_id):
    """
    Delete a channel (owner only)
    """
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        # Get channel
        channel = db.chat_channels.find_one({"_id": ObjectId(channel_id)})
        if not channel:
            return error_response("Channel not found", 404)
        
        # Prevent deleting 'general' channel
        if channel["name"] == "general":
            return error_response("Cannot delete the general channel", 400)
        
        project_id = channel["project_id"]
        
        # Check if user is project owner
        project = Project.find_by_id(project_id)
        if not project:
            return error_response("Project not found", 404)
        
        if project["user_id"] != user_id:
            return error_response("Only project owner can delete channels", 403)
        
        # Delete all messages in channel
        db.chat_messages.delete_many({"channel_id": channel_id})
        
        # Delete channel
        db.chat_channels.delete_one({"_id": ObjectId(channel_id)})
        
        return success_response({
            "message": "Channel deleted successfully"
        })
    
    except Exception as e:
        print(f"Error deleting channel: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f"Failed to delete channel: {str(e)}", 500)


def initialize_project_channels(project_id):
    """
    Initialize default channels for a new project
    Called when a project is created
    """
    try:
        # Check if general channel already exists
        existing = db.chat_channels.find_one({
            "project_id": project_id,
            "name": "general"
        })
        
        if existing:
            return  # Already initialized
        
        # Create default channels
        default_channels = [
            {
                "name": "general",
                "description": "General project discussion"
            },
            {
                "name": "announcements",
                "description": "Important announcements"
            },
            {
                "name": "random",
                "description": "Off-topic discussions"
            }
        ]
        
        for channel_info in default_channels:
            channel_data = {
                "project_id": project_id,
                "name": channel_info["name"],
                "description": channel_info["description"],
                "created_by": None,  # System created
                "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
                "updated_at": datetime.now(timezone.utc).replace(tzinfo=None)
            }
            db.chat_channels.insert_one(channel_data)
        
        print(f"[CHAT] Initialized default channels for project {project_id}")
    
    except Exception as e:
        print(f"Error initializing project channels: {str(e)}")


def generate_project_color(prefix):
    """Generate consistent color for project based on prefix"""
    colors = [
        "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
        "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1"
    ]
    hash_val = sum(ord(c) for c in prefix)
    return colors[hash_val % len(colors)]


def generate_user_color(user_id):
    """Generate consistent color for user based on ID"""
    colors = [
        "#ec4899", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6",
        "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
    ]
    hash_val = sum(ord(c) for c in user_id)
    return colors[hash_val % len(colors)]


def get_chat_stats(user_id):
    """
    Get chat statistics for user
    """
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        # Get user's projects
        user_projects = list(db.projects.find({
            "$or": [
                {"user_id": user_id},
                {"members.user_id": user_id}
            ]
        }, {"_id": 1}))
        
        project_ids = [str(p["_id"]) for p in user_projects]
        
        # Count total channels
        total_channels = db.chat_channels.count_documents({
            "project_id": {"$in": project_ids}
        })
        
        # Count total unread messages
        total_unread = db.chat_messages.count_documents({
            "project_id": {"$in": project_ids},
            "user_id": {"$ne": user_id},
            "read_by": {"$ne": user_id}
        })
        
        # Count messages sent by user
        messages_sent = db.chat_messages.count_documents({
            "user_id": user_id
        })
        
        return success_response({
            "stats": {
                "total_projects": len(project_ids),
                "total_channels": total_channels,
                "total_unread": total_unread,
                "messages_sent": messages_sent
            }
        })
    
    except Exception as e:
        print(f"Error getting chat stats: {str(e)}")
        return error_response(f"Failed to get stats: {str(e)}", 500)