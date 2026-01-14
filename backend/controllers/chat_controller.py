# """
# AI Chatbot Controller - Powered by Claude API
# Analyzes user's MongoDB data and provides intelligent insights
# """
import json
import os
from datetime import datetime, timedelta
from bson import ObjectId
from database import db
from utils.response import success_response, error_response

# # Claude API endpoint is handled automatically via the Anthropic API in claude.ai


# def analyze_user_data(user_id):
#     """
#     Gather comprehensive user data for AI analysis
#     """
#     try:
#         # Get user info
#         user = db.users.find_one({"_id": ObjectId(user_id)})
#         if not user:
#             return None

#         # Get user's projects
#         user_projects = list(db.projects.find({
#             "$or": [
#                 {"user_id": user_id},
#                 {"members.user_id": user_id}
#             ]
#         }))

#         project_ids = [str(p["_id"]) for p in user_projects]

#         # Get all tasks for these projects
#         all_tasks = list(db.tasks.find({
#             "project_id": {"$in": project_ids}
#         }))

#         # Get tasks assigned to user
#         my_tasks = list(db.tasks.find({
#             "assignee_id": user_id
#         }))

#         # Get sprints
#         sprints = list(db.sprints.find({
#             "project_id": {"$in": project_ids}
#         }))

#         # Calculate statistics
#         now = datetime.now()
        
#         task_stats = {
#             "total": len(my_tasks),
#             "by_status": {},
#             "by_priority": {},
#             "overdue": 0,
#             "due_soon": 0,
#             "completed_this_week": 0,
#             "completed_this_month": 0,
#         }

#         for task in my_tasks:
#             # Status distribution
#             status = task.get("status", "To Do")
#             task_stats["by_status"][status] = task_stats["by_status"].get(status, 0) + 1

#             # Priority distribution
#             priority = task.get("priority", "Medium")
#             task_stats["by_priority"][priority] = task_stats["by_priority"].get(priority, 0) + 1

#             # Overdue tasks
#             if task.get("status") not in ["Done", "Closed"] and task.get("due_date"):
#                 due_date = task.get("due_date")
#                 if isinstance(due_date, str):
#                     try:
#                         due_date = datetime.fromisoformat(due_date.replace('Z', '+00:00'))
#                         if due_date < now:
#                             task_stats["overdue"] += 1
#                         elif due_date < now + timedelta(days=7):
#                             task_stats["due_soon"] += 1
#                     except:
#                         pass

#             # Completion stats
#             if task.get("status") in ["Done", "Closed"]:
#                 updated_at = task.get("updated_at")
#                 if isinstance(updated_at, datetime):
#                     if updated_at > now - timedelta(days=7):
#                         task_stats["completed_this_week"] += 1
#                     if updated_at > now - timedelta(days=30):
#                         task_stats["completed_this_month"] += 1

#         # Project stats
#         project_stats = {
#             "total": len(user_projects),
#             "owned": len([p for p in user_projects if p.get("user_id") == user_id]),
#             "member_of": len([p for p in user_projects if p.get("user_id") != user_id]),
#             "with_tasks": 0,
#         }

#         for project in user_projects:
#             project_tasks = [t for t in all_tasks if t.get("project_id") == str(project["_id"])]
#             if len(project_tasks) > 0:
#                 project_stats["with_tasks"] += 1

#         # Sprint stats
#         sprint_stats = {
#             "total": len(sprints),
#             "active": len([s for s in sprints if s.get("status") == "active"]),
#             "completed": len([s for s in sprints if s.get("status") == "completed"]),
#         }

#         return {
#             "user": {
#                 "name": user.get("name"),
#                 "email": user.get("email"),
#                 "role": user.get("role"),
#             },
#             "task_stats": task_stats,
#             "project_stats": project_stats,
#             "sprint_stats": sprint_stats,
#             "recent_tasks": [
#                 {
#                     "title": t.get("title"),
#                     "status": t.get("status"),
#                     "priority": t.get("priority"),
#                     "due_date": str(t.get("due_date")) if t.get("due_date") else None,
#                 }
#                 for t in sorted(my_tasks, key=lambda x: x.get("updated_at", datetime.min), reverse=True)[:10]
#             ],
#             "projects": [
#                 {
#                     "name": p.get("name"),
#                     "task_count": len([t for t in all_tasks if t.get("project_id") == str(p["_id"])]),
#                 }
#                 for p in user_projects[:10]
#             ]
#         }

#     except Exception as e:
#         print(f"Error analyzing user data: {str(e)}")
#         return None


def chat_ask(body_str, user_id):
    """
    Handle AI chat requests using Claude API
    """
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)

    try:
        data = json.loads(body_str)
        user_message = data.get("message", "").strip()
        conversation_history = data.get("conversationHistory", [])

        if not user_message:
            return error_response("Message is required", 400)

        # Analyze user's data
        user_data = analyze_user_data(user_id)
        if not user_data:
            return error_response("Failed to analyze user data", 500)

        # Build context for Claude
        system_prompt = f"""You are an AI assistant for a task management system called DOIT. You help users understand their productivity, tasks, projects, and sprints.

Current User Context:
- Name: {user_data['user']['name']}
- Role: {user_data['user']['role']}

Task Statistics:
- Total tasks assigned: {user_data['stats']['tasks']['total']}
- Status breakdown: {json.dumps(user_data['stats']['tasks']['statusBreakdown'])}
- Priority breakdown: {json.dumps(user_data['stats']['tasks']['priorityBreakdown'])}
- Overdue tasks: {user_data['stats']['tasks']['overdue']}
- Due within 7 days: {user_data['stats']['tasks']['dueSoon']}
- Completed this week: {user_data['stats']['tasks']['completedWeek']}
- Completed this month: {user_data['stats']['tasks']['completedMonth']}

Project Statistics:
- Total projects: {user_data['stats']['projects']['total']}
- Projects owned: {user_data['stats']['projects']['owned']}
- Projects as member: {user_data['stats']['projects']['memberOf']}

Sprint Statistics:
- Total sprints: {user_data['stats']['sprints']['total']}
- Active sprints: {user_data['stats']['sprints']['active']}
- Completed sprints: {user_data['stats']['sprints']['completed']}

Recent Tasks (last 8):
{json.dumps(user_data['recentTasks'], indent=2)}

Top Projects:
{json.dumps(user_data['topProjects'], indent=2)}

Guidelines:
1. Provide actionable, specific insights based on the data
2. Use emojis to make responses friendly and engaging
3. Highlight important information like overdue tasks or upcoming deadlines
4. Offer productivity tips when relevant
5. Keep responses concise but informative (2-4 paragraphs max)
6. If asked about specific tasks or projects, reference them by name
7. Provide encouragement and positive reinforcement
8. Format numbers and dates in a user-friendly way
"""

        # Build conversation history for Claude
        messages = []
        
        # Add recent conversation context
        for msg in conversation_history[-10:]:  # Last 10 messages
            if msg.get('role') == 'user':
                messages.append({
                    "role": "user",
                    "content": msg.get('content', '')
                })
            elif msg.get('role') == 'assistant':
                messages.append({
                    "role": "assistant",
                    "content": msg.get('content', '')
                })

        # Add current user message
        messages.append({
            "role": "user",
            "content": user_message
        })

        # Note: In the actual Anthropic API environment, you would make the API call like this:
        # However, since we're in claude.ai, the API is available via the fetch API
        
        # This is a placeholder - the actual API call would be made from the frontend
        # using the Anthropic API endpoint exposed in claude.ai artifacts
        
        response_content = f"""This endpoint should call the Anthropic API with:

System Prompt: {system_prompt}

Messages: {json.dumps(messages, indent=2)}

The frontend should make this API call directly using:
```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {{
  method: "POST",
  headers: {{
    "Content-Type": "application/json",
  }},
  body: JSON.stringify({{
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: systemPrompt,
    messages: messages,
  }})
}});
```
"""

        return success_response({
            "response": response_content,
            "data": user_data,
            "system_prompt": system_prompt,
            "messages": messages
        })

    except json.JSONDecodeError:
        return error_response("Invalid JSON", 400)
    except Exception as e:
        print(f"Chat error: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f"Failed to process chat: {str(e)}", 500)


def get_chat_suggestions(user_id):
    """
    Get AI-powered suggestions for the user
    """
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)

    try:
        user_data = analyze_user_data(user_id)
        if not user_data:
            return error_response("Failed to analyze user data", 500)

        suggestions = []

        # Overdue tasks suggestion
        if user_data['task_stats']['overdue'] > 0:
            suggestions.append({
                "type": "warning",
                "title": f"⚠️ {user_data['task_stats']['overdue']} Overdue Task(s)",
                "message": "You have tasks past their due date. Consider reviewing and updating them.",
                "action": "View Overdue Tasks"
            })

        # Due soon suggestion
        if user_data['task_stats']['due_soon'] > 0:
            suggestions.append({
                "type": "info",
                "title": f"📅 {user_data['task_stats']['due_soon']} Task(s) Due Soon",
                "message": "These tasks are due within the next 7 days.",
                "action": "View Upcoming Tasks"
            })

        # Productivity insight
        if user_data['task_stats']['completed_this_week'] > 0:
            suggestions.append({
                "type": "success",
                "title": f"✨ Great Progress!",
                "message": f"You've completed {user_data['task_stats']['completed_this_week']} task(s) this week. Keep it up!",
                "action": None
            })

        # Idle projects
        idle_count = user_data['project_stats']['total'] - user_data['project_stats']['with_tasks']
        if idle_count > 0:
            suggestions.append({
                "type": "tip",
                "title": f"💡 {idle_count} Project(s) Need Attention",
                "message": "Some projects don't have any tasks yet. Consider adding tasks to get started.",
                "action": "View Projects"
            })

        return success_response({
            "suggestions": suggestions,
            "data_summary": {
                "tasks": user_data['task_stats']['total'],
                "projects": user_data['project_stats']['total'],
                "sprints": user_data['sprint_stats']['total'],
            }
        })

    except Exception as e:
        print(f"Error getting suggestions: {str(e)}")
        return error_response(f"Failed to get suggestions: {str(e)}", 500)
def analyze_user_data(user_id):
    try:
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return None

        user_projects = list(db.projects.find({
            "$or": [
                {"user_id": user_id},
                {"members.user_id": user_id}
            ]
        }))

        project_ids = [str(p["_id"]) for p in user_projects]

        my_tasks = list(db.tasks.find({"assignee_id": user_id}))
        all_tasks = list(db.tasks.find({"project_id": {"$in": project_ids}}))
        sprints = list(db.sprints.find({"project_id": {"$in": project_ids}}))

        now = datetime.utcnow()   # ← better to use UTC consistently

        # Helper to format dates nicely for frontend
        def format_date(dt):
            if not dt:
                return None
            if isinstance(dt, str):
                try:
                    dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
                except:
                    return dt
            return dt.strftime("%Y-%m-%d")   # or "%d %b %Y" etc.

        task_stats = {
            "total": len(my_tasks),
            "by_status": {},
            "by_priority": {},
            "overdue_count": 0,
            "due_soon_count": 0,
            "completed_this_week": 0,
            "completed_this_month": 0,
        }

        for task in my_tasks:
            status = task.get("status", "To Do")
            priority = task.get("priority", "Medium")

            task_stats["by_status"][status] = task_stats["by_status"].get(status, 0) + 1
            task_stats["by_priority"][priority] = task_stats["by_priority"].get(priority, 0) + 1

            due = task.get("due_date")
            if due and status not in ["Done", "Closed"]:
                due_dt = None
                if isinstance(due, str):
                    try:
                        due_dt = datetime.fromisoformat(due.replace('Z', '+00:00'))
                    except:
                        pass
                elif isinstance(due, datetime):
                    due_dt = due

                if due_dt:
                    if due_dt < now:
                        task_stats["overdue_count"] += 1
                    elif due_dt < now + timedelta(days=7):
                        task_stats["due_soon_count"] += 1

            completed = task.get("updated_at")
            if status in ["Done", "Closed"] and isinstance(completed, datetime):
                if completed > now - timedelta(days=7):
                    task_stats["completed_this_week"] += 1
                if completed > now - timedelta(days=30):
                    task_stats["completed_this_month"] += 1

        # ────────────────────────────────────────────────
        # Final clean structure for frontend
        # ────────────────────────────────────────────────
        return {
            "user": {
                "name": user.get("name", "User"),
                "email": user.get("email"),
                "role": user.get("role", "Member")
            },
            "stats": {
                "tasks": {
                    "total": task_stats["total"],
                    "overdue": task_stats["overdue_count"],
                    "dueSoon": task_stats["due_soon_count"],
                    "completedWeek": task_stats["completed_this_week"],
                    "completedMonth": task_stats["completed_this_month"],
                    "statusBreakdown": task_stats["by_status"],
                    "priorityBreakdown": task_stats["by_priority"]
                },
                "projects": {
                    "total": len(user_projects),
                    "owned": sum(1 for p in user_projects if p.get("user_id") == user_id),
                    "memberOf": sum(1 for p in user_projects if p.get("user_id") != user_id),
                    "withTasks": sum(1 for p in user_projects 
                                    if any(t["project_id"] == str(p["_id"]) for t in all_tasks))
                },
                "sprints": {
                    "total": len(sprints),
                    "active": sum(1 for s in sprints if s.get("status") == "active"),
                    "completed": sum(1 for s in sprints if s.get("status") == "completed")
                }
            },
            "recentTasks": [
                {
                    "title": t.get("title", "Untitled"),
                    "status": t.get("status", "To Do"),
                    "priority": t.get("priority", "Medium"),
                    "dueDate": format_date(t.get("due_date")),
                    "projectId": t.get("project_id")
                }
                for t in sorted(my_tasks, key=lambda x: x.get("updated_at", datetime.min), reverse=True)[:8]
            ],
            "topProjects": [
                {
                    "name": p.get("name", "Unnamed Project"),
                    "id": str(p["_id"]),
                    "taskCount": sum(1 for t in all_tasks if t.get("project_id") == str(p["_id"]))
                }
                for p in user_projects[:6]
            ]
        }

    except Exception as e:
        print(f"Error analyzing user data: {str(e)}")
        return None