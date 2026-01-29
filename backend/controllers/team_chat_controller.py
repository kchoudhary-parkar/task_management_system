# # """
# # Team Chat Controller
# # Handles project-based team chat with real-time messaging
# # """
# import json
# from datetime import datetime, timezone
# from bson import ObjectId
# from database import db
# from models.project import Project
# from models.user import User
# from utils.response import success_response, error_response, datetime_to_iso

# def get_user_chat_projects(user_id):
#     """
#     Get all projects where user is owner or member (for chat sidebar)
#     Returns simplified project list with unread counts
#     """
#     if not user_id:
#         return error_response("Unauthorized. Please login.", 401)
    
#     try:
#         # Get all projects where user is owner or member
#         user_projects = list(db.projects.find({
#             "$or": [
#                 {"user_id": user_id},
#                 {"members.user_id": user_id}
#             ]
#         }, {
#             "_id": 1,
#             "name": 1,
#             "prefix": 1,
#             "user_id": 1
#         }).sort("name", 1))
        
#         projects_data = []
#         for project in user_projects:
#             project_id = str(project["_id"])
            
#             # Get channels for this project
#             channels = list(db.chat_channels.find(
#                 {"project_id": project_id},
#                 {"_id": 1, "name": 1}
#             ).sort("name", 1))
            
#             # Calculate total unread for project
#             total_unread = 0
#             for channel in channels:
#                 channel_id = str(channel["_id"])
#                 unread_count = db.chat_messages.count_documents({
#                     "channel_id": channel_id,
#                     "user_id": {"$ne": user_id},
#                     "read_by": {"$ne": user_id}
#                 })
#                 total_unread += unread_count
            
#             projects_data.append({
#                 "id": project_id,
#                 "name": project["name"],
#                 "color": generate_project_color(project.get("prefix", project["name"])),
#                 "unread": total_unread,
#                 "is_owner": project["user_id"] == user_id
#             })
        
#         return success_response({
#             "projects": projects_data,
#             "count": len(projects_data)
#         })
    
#     except Exception as e:
#         print(f"Error getting user chat projects: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return error_response(f"Failed to get projects: {str(e)}", 500)


# def get_project_channels(project_id, user_id):
#     """
#     Get all channels for a project with unread counts
#     """
#     if not user_id:
#         return error_response("Unauthorized. Please login.", 401)
    
#     try:
#         # Check if user is member of the project
#         if not Project.is_member(project_id, user_id):
#             return error_response("Access denied. You are not a member of this project.", 403)
        
#         # Get all channels for project
#         channels = list(db.chat_channels.find(
#             {"project_id": project_id},
#             {"_id": 1, "name": 1, "description": 1, "created_at": 1}
#         ).sort("name", 1))
        
#         channels_data = []
#         for channel in channels:
#             channel_id = str(channel["_id"])
            
#             # Get unread count for this user in this channel
#             unread_count = db.chat_messages.count_documents({
#                 "channel_id": channel_id,
#                 "user_id": {"$ne": user_id},
#                 "read_by": {"$ne": user_id}
#             })
            
#             # Get last message timestamp
#             last_message = db.chat_messages.find_one(
#                 {"channel_id": channel_id},
#                 {"created_at": 1}
#             )
            
#             channels_data.append({
#                 "id": channel_id,
#                 "name": channel["name"],
#                 "description": channel.get("description", ""),
#                 "unread": unread_count,
#                 "last_message_at": datetime_to_iso(last_message["created_at"]) if last_message else None,
#                 "created_at": datetime_to_iso(channel["created_at"])
#             })
        
#         return success_response({
#             "channels": channels_data,
#             "count": len(channels_data)
#         })
    
#     except Exception as e:
#         print(f"Error getting project channels: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return error_response(f"Failed to get channels: {str(e)}", 500)


# def get_channel_messages(channel_id, user_id, query_params=None):
#     """
#     Get messages for a channel with pagination
#     Query params: limit (default 50), before (message_id for pagination)
#     """
#     if not user_id:
#         return error_response("Unauthorized. Please login.", 401)
    
#     try:
#         # Get channel to verify access
#         channel = db.chat_channels.find_one({"_id": ObjectId(channel_id)})
#         if not channel:
#             return error_response("Channel not found", 404)
        
#         project_id = channel["project_id"]
        
#         # Check if user is member of the project
#         if not Project.is_member(project_id, user_id):
#             return error_response("Access denied. You are not a member of this project.", 403)
        
#         # Parse query params
#         limit = int(query_params.get("limit", 50)) if query_params else 50
#         before_id = query_params.get("before") if query_params else None
        
#         # Build query
#         query = {"channel_id": channel_id}
#         if before_id:
#             try:
#                 query["_id"] = {"$lt": ObjectId(before_id)}
#             except:
#                 pass
        
#         # Get messages
#         messages = list(db.chat_messages.find(
#             query,
#             {
#                 "_id": 1,
#                 "user_id": 1,
#                 "text": 1,
#                 "created_at": 1,
#                 "updated_at": 1,
#                 "edited": 1
#             }
#         ).sort("created_at", -1).limit(limit))
        
#         # Reverse to get chronological order
#         messages.reverse()
        
#         # Enrich with user data
#         user_ids = list(set([msg["user_id"] for msg in messages]))
#         users = list(db.users.find(
#             {"_id": {"$in": [ObjectId(uid) for uid in user_ids]}},
#             {"_id": 1, "name": 1, "email": 1}
#         ))
#         user_map = {str(u["_id"]): u for u in users}
        
#         messages_data = []
#         for msg in messages:
#             user_data = user_map.get(msg["user_id"], {})
#             user_name = user_data.get("name", "Unknown")
            
#             # Generate avatar initials
#             name_parts = user_name.split()
#             avatar = "".join([part[0].upper() for part in name_parts[:2]]) if name_parts else "U"
            
#             messages_data.append({
#                 "id": str(msg["_id"]),
#                 "user": user_name,
#                 "userId": msg["user_id"],
#                 "avatar": avatar,
#                 "time": datetime_to_iso(msg["created_at"]),
#                 "timestamp": datetime_to_iso(msg["created_at"]),
#                 "text": msg["text"],
#                 "color": generate_user_color(msg["user_id"]),
#                 "edited": msg.get("edited", False)
#             })
        
#         # Mark messages as read
#         db.chat_messages.update_many(
#             {
#                 "channel_id": channel_id,
#                 "user_id": {"$ne": user_id},
#                 "read_by": {"$ne": user_id}
#             },
#             {"$addToSet": {"read_by": user_id}}
#         )
        
#         return success_response({
#             "messages": messages_data,
#             "has_more": len(messages) == limit
#         })
    
#     except Exception as e:
#         print(f"Error getting channel messages: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return error_response(f"Failed to get messages: {str(e)}", 500)


# def send_message(body_str, channel_id, user_id):
#     """
#     Send a message to a channel
#     """
#     if not user_id:
#         return error_response("Unauthorized. Please login.", 401)
    
#     try:
#         data = json.loads(body_str)
#         text = data.get("text", "").strip()
        
#         if not text:
#             return error_response("Message text is required", 400)
        
#         if len(text) > 5000:
#             return error_response("Message too long (max 5000 characters)", 400)
        
#         # Get channel to verify access
#         channel = db.chat_channels.find_one({"_id": ObjectId(channel_id)})
#         if not channel:
#             return error_response("Channel not found", 404)
        
#         project_id = channel["project_id"]
        
#         # Check if user is member of the project
#         if not Project.is_member(project_id, user_id):
#             return error_response("Access denied. You are not a member of this project.", 403)
        
#         # Get user info
#         user = User.find_by_id(user_id)
#         if not user:
#             return error_response("User not found", 404)
        
#         user_name = user["name"]
#         name_parts = user_name.split()
#         avatar = "".join([part[0].upper() for part in name_parts[:2]]) if name_parts else "U"
        
#         # Create message
#         message_data = {
#             "channel_id": channel_id,
#             "project_id": project_id,
#             "user_id": user_id,
#             "text": text,
#             "read_by": [user_id],  # Creator has read it
#             "edited": False,
#             "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
#             "updated_at": datetime.now(timezone.utc).replace(tzinfo=None)
#         }
        
#         result = db.chat_messages.insert_one(message_data)
#         message_id = str(result.inserted_id)
        
#         # Return message data
#         message_response = {
#             "id": message_id,
#             "user": user_name,
#             "userId": user_id,
#             "avatar": avatar,
#             "time": datetime_to_iso(message_data["created_at"]),
#             "timestamp": datetime_to_iso(message_data["created_at"]),
#             "text": text,
#             "color": generate_user_color(user_id),
#             "edited": False
#         }
        
#         return success_response({
#             "message": "Message sent successfully",
#             "data": message_response
#         }, 201)
    
#     except json.JSONDecodeError:
#         return error_response("Invalid JSON", 400)
#     except Exception as e:
#         print(f"Error sending message: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return error_response(f"Failed to send message: {str(e)}", 500)


# def create_channel(body_str, project_id, user_id):
#     """
#     Create a new channel in a project (owner only)
#     """
#     if not user_id:
#         return error_response("Unauthorized. Please login.", 401)
    
#     try:
#         data = json.loads(body_str)
#         name = data.get("name", "").strip().lower()
#         description = data.get("description", "").strip()
        
#         if not name:
#             return error_response("Channel name is required", 400)
        
#         if len(name) < 2 or len(name) > 50:
#             return error_response("Channel name must be 2-50 characters", 400)
        
#         # Validate name format (alphanumeric and hyphens only)
#         import re
#         if not re.match(r'^[a-z0-9-]+$', name):
#             return error_response("Channel name can only contain lowercase letters, numbers, and hyphens", 400)
        
#         # Check if project exists and user is owner
#         project = Project.find_by_id(project_id)
#         if not project:
#             return error_response("Project not found", 404)
        
#         if project["user_id"] != user_id:
#             return error_response("Only project owner can create channels", 403)
        
#         # Check if channel already exists
#         existing = db.chat_channels.find_one({
#             "project_id": project_id,
#             "name": name
#         })
        
#         if existing:
#             return error_response("Channel with this name already exists", 400)
        
#         # Create channel
#         channel_data = {
#             "project_id": project_id,
#             "name": name,
#             "description": description,
#             "created_by": user_id,
#             "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
#             "updated_at": datetime.now(timezone.utc).replace(tzinfo=None)
#         }
        
#         result = db.chat_channels.insert_one(channel_data)
#         channel_id = str(result.inserted_id)
        
#         return success_response({
#             "message": "Channel created successfully",
#             "channel": {
#                 "id": channel_id,
#                 "name": name,
#                 "description": description,
#                 "created_at": datetime_to_iso(channel_data["created_at"])
#             }
#         }, 201)
    
#     except json.JSONDecodeError:
#         return error_response("Invalid JSON", 400)
#     except Exception as e:
#         print(f"Error creating channel: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return error_response(f"Failed to create channel: {str(e)}", 500)


# def delete_channel(channel_id, user_id):
#     """
#     Delete a channel (owner only)
#     """
#     if not user_id:
#         return error_response("Unauthorized. Please login.", 401)
    
#     try:
#         # Get channel
#         channel = db.chat_channels.find_one({"_id": ObjectId(channel_id)})
#         if not channel:
#             return error_response("Channel not found", 404)
        
#         # Prevent deleting 'general' channel
#         if channel["name"] == "general":
#             return error_response("Cannot delete the general channel", 400)
        
#         project_id = channel["project_id"]
        
#         # Check if user is project owner
#         project = Project.find_by_id(project_id)
#         if not project:
#             return error_response("Project not found", 404)
        
#         if project["user_id"] != user_id:
#             return error_response("Only project owner can delete channels", 403)
        
#         # Delete all messages in channel
#         db.chat_messages.delete_many({"channel_id": channel_id})
        
#         # Delete channel
#         db.chat_channels.delete_one({"_id": ObjectId(channel_id)})
        
#         return success_response({
#             "message": "Channel deleted successfully"
#         })
    
#     except Exception as e:
#         print(f"Error deleting channel: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return error_response(f"Failed to delete channel: {str(e)}", 500)


# def initialize_project_channels(project_id):
#     """
#     Initialize default channels for a new project
#     Called when a project is created
#     """
#     try:
#         # Check if general channel already exists
#         existing = db.chat_channels.find_one({
#             "project_id": project_id,
#             "name": "general"
#         })
        
#         if existing:
#             return  # Already initialized
        
#         # Create default channels
#         default_channels = [
#             {
#                 "name": "general",
#                 "description": "General project discussion"
#             },
#             {
#                 "name": "announcements",
#                 "description": "Important announcements"
#             },
#             {
#                 "name": "random",
#                 "description": "Off-topic discussions"
#             }
#         ]
        
#         for channel_info in default_channels:
#             channel_data = {
#                 "project_id": project_id,
#                 "name": channel_info["name"],
#                 "description": channel_info["description"],
#                 "created_by": None,  # System created
#                 "created_at": datetime.now(timezone.utc).replace(tzinfo=None),
#                 "updated_at": datetime.now(timezone.utc).replace(tzinfo=None)
#             }
#             db.chat_channels.insert_one(channel_data)
        
#         print(f"[CHAT] Initialized default channels for project {project_id}")
    
#     except Exception as e:
#         print(f"Error initializing project channels: {str(e)}")


# def generate_project_color(prefix):
#     """Generate consistent color for project based on prefix"""
#     colors = [
#         "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
#         "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1"
#     ]
#     hash_val = sum(ord(c) for c in prefix)
#     return colors[hash_val % len(colors)]


# def generate_user_color(user_id):
#     """Generate consistent color for user based on ID"""
#     colors = [
#         "#ec4899", "#8b5cf6", "#f59e0b", "#10b981", "#3b82f6",
#         "#ef4444", "#06b6d4", "#84cc16", "#f97316", "#6366f1"
#     ]
#     hash_val = sum(ord(c) for c in user_id)
#     return colors[hash_val % len(colors)]


# def get_chat_stats(user_id):
#     """
#     Get chat statistics for user
#     """
#     if not user_id:
#         return error_response("Unauthorized. Please login.", 401)
    
#     try:
#         # Get user's projects
#         user_projects = list(db.projects.find({
#             "$or": [
#                 {"user_id": user_id},
#                 {"members.user_id": user_id}
#             ]
#         }, {"_id": 1}))
        
#         project_ids = [str(p["_id"]) for p in user_projects]
        
#         # Count total channels
#         total_channels = db.chat_channels.count_documents({
#             "project_id": {"$in": project_ids}
#         })
        
#         # Count total unread messages
#         total_unread = db.chat_messages.count_documents({
#             "project_id": {"$in": project_ids},
#             "user_id": {"$ne": user_id},
#             "read_by": {"$ne": user_id}
#         })
        
#         # Count messages sent by user
#         messages_sent = db.chat_messages.count_documents({
#             "user_id": user_id
#         })
        
#         return success_response({
#             "stats": {
#                 "total_projects": len(project_ids),
#                 "total_channels": total_channels,
#                 "total_unread": total_unread,
#                 "messages_sent": messages_sent
#             }
#         })
    
#     except Exception as e:
#         print(f"Error getting chat stats: {str(e)}")
#         return error_response(f"Failed to get stats: {str(e)}", 500)
# """
# Enhanced Team Chat Controller with Reactions, Mentions, and File Uploads

# This module extends the basic team_chat_controller.py with:
# - Message reactions (emoji responses)
# - @mentions functionality
# - File attachments
# - Message editing/deletion
# - Read receipts
# - Thread/reply support
# """



# # Get database collections
# channels_collection = db["chat_channels"]
# messages_collection = db["chat_messages"]
# reactions_collection = db["chat_reactions"]
# mentions_collection = db["chat_mentions"]

# # ============================================
# # REACTION ENDPOINTS
# # ============================================

# def add_reaction(channel_id, message_id, body_str, user_id):
#     """Add a reaction (emoji) to a message"""
#     try:
#         data = json.loads(body_str)
#         emoji = data.get("emoji")
        
#         if not emoji:
#             return error_response("Emoji is required", 400)
        
#         # Verify message exists
#         message = messages_collection.find_one({"_id": ObjectId(message_id)})
#         if not message:
#             return error_response("Message not found", 404)
        
#         # Check if user already reacted with this emoji
#         existing_reaction = reactions_collection.find_one({
#             "message_id": ObjectId(message_id),
#             "user_id": user_id,
#             "emoji": emoji
#         })
        
#         if existing_reaction:
#             # Toggle off - remove reaction
#             reactions_collection.delete_one({"_id": existing_reaction["_id"]})
#             action = "removed"
#         else:
#             # Add new reaction
#             reaction_data = {
#                 "message_id": ObjectId(message_id),
#                 "channel_id": ObjectId(channel_id),
#                 "user_id": user_id,
#                 "emoji": emoji,
#                 "created_at": datetime.utcnow()
#             }
#             reactions_collection.insert_one(reaction_data)
#             action = "added"
        
#         # Get updated reaction counts
#         reaction_counts = get_reaction_counts(message_id)
        
#         return success_response({
#             "message": f"Reaction {action}",
#             "reactions": reaction_counts
#         })
        
#     except json.JSONDecodeError:
#         return error_response("Invalid JSON", 400)
#     except Exception as e:
#         return error_response(f"Error adding reaction: {str(e)}", 500)

# def get_reaction_counts(message_id):
#     """Get aggregated reaction counts for a message"""
#     pipeline = [
#         {"$match": {"message_id": ObjectId(message_id)}},
#         {"$group": {
#             "_id": "$emoji",
#             "count": {"$sum": 1},
#             "users": {"$push": "$user_id"}
#         }},
#         {"$project": {
#             "emoji": "$_id",
#             "count": 1,
#             "users": 1,
#             "_id": 0
#         }}
#     ]
    
#     reactions = list(reactions_collection.aggregate(pipeline))
#     return reactions

# # ============================================
# # MESSAGE EDITING/DELETION
# # ============================================

# def edit_message(channel_id, message_id, body_str, user_id):
#     """Edit/update a message (only by original author)"""
#     try:
#         data = json.loads(body_str)
#         new_text = data.get("text", "").strip()
        
#         if not new_text:
#             return error_response("Message text cannot be empty", 400)
        
#         # Find message and verify ownership
#         message = messages_collection.find_one({"_id": ObjectId(message_id)})
#         if not message:
#             return error_response("Message not found", 404)
        
#         if message["user_id"] != user_id:
#             return error_response("You can only edit your own messages", 403)
        
#         # Update message
#         messages_collection.update_one(
#             {"_id": ObjectId(message_id)},
#             {
#                 "$set": {
#                     "text": new_text,
#                     "edited": True,
#                     "edited_at": datetime.utcnow(),
#                     "updated_at": datetime.utcnow()
#                 }
#             }
#         )
        
#         updated_message = messages_collection.find_one({"_id": ObjectId(message_id)})
#         updated_message["_id"] = str(updated_message["_id"])
#         updated_message["created_at"] = updated_message["created_at"].isoformat()
#         updated_message["updated_at"] = updated_message["updated_at"].isoformat()
#         if updated_message.get("edited_at"):
#             updated_message["edited_at"] = updated_message["edited_at"].isoformat()
        
#         return success_response({
#             "message": "Message updated successfully",
#             "data": updated_message
#         })
        
#     except json.JSONDecodeError:
#         return error_response("Invalid JSON", 400)
#     except Exception as e:
#         return error_response(f"Error updating message: {str(e)}", 500)

# def delete_message(channel_id, message_id, user_id):
#     """Delete a message (only by original author or channel admin)"""
#     try:
#         # Find message
#         message = messages_collection.find_one({"_id": ObjectId(message_id)})
#         if not message:
#             return error_response("Message not found", 404)
        
#         # Check permissions (owner or project owner)
#         channel = channels_collection.find_one({"_id": ObjectId(channel_id)})
#         project = Project.find_by_id(str(channel["project_id"]))
        
#         is_owner = message["user_id"] == user_id
#         is_admin = project["user_id"] == user_id
        
#         if not (is_owner or is_admin):
#             return error_response("Insufficient permissions to delete message", 403)
        
#         # Delete message and associated data
#         messages_collection.delete_one({"_id": ObjectId(message_id)})
#         reactions_collection.delete_many({"message_id": ObjectId(message_id)})
#         mentions_collection.delete_many({"message_id": ObjectId(message_id)})
        
#         return success_response({"message": "Message deleted successfully"})
        
#     except Exception as e:
#         return error_response(f"Error deleting message: {str(e)}", 500)

# # ============================================
# # ENHANCED MESSAGE SENDING WITH MENTIONS/REPLIES
# # ============================================

# def send_message_enhanced(body_str, channel_id, user_id):
#     """Send message with support for mentions, replies, and attachments"""
#     try:
#         data = json.loads(body_str)
        
#         # Extract message data
#         text = data.get("text", "").strip()
#         reply_to = data.get("reply_to")  # Message ID being replied to
#         mentions = data.get("mentions", [])  # List of user IDs mentioned
#         attachment = data.get("attachment")  # File attachment object
        
#         if not text and not attachment:
#             return error_response("Message must have text or attachment", 400)
        
#         # Verify channel exists
#         channel = channels_collection.find_one({"_id": ObjectId(channel_id)})
#         if not channel:
#             return error_response("Channel not found", 404)
        
#         # Verify user is member of project
#         project_id = str(channel["project_id"])
#         if not Project.is_member(project_id, user_id):
#             return error_response("You are not a member of this project", 403)
        
#         # Get user info
#         user = User.find_by_id(user_id)
#         if not user:
#             return error_response("User not found", 404)
        
#         # Create message document
#         message_data = {
#             "channel_id": ObjectId(channel_id),
#             "project_id": channel["project_id"],
#             "user_id": user_id,
#             "text": text,
#             "read_by": [user_id],
#             "edited": False,
#             "created_at": datetime.utcnow(),
#             "updated_at": datetime.utcnow()
#         }
        
#         # Add reply reference if provided
#         if reply_to:
#             reply_message = messages_collection.find_one({"_id": ObjectId(reply_to)})
#             if reply_message:
#                 reply_user = User.find_by_id(reply_message["user_id"])
#                 message_data["reply_to"] = {
#                     "message_id": ObjectId(reply_to),
#                     "user_id": reply_message["user_id"],
#                     "user": reply_user["name"] if reply_user else "Unknown",
#                     "text": reply_message["text"][:50]  # Preview
#                 }
        
#         # Add attachment if provided
#         if attachment:
#             message_data["attachment"] = {
#                 "name": attachment.get("name"),
#                 "type": attachment.get("type"),
#                 "size": attachment.get("size"),
#                 "url": attachment.get("url")  # Should be a storage URL or base64
#             }
        
#         # Insert message
#         result = messages_collection.insert_one(message_data)
#         message_id = str(result.inserted_id)
        
#         # Process mentions
#         if mentions:
#             for mentioned_user_id in mentions:
#                 mention_data = {
#                     "message_id": ObjectId(message_id),
#                     "channel_id": ObjectId(channel_id),
#                     "project_id": channel["project_id"],
#                     "mentioned_user_id": mentioned_user_id,
#                     "by_user_id": user_id,
#                     "read": False,
#                     "created_at": datetime.utcnow()
#                 }
#                 mentions_collection.insert_one(mention_data)
        
#         return success_response({
#             "message": "Message sent successfully",
#             "message_id": message_id
#         }, 201)
        
#     except json.JSONDecodeError:
#         return error_response("Invalid JSON", 400)
#     except Exception as e:
#         return error_response(f"Error sending message: {str(e)}", 500)

# # ============================================
# # READ RECEIPTS
# # ============================================

# def mark_messages_as_read(channel_id, body_str, user_id):
#     """Mark multiple messages as read"""
#     try:
#         data = json.loads(body_str)
#         message_ids = data.get("message_ids", [])
        
#         if not message_ids:
#             return error_response("No message IDs provided", 400)
        
#         # Update read_by array for all messages
#         object_ids = [ObjectId(mid) for mid in message_ids]
        
#         messages_collection.update_many(
#             {
#                 "_id": {"$in": object_ids},
#                 "channel_id": ObjectId(channel_id),
#                 "read_by": {"$ne": user_id}
#             },
#             {
#                 "$addToSet": {"read_by": user_id}
#             }
#         )
        
#         # Mark mentions as read
#         mentions_collection.update_many(
#             {
#                 "message_id": {"$in": object_ids},
#                 "mentioned_user_id": user_id,
#                 "read": False
#             },
#             {
#                 "$set": {"read": True, "read_at": datetime.utcnow()}
#             }
#         )
        
#         return success_response({"message": "Messages marked as read"})
        
#     except json.JSONDecodeError:
#         return error_response("Invalid JSON", 400)
#     except Exception as e:
#         return error_response(f"Error marking as read: {str(e)}", 500)

# # ============================================
# # MENTIONS
# # ============================================

# def get_user_mentions(user_id):
#     """Get all unread mentions for a user"""
#     try:
#         mentions = list(mentions_collection.find({
#             "mentioned_user_id": user_id,
#             "read": False
#         }).sort("created_at", -1).limit(50))
        
#         # Enrich with message and channel data
#         enriched_mentions = []
#         for mention in mentions:
#             message = messages_collection.find_one({"_id": mention["message_id"]})
#             channel = channels_collection.find_one({"_id": mention["channel_id"]})
#             by_user = User.find_by_id(mention["by_user_id"])
            
#             if message and channel and by_user:
#                 enriched_mentions.append({
#                     "mention_id": str(mention["_id"]),
#                     "message_id": str(message["_id"]),
#                     "channel_id": str(channel["_id"]),
#                     "channel_name": channel["name"],
#                     "project_id": str(mention["project_id"]),
#                     "message_text": message["text"],
#                     "by_user": by_user["name"],
#                     "created_at": mention["created_at"].isoformat()
#                 })
        
#         return success_response({
#             "mentions": enriched_mentions,
#             "count": len(enriched_mentions)
#         })
        
#     except Exception as e:
#         return error_response(f"Error fetching mentions: {str(e)}", 500)

# # ============================================
# # THREAD REPLIES
# # ============================================

# def get_thread_replies(message_id, user_id):
#     """Get all replies to a thread message"""
#     if not user_id:
#         return error_response("Unauthorized. Please login.", 401)
    
#     try:
#         # Get the parent message to verify access
#         parent_message = db.chat_messages.find_one({"_id": ObjectId(message_id)})
#         if not parent_message:
#             return error_response("Message not found", 404)
        
#         channel_id = str(parent_message["channel_id"])
        
#         # Get channel to verify access
#         channel = db.chat_channels.find_one({"_id": ObjectId(channel_id)})
#         if not channel:
#             return error_response("Channel not found", 404)
        
#         project_id = channel["project_id"]
        
#         # Check if user is member of the project
#         if not Project.is_member(project_id, user_id):
#             return error_response("Access denied. You are not a member of this project.", 403)
        
#         # Get thread replies
#         replies = list(db.chat_messages.find({
#             "thread_id": message_id
#         }).sort("created_at", 1))
        
#         # Enrich with user data
#         user_ids = list(set([msg["user_id"] for msg in replies]))
#         users = list(db.users.find(
#             {"_id": {"$in": [ObjectId(uid) for uid in user_ids]}},
#             {"_id": 1, "name": 1, "email": 1}
#         ))
#         user_map = {str(u["_id"]): u for u in users}
        
#         replies_data = []
#         for msg in replies:
#             user_data = user_map.get(msg["user_id"], {})
#             user_name = user_data.get("name", "Unknown")
            
#             # Generate avatar initials
#             name_parts = user_name.split()
#             avatar = "".join([part[0].upper() for part in name_parts[:2]]) if name_parts else "U"
            
#             replies_data.append({
#                 "id": str(msg["_id"]),
#                 "user": user_name,
#                 "userId": msg["user_id"],
#                 "avatar": avatar,
#                 "time": datetime_to_iso(msg["created_at"]),
#                 "timestamp": datetime_to_iso(msg["created_at"]),
#                 "text": msg["text"],
#                 "color": generate_user_color(msg["user_id"]),
#                 "edited": msg.get("edited", False)
#             })
        
#         return success_response({
#             "replies": replies_data,
#             "count": len(replies_data)
#         })
    
#     except Exception as e:
#         print(f"Error getting thread replies: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return error_response(f"Failed to get replies: {str(e)}", 500)


# def post_thread_reply(message_id, body_str, user_id):
#     """Post a reply to a thread message"""
#     if not user_id:
#         return error_response("Unauthorized. Please login.", 401)
    
#     try:
#         data = json.loads(body_str)
#     except:
#         return error_response("Invalid JSON", 400)
    
#     text = data.get("text", "").strip()
#     if not text:
#         return error_response("Message text is required", 400)
    
#     try:
#         # Get the parent message to verify access
#         parent_message = db.chat_messages.find_one({"_id": ObjectId(message_id)})
#         if not parent_message:
#             return error_response("Message not found", 404)
        
#         channel_id = str(parent_message["channel_id"])
        
#         # Get channel to verify access
#         channel = db.chat_channels.find_one({"_id": ObjectId(channel_id)})
#         if not channel:
#             return error_response("Channel not found", 404)
        
#         project_id = channel["project_id"]
        
#         # Check if user is member of the project
#         if not Project.is_member(project_id, user_id):
#             return error_response("Access denied. You are not a member of this project.", 403)
        
#         # Create reply message
#         now = datetime.now(timezone.utc).replace(tzinfo=None)
#         reply_data = {
#             "channel_id": channel_id,
#             "project_id": project_id,
#             "user_id": user_id,
#             "text": text,
#             "thread_id": message_id,  # Link to parent message
#             "created_at": now,
#             "updated_at": now,
#             "edited": False,
#             "read_by": [user_id]
#         }
        
#         result = db.chat_messages.insert_one(reply_data)
#         reply_id = str(result.inserted_id)
        
#         # Get user data for response
#         user = User.find_by_id(user_id)
#         user_name = user.get("name", "Unknown") if user else "Unknown"
#         name_parts = user_name.split()
#         avatar = "".join([part[0].upper() for part in name_parts[:2]]) if name_parts else "U"
        
#         return success_response({
#             "message": "Reply posted successfully",
#             "reply": {
#                 "id": reply_id,
#                 "user": user_name,
#                 "userId": user_id,
#                 "avatar": avatar,
#                 "time": datetime_to_iso(now),
#                 "timestamp": datetime_to_iso(now),
#                 "text": text,
#                 "color": generate_user_color(user_id),
#                 "edited": False
#             }
#         }, 201)
    
#     except Exception as e:
#         print(f"Error posting thread reply: {str(e)}")
#         import traceback
#         traceback.print_exc()
#         return error_response(f"Failed to post reply: {str(e)}", 500)

# # ============================================
# # FILE UPLOAD (Optional - depends on storage strategy)
# # ============================================

# def upload_attachment(body, headers, user_id):
#     """
#     Upload file attachment - handles multipart/form-data
    
#     Args:
#         body: Raw binary request body
#         headers: Request headers (to get content-type with boundary)
#         user_id: Authenticated user ID
    
#     Note: This is a basic implementation. In production, you would:
#     1. Use cloud storage (AWS S3, Google Cloud Storage, etc.)
#     2. Generate secure URLs
#     3. Scan for malware
#     4. Implement proper error handling
#     """
#     try:
#         import cgi
#         from io import BytesIO
#         import os
#         import base64
        
#         # Get content type with boundary
#         content_type = headers.get("Content-Type")
#         if not content_type or not content_type.startswith("multipart/form-data"):
#             return error_response("Invalid content type. Expected multipart/form-data", 400)
        
#         # Parse the multipart form data
#         content_type_header = content_type
        
#         # Create a file-like object from the body
#         fp = BytesIO(body)
        
#         # Parse using cgi.FieldStorage (works with Python's HTTP server)
#         environ = {
#             'REQUEST_METHOD': 'POST',
#             'CONTENT_TYPE': content_type_header,
#             'CONTENT_LENGTH': str(len(body))
#         }
        
#         form = cgi.FieldStorage(
#             fp=fp,
#             environ=environ,
#             keep_blank_values=True
#         )
        
#         # Get the file field
#         if 'file' not in form:
#             return error_response("No file provided", 400)
        
#         file_item = form['file']
        
#         if not file_item.filename:
#             return error_response("No filename provided", 400)
        
#         # Read file data
#         file_data = file_item.file.read()
#         filename = file_item.filename
#         filesize = len(file_data)
#         filetype = file_item.type or "application/octet-stream"
        
#         # Validate file size (max 10MB)
#         if filesize > 10 * 1024 * 1024:
#             return error_response("File size exceeds 10MB limit", 400)
        
#         # Validate file type (whitelist)
#         allowed_types = [
#             "image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg",
#             "application/pdf", 
#             "application/msword",
#             "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
#             "text/plain"
#         ]
        
#         if filetype not in allowed_types:
#             return error_response(f"File type '{filetype}' not allowed. Allowed types: images, PDF, Word docs, text files", 400)
        
#         # For now, encode as base64 and return data URL
#         # In production, upload to cloud storage and return URL
#         base64_data = base64.b64encode(file_data).decode('utf-8')
#         data_url = f"data:{filetype};base64,{base64_data}"
        
#         return success_response({
#             "attachment": {
#                 "url": data_url,
#                 "name": filename,
#                 "size": filesize,
#                 "type": filetype
#             }
#         })
        
#     except Exception as e:
#         import traceback
#         traceback.print_exc()
#         return error_response(f"Error uploading file: {str(e)}", 500)

# # ============================================
# # MESSAGE SEARCH
# # ============================================

# def search_messages(channel_id, user_id, query_params):
#     """Search messages in a channel"""
#     try:
#         query = query_params.get("q", "")
#         if not query:
#             return error_response("Search query is required", 400)
        
#         # Verify user has access to channel
#         channel = channels_collection.find_one({"_id": ObjectId(channel_id)})
#         if not channel:
#             return error_response("Channel not found", 404)
        
#         project_id = str(channel["project_id"])
#         if not Project.is_member(project_id, user_id):
#             return error_response("Access denied", 403)
        
#         # Search messages (case-insensitive)
#         messages = list(messages_collection.find({
#             "channel_id": ObjectId(channel_id),
#             "text": {"$regex": query, "$options": "i"}
#         }).sort("created_at", -1).limit(50))
        
#         # Format messages
#         formatted_messages = []
#         for msg in messages:
#             user = User.find_by_id(msg["user_id"])
#             formatted_messages.append({
#                 "id": str(msg["_id"]),
#                 "text": msg["text"],
#                 "user": user["name"] if user else "Unknown",
#                 "user_id": msg["user_id"],
#                 "created_at": msg["created_at"].isoformat(),
#                 "edited": msg.get("edited", False)
#             })
        
#         return success_response({
#             "results": formatted_messages,
#             "count": len(formatted_messages),
#             "query": query
#         })
        
#     except Exception as e:
#         return error_response(f"Error searching messages: {str(e)}", 500)
# """
# Team Chat Controller
# Handles project-based team chat with real-time messaging
# """
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
                "edited": 1,
                "attachment": 1  # Include attachment field
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
            
            msg_data = {
                "id": str(msg["_id"]),
                "user": user_name,
                "userId": msg["user_id"],
                "avatar": avatar,
                "time": datetime_to_iso(msg["created_at"]),
                "timestamp": datetime_to_iso(msg["created_at"]),
                "text": msg["text"],
                "color": generate_user_color(msg["user_id"]),
                "edited": msg.get("edited", False)
            }
            
            # Include attachment if present
            if "attachment" in msg and msg["attachment"]:
                msg_data["attachment"] = msg["attachment"]
            
            messages_data.append(msg_data)
        
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
    Send a message to a channel (supports text and attachments)
    """
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
        text = data.get("text", "").strip()
        attachment = data.get("attachment")  # Get attachment if provided
        
        # Allow empty text if there's an attachment
        if not text and not attachment:
            return error_response("Message text or attachment is required", 400)
        
        if text and len(text) > 5000:
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
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        message_data = {
            "channel_id": channel_id,
            "project_id": project_id,
            "user_id": user_id,
            "text": text or "",  # Allow empty text if there's attachment
            "read_by": [user_id],  # Creator has read it
            "edited": False,
            "created_at": now,
            "updated_at": now
        }
        
        # Add attachment if provided
        if attachment:
            message_data["attachment"] = {
                "id": attachment.get("id"),
                "name": attachment.get("name"),
                "size": attachment.get("size"),
                "type": attachment.get("type"),
                "url": attachment.get("url")
            }
        
        result = db.chat_messages.insert_one(message_data)
        message_id = str(result.inserted_id)
        
        # Return message data
        message_response = {
            "id": message_id,
            "user": user_name,
            "userId": user_id,
            "avatar": avatar,
            "time": datetime_to_iso(now),
            "timestamp": datetime_to_iso(now),
            "text": text or "",
            "color": generate_user_color(user_id),
            "edited": False
        }
        
        # Include attachment in response
        if attachment:
            message_response["attachment"] = message_data["attachment"]
        
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
"""
Enhanced Team Chat Controller with Reactions, Mentions, and File Uploads

This module extends the basic team_chat_controller.py with:
- Message reactions (emoji responses)
- @mentions functionality
- File attachments
- Message editing/deletion
- Read receipts
- Thread/reply support
"""



# Get database collections
channels_collection = db["chat_channels"]
messages_collection = db["chat_messages"]
reactions_collection = db["chat_reactions"]
mentions_collection = db["chat_mentions"]

# ============================================
# REACTION ENDPOINTS
# ============================================

def add_reaction(channel_id, message_id, body_str, user_id):
    """Add a reaction (emoji) to a message"""
    try:
        data = json.loads(body_str)
        emoji = data.get("emoji")
        
        if not emoji:
            return error_response("Emoji is required", 400)
        
        # Verify message exists
        message = messages_collection.find_one({"_id": ObjectId(message_id)})
        if not message:
            return error_response("Message not found", 404)
        
        # Check if user already reacted with this emoji
        existing_reaction = reactions_collection.find_one({
            "message_id": ObjectId(message_id),
            "user_id": user_id,
            "emoji": emoji
        })
        
        if existing_reaction:
            # Toggle off - remove reaction
            reactions_collection.delete_one({"_id": existing_reaction["_id"]})
            action = "removed"
        else:
            # Add new reaction
            reaction_data = {
                "message_id": ObjectId(message_id),
                "channel_id": ObjectId(channel_id),
                "user_id": user_id,
                "emoji": emoji,
                "created_at": datetime.utcnow()
            }
            reactions_collection.insert_one(reaction_data)
            action = "added"
        
        # Get updated reaction counts
        reaction_counts = get_reaction_counts(message_id)
        
        return success_response({
            "message": f"Reaction {action}",
            "reactions": reaction_counts
        })
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON", 400)
    except Exception as e:
        return error_response(f"Error adding reaction: {str(e)}", 500)

def get_reaction_counts(message_id):
    """Get aggregated reaction counts for a message"""
    pipeline = [
        {"$match": {"message_id": ObjectId(message_id)}},
        {"$group": {
            "_id": "$emoji",
            "count": {"$sum": 1},
            "users": {"$push": "$user_id"}
        }},
        {"$project": {
            "emoji": "$_id",
            "count": 1,
            "users": 1,
            "_id": 0
        }}
    ]
    
    reactions = list(reactions_collection.aggregate(pipeline))
    return reactions

# ============================================
# MESSAGE EDITING/DELETION
# ============================================

def edit_message(channel_id, message_id, body_str, user_id):
    """Edit/update a message (only by original author)"""
    try:
        data = json.loads(body_str)
        new_text = data.get("text", "").strip()
        
        if not new_text:
            return error_response("Message text cannot be empty", 400)
        
        # Find message and verify ownership
        message = messages_collection.find_one({"_id": ObjectId(message_id)})
        if not message:
            return error_response("Message not found", 404)
        
        if message["user_id"] != user_id:
            return error_response("You can only edit your own messages", 403)
        
        # Update message
        messages_collection.update_one(
            {"_id": ObjectId(message_id)},
            {
                "$set": {
                    "text": new_text,
                    "edited": True,
                    "edited_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        updated_message = messages_collection.find_one({"_id": ObjectId(message_id)})
        updated_message["_id"] = str(updated_message["_id"])
        updated_message["created_at"] = updated_message["created_at"].isoformat()
        updated_message["updated_at"] = updated_message["updated_at"].isoformat()
        if updated_message.get("edited_at"):
            updated_message["edited_at"] = updated_message["edited_at"].isoformat()
        
        return success_response({
            "message": "Message updated successfully",
            "data": updated_message
        })
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON", 400)
    except Exception as e:
        return error_response(f"Error updating message: {str(e)}", 500)

def delete_message(channel_id, message_id, user_id):
    """Delete a message (only by original author or channel admin)"""
    try:
        # Find message
        message = messages_collection.find_one({"_id": ObjectId(message_id)})
        if not message:
            return error_response("Message not found", 404)
        
        # Check permissions (owner or project owner)
        channel = channels_collection.find_one({"_id": ObjectId(channel_id)})
        project = Project.find_by_id(str(channel["project_id"]))
        
        is_owner = message["user_id"] == user_id
        is_admin = project["user_id"] == user_id
        
        if not (is_owner or is_admin):
            return error_response("Insufficient permissions to delete message", 403)
        
        # Delete message and associated data
        messages_collection.delete_one({"_id": ObjectId(message_id)})
        reactions_collection.delete_many({"message_id": ObjectId(message_id)})
        mentions_collection.delete_many({"message_id": ObjectId(message_id)})
        
        return success_response({"message": "Message deleted successfully"})
        
    except Exception as e:
        return error_response(f"Error deleting message: {str(e)}", 500)

# ============================================
# ENHANCED MESSAGE SENDING WITH MENTIONS/REPLIES
# ============================================

def send_message_enhanced(body_str, channel_id, user_id):
    """Send message with support for mentions, replies, and attachments"""
    try:
        data = json.loads(body_str)
        
        # Extract message data
        text = data.get("text", "").strip()
        reply_to = data.get("reply_to")  # Message ID being replied to
        mentions = data.get("mentions", [])  # List of user IDs mentioned
        attachment = data.get("attachment")  # File attachment object
        
        if not text and not attachment:
            return error_response("Message must have text or attachment", 400)
        
        # Verify channel exists
        channel = channels_collection.find_one({"_id": ObjectId(channel_id)})
        if not channel:
            return error_response("Channel not found", 404)
        
        # Verify user is member of project
        project_id = str(channel["project_id"])
        if not Project.is_member(project_id, user_id):
            return error_response("You are not a member of this project", 403)
        
        # Get user info
        user = User.find_by_id(user_id)
        if not user:
            return error_response("User not found", 404)
        
        # Create message document
        message_data = {
            "channel_id": ObjectId(channel_id),
            "project_id": channel["project_id"],
            "user_id": user_id,
            "text": text,
            "read_by": [user_id],
            "edited": False,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Add reply reference if provided
        if reply_to:
            reply_message = messages_collection.find_one({"_id": ObjectId(reply_to)})
            if reply_message:
                reply_user = User.find_by_id(reply_message["user_id"])
                message_data["reply_to"] = {
                    "message_id": ObjectId(reply_to),
                    "user_id": reply_message["user_id"],
                    "user": reply_user["name"] if reply_user else "Unknown",
                    "text": reply_message["text"][:50]  # Preview
                }
        
        # Add attachment if provided
        if attachment:
            message_data["attachment"] = {
                "name": attachment.get("name"),
                "type": attachment.get("type"),
                "size": attachment.get("size"),
                "url": attachment.get("url")  # Should be a storage URL or base64
            }
        
        # Insert message
        result = messages_collection.insert_one(message_data)
        message_id = str(result.inserted_id)
        
        # Process mentions
        if mentions:
            for mentioned_user_id in mentions:
                mention_data = {
                    "message_id": ObjectId(message_id),
                    "channel_id": ObjectId(channel_id),
                    "project_id": channel["project_id"],
                    "mentioned_user_id": mentioned_user_id,
                    "by_user_id": user_id,
                    "read": False,
                    "created_at": datetime.utcnow()
                }
                mentions_collection.insert_one(mention_data)
        
        return success_response({
            "message": "Message sent successfully",
            "message_id": message_id
        }, 201)
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON", 400)
    except Exception as e:
        return error_response(f"Error sending message: {str(e)}", 500)

# ============================================
# READ RECEIPTS
# ============================================

def mark_messages_as_read(channel_id, body_str, user_id):
    """Mark multiple messages as read"""
    try:
        data = json.loads(body_str)
        message_ids = data.get("message_ids", [])
        
        if not message_ids:
            return error_response("No message IDs provided", 400)
        
        # Update read_by array for all messages
        object_ids = [ObjectId(mid) for mid in message_ids]
        
        messages_collection.update_many(
            {
                "_id": {"$in": object_ids},
                "channel_id": ObjectId(channel_id),
                "read_by": {"$ne": user_id}
            },
            {
                "$addToSet": {"read_by": user_id}
            }
        )
        
        # Mark mentions as read
        mentions_collection.update_many(
            {
                "message_id": {"$in": object_ids},
                "mentioned_user_id": user_id,
                "read": False
            },
            {
                "$set": {"read": True, "read_at": datetime.utcnow()}
            }
        )
        
        return success_response({"message": "Messages marked as read"})
        
    except json.JSONDecodeError:
        return error_response("Invalid JSON", 400)
    except Exception as e:
        return error_response(f"Error marking as read: {str(e)}", 500)

# ============================================
# MENTIONS
# ============================================

def get_user_mentions(user_id):
    """Get all unread mentions for a user"""
    try:
        mentions = list(mentions_collection.find({
            "mentioned_user_id": user_id,
            "read": False
        }).sort("created_at", -1).limit(50))
        
        # Enrich with message and channel data
        enriched_mentions = []
        for mention in mentions:
            message = messages_collection.find_one({"_id": mention["message_id"]})
            channel = channels_collection.find_one({"_id": mention["channel_id"]})
            by_user = User.find_by_id(mention["by_user_id"])
            
            if message and channel and by_user:
                enriched_mentions.append({
                    "mention_id": str(mention["_id"]),
                    "message_id": str(message["_id"]),
                    "channel_id": str(channel["_id"]),
                    "channel_name": channel["name"],
                    "project_id": str(mention["project_id"]),
                    "message_text": message["text"],
                    "by_user": by_user["name"],
                    "created_at": mention["created_at"].isoformat()
                })
        
        return success_response({
            "mentions": enriched_mentions,
            "count": len(enriched_mentions)
        })
        
    except Exception as e:
        return error_response(f"Error fetching mentions: {str(e)}", 500)

# ============================================
# THREAD REPLIES
# ============================================

def get_thread_replies(channel_id, message_id, user_id, query_params=None):
    """Get all replies to a thread message"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        # Get the parent message to verify access
        parent_message = db.chat_messages.find_one({"_id": ObjectId(message_id)})
        if not parent_message:
            return error_response("Message not found", 404)
        
        channel_id = str(parent_message["channel_id"])
        
        # Get channel to verify access
        channel = db.chat_channels.find_one({"_id": ObjectId(channel_id)})
        if not channel:
            return error_response("Channel not found", 404)
        
        project_id = channel["project_id"]
        
        # Check if user is member of the project
        if not Project.is_member(project_id, user_id):
            return error_response("Access denied. You are not a member of this project.", 403)
        
        # Get thread replies
        replies = list(db.chat_messages.find({
            "thread_id": message_id
        }).sort("created_at", 1))
        
        # Enrich with user data
        user_ids = list(set([msg["user_id"] for msg in replies]))
        users = list(db.users.find(
            {"_id": {"$in": [ObjectId(uid) for uid in user_ids]}},
            {"_id": 1, "name": 1, "email": 1}
        ))
        user_map = {str(u["_id"]): u for u in users}
        
        replies_data = []
        for msg in replies:
            user_data = user_map.get(msg["user_id"], {})
            user_name = user_data.get("name", "Unknown")
            
            # Generate avatar initials
            name_parts = user_name.split()
            avatar = "".join([part[0].upper() for part in name_parts[:2]]) if name_parts else "U"
            
            replies_data.append({
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
        
        return success_response({
            "replies": replies_data,
            "count": len(replies_data)
        })
    
    except Exception as e:
        print(f"Error getting thread replies: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f"Failed to get replies: {str(e)}", 500)


def post_thread_reply(channel_id, message_id, body_str, user_id):
    """Post a reply to a thread message"""
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)
    
    try:
        data = json.loads(body_str)
    except:
        return error_response("Invalid JSON", 400)
    
    text = data.get("text", "").strip()
    if not text:
        return error_response("Message text is required", 400)
    
    try:
        # Get the parent message to verify access
        parent_message = db.chat_messages.find_one({"_id": ObjectId(message_id)})
        if not parent_message:
            return error_response("Message not found", 404)
        
        channel_id = str(parent_message["channel_id"])
        
        # Get channel to verify access
        channel = db.chat_channels.find_one({"_id": ObjectId(channel_id)})
        if not channel:
            return error_response("Channel not found", 404)
        
        project_id = channel["project_id"]
        
        # Check if user is member of the project
        if not Project.is_member(project_id, user_id):
            return error_response("Access denied. You are not a member of this project.", 403)
        
        # Create reply message
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        reply_data = {
            "channel_id": channel_id,
            "project_id": project_id,
            "user_id": user_id,
            "text": text,
            "thread_id": message_id,  # Link to parent message
            "created_at": now,
            "updated_at": now,
            "edited": False,
            "read_by": [user_id]
        }
        
        result = db.chat_messages.insert_one(reply_data)
        reply_id = str(result.inserted_id)
        
        # Get user data for response
        user = User.find_by_id(user_id)
        user_name = user.get("name", "Unknown") if user else "Unknown"
        name_parts = user_name.split()
        avatar = "".join([part[0].upper() for part in name_parts[:2]]) if name_parts else "U"
        
        return success_response({
            "message": "Reply posted successfully",
            "reply": {
                "id": reply_id,
                "user": user_name,
                "userId": user_id,
                "avatar": avatar,
                "time": datetime_to_iso(now),
                "timestamp": datetime_to_iso(now),
                "text": text,
                "color": generate_user_color(user_id),
                "edited": False
            }
        }, 201)
    
    except Exception as e:
        print(f"Error posting thread reply: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f"Failed to post reply: {str(e)}", 500)

# ============================================
# FILE UPLOAD (Optional - depends on storage strategy)
# ============================================

def upload_attachment(body, headers, user_id):
    """
    Upload file attachment - handles multipart/form-data and saves to MongoDB
    
    Args:
        body: Raw binary request body
        headers: Request headers (to get content-type with boundary)
        user_id: Authenticated user ID
    
    Saves files as base64-encoded documents in MongoDB chat_attachments collection
    """
    try:
        import base64
        from datetime import datetime, timezone
        from bson import ObjectId
        
        # Get content type with boundary
        content_type = headers.get("Content-Type")
        if not content_type or not content_type.startswith("multipart/form-data"):
            return error_response("Invalid content type. Expected multipart/form-data", 400)
        
        # Extract boundary from content-type header
        # Example: "multipart/form-data; boundary=----WebKitFormBoundary..."
        boundary = None
        for part in content_type.split(';'):
            part = part.strip()
            if part.startswith('boundary='):
                boundary = part[9:].strip('"')
                break
        
        if not boundary:
            return error_response("No boundary found in content-type", 400)
        
        # Parse multipart data manually
        boundary_bytes = f'--{boundary}'.encode()
        parts = body.split(boundary_bytes)
        
        file_data = None
        filename = None
        filetype = None
        
        # Find the file part
        for part in parts:
            if b'Content-Disposition' in part and b'filename=' in part:
                # Split headers and data
                header_end = part.find(b'\r\n\r\n')
                if header_end == -1:
                    header_end = part.find(b'\n\n')
                
                if header_end == -1:
                    continue
                
                headers_section = part[:header_end].decode('utf-8', errors='ignore')
                file_data = part[header_end+4:]  # +4 for \r\n\r\n or +2 for \n\n
                
                # Remove trailing boundary markers
                if file_data.endswith(b'\r\n'):
                    file_data = file_data[:-2]
                elif file_data.endswith(b'\n'):
                    file_data = file_data[:-1]
                
                # Extract filename
                for line in headers_section.split('\n'):
                    if 'filename=' in line:
                        # Extract filename from: filename="image.png"
                        start = line.find('filename="')
                        if start != -1:
                            start += 10
                            end = line.find('"', start)
                            if end != -1:
                                filename = line[start:end]
                    
                    # Extract content type
                    if line.strip().startswith('Content-Type:'):
                        filetype = line.split(':', 1)[1].strip()
                
                break
        
        if not file_data or not filename:
            return error_response("No file found in request", 400)
        
        filesize = len(file_data)
        
        # Use default content type if not specified
        if not filetype:
            # Guess from extension
            ext = filename.lower().split('.')[-1] if '.' in filename else ''
            type_map = {
                'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
                'png': 'image/png', 'gif': 'image/gif',
                'webp': 'image/webp', 'pdf': 'application/pdf',
                'doc': 'application/msword',
                'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'txt': 'text/plain'
            }
            filetype = type_map.get(ext, 'application/octet-stream')
        
        # Validate file size (max 10MB)
        if filesize > 10 * 1024 * 1024:
            return error_response("File size exceeds 10MB limit", 400)
        
        # Validate file type (whitelist)
        allowed_types = [
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/jpg",
            "application/pdf", 
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "text/plain"
        ]
        
        if filetype not in allowed_types:
            return error_response(f"File type '{filetype}' not allowed. Allowed: images, PDF, Word, Excel, text", 400)
        
        # Encode file as base64
        base64_data = base64.b64encode(file_data).decode('utf-8')
        
        # Save to MongoDB
        now = datetime.now(timezone.utc).replace(tzinfo=None)
        attachment_doc = {
            "user_id": user_id,
            "filename": filename,
            "filesize": filesize,
            "filetype": filetype,
            "base64_data": base64_data,
            "created_at": now,
            "updated_at": now
        }
        
        # Insert into chat_attachments collection
        result = db.chat_attachments.insert_one(attachment_doc)
        attachment_id = str(result.inserted_id)
        
        # Create data URL for immediate display
        data_url = f"data:{filetype};base64,{base64_data}"
        
        print(f"✓ File uploaded: {filename} ({filesize} bytes) - ID: {attachment_id}")
        
        return success_response({
            "attachment": {
                "id": attachment_id,
                "url": data_url,
                "name": filename,
                "size": filesize,
                "type": filetype
            }
        })
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f"Error uploading file: {str(e)}", 500)
        
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(f"Error uploading file: {str(e)}", 500)

# ============================================
# MESSAGE SEARCH
# ============================================

def search_messages(channel_id, user_id, query_params):
    """Search messages in a channel"""
    try:
        query = query_params.get("q", "")
        if not query:
            return error_response("Search query is required", 400)
        
        # Verify user has access to channel
        channel = channels_collection.find_one({"_id": ObjectId(channel_id)})
        if not channel:
            return error_response("Channel not found", 404)
        
        project_id = str(channel["project_id"])
        if not Project.is_member(project_id, user_id):
            return error_response("Access denied", 403)
        
        # Search messages (case-insensitive)
        messages = list(messages_collection.find({
            "channel_id": ObjectId(channel_id),
            "text": {"$regex": query, "$options": "i"}
        }).sort("created_at", -1).limit(50))
        
        # Format messages
        formatted_messages = []
        for msg in messages:
            user = User.find_by_id(msg["user_id"])
            formatted_messages.append({
                "id": str(msg["_id"]),
                "text": msg["text"],
                "user": user["name"] if user else "Unknown",
                "user_id": msg["user_id"],
                "created_at": msg["created_at"].isoformat(),
                "edited": msg.get("edited", False)
            })
        
        return success_response({
            "results": formatted_messages,
            "count": len(formatted_messages),
            "query": query
        })
        
    except Exception as e:
        return error_response(f"Error searching messages: {str(e)}", 500)