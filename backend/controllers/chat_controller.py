import json
import os
import requests
from datetime import datetime, timedelta
from bson import ObjectId
from database import db
from utils.response import success_response, error_response


GEMINI_API_KEY = os.getenv("GOOGLE_GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
GEMINI_MODEL = "gemini-2.5-flash"  # or "gemini-2.5-flash-preview-*" if you want latest preview


def chat_ask(body_str, user_id):
    """
    Handle AI chat requests using Google Gemini API with real API calls
    COMPLETELY FREE with $300 credit
    """
    if not user_id:
        return error_response("Unauthorized. Please login.", 401)

    if not GEMINI_API_KEY:
        return error_response(
            "Gemini API key not configured. Get free $300 credit at https://ai.google.dev/",
            500
        )

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

        # Build enhanced context for Gemini
        system_prompt = build_system_prompt(user_data)

        # Build conversation history for Gemini
        messages = build_messages(conversation_history, user_message)

        # Call Gemini API
        response_data = call_gemini_api(system_prompt, messages)
        
        if not response_data:
            return error_response("Failed to get AI response from Gemini", 500)

        ai_response = response_data.get("content", "")
        
        # Extract insights if available
        insights = extract_insights(user_data, user_message.lower())

        return success_response({
            "response": ai_response,
            "insights": insights,
            "data": user_data,
            "success": True,
            "model": "Google Gemini 1.5 Flash (FREE)"
        })

    except json.JSONDecodeError:
        return error_response("Invalid JSON", 400)
    except Exception as e:
        print(f"Chat error: {str(e)}")
        import traceback
        traceback.print_exc()
        return error_response(f"Failed to process chat: {str(e)}", 500)


def call_gemini_api(system_prompt, messages):
    """
    Make actual API call to Google Gemini with error handling
    Uses completely FREE tier with $300 credit
    """
    try:
        # Build the full prompt with system context
        full_prompt = f"{system_prompt}\n\n---CONVERSATION---\n"
        
        # Add conversation history
        for msg in messages[:-1]:  # All except the last (current) message
            role = "User" if msg["role"] == "user" else "Assistant"
            full_prompt += f"\n{role}: {msg['content']}\n"
        
        # Add current message
        full_prompt += f"\nUser: {messages[-1]['content']}\n\nAssistant:"

        # Prepare request with correct API format
        url = f"{GEMINI_API_URL}?key={GEMINI_API_KEY}"
        
        headers = {
            "Content-Type": "application/json",
        }

        # Use the correct v1 API request format
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": full_prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.7,
                "topP": 0.95,
                "topK": 40,
                "maxOutputTokens": 1024,
            }
        }

        response = requests.post(url, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        data = response.json()
        
        # Extract response text
        if "candidates" in data and len(data["candidates"]) > 0:
            candidate = data["candidates"][0]
            if "content" in candidate and "parts" in candidate["content"]:
                if len(candidate["content"]["parts"]) > 0:
                    response_text = candidate["content"]["parts"][0]["text"]
                    return {
                        "content": response_text,
                        "model": "Gemini 1.5 Flash",
                        "free": True
                    }
        
        return None

    except requests.exceptions.Timeout:
        print("[ERROR] Gemini API timeout")
        return None
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Gemini API request failed: {str(e)}")
        return None
    except Exception as e:
        print(f"[ERROR] Failed to call Gemini API: {str(e)}")
        return None


def build_system_prompt(user_data):
    """
    Build comprehensive system prompt with context for Gemini
    """
    tasks = user_data['stats']['tasks']
    projects = user_data['stats']['projects']
    sprints = user_data['stats']['sprints']

    return f"""You are an intelligent AI assistant for DOIT, a powerful task management system. Your role is to provide deep insights, actionable recommendations, and motivational feedback to help users maximize their productivity.

## USER PROFILE
- **Name:** {user_data['user']['name']}
- **Role:** {user_data['user']['role']}
- **Email:** {user_data['user']['email']}

## TASK ANALYTICS
- **Total Tasks Assigned:** {tasks['total']}
- **Status Distribution:** Done: {tasks['statusBreakdown'].get('Done', 0)}, In Progress: {tasks['statusBreakdown'].get('In Progress', 0)}, To Do: {tasks['statusBreakdown'].get('To Do', 0)}, Closed: {tasks['statusBreakdown'].get('Closed', 0)}
- **Priority Distribution:** High: {tasks['priorityBreakdown'].get('High', 0)}, Medium: {tasks['priorityBreakdown'].get('Medium', 0)}, Low: {tasks['priorityBreakdown'].get('Low', 0)}
- **Critical Metrics:**
  - Overdue Tasks: {tasks['overdue']}
  - Due Within 7 Days: {tasks['dueSoon']}
  - Completed This Week: {tasks['completedWeek']}
  - Completed This Month: {tasks['completedMonth']}

## PROJECT OVERVIEW
- **Total Projects:** {projects['total']}
- **Owned Projects:** {projects['owned']}
- **Member In:** {projects['memberOf']}
- **Active Projects:** {projects['withTasks']}

## SPRINT STATUS
- **Total Sprints:** {sprints['total']}
- **Active Sprints:** {sprints['active']}
- **Completed Sprints:** {sprints['completed']}

## RECENT ACTIVITY (Last 8 Tasks)
{format_recent_tasks(user_data['recentTasks'])}

## TOP PROJECTS
{format_top_projects(user_data['topProjects'])}

## RESPONSE GUIDELINES
1. Be Specific: Reference actual task and project names when possible
2. Provide Metrics: Include numbers, percentages, and trends in your analysis
3. Actionable Insights: Offer concrete recommendations they can implement immediately
4. Celebrate Progress: Acknowledge completed tasks and completed sprints with genuine enthusiasm
5. Flag Issues: Highlight overdue tasks, bottlenecks, or concerning patterns
6. Suggest Improvements: Recommend priority adjustments, sprint planning changes, or workflow optimizations
7. Use Emojis: Make responses engaging and friendly (📊 📈 ⚠️ ✅ 🚀 etc.)
8. Concise But Rich: Keep responses to 3-4 paragraphs but pack them with valuable insights
9. Personalize: Address the user by name and acknowledge their specific situation
10. Format Clearly: Use bullet points and line breaks for readability

You have access to their complete task and project ecosystem. Use this to provide holistic advice that considers their entire workload and project portfolio.

Start with insights, then answer their specific question. Be proactive in identifying risks and opportunities."""


def format_recent_tasks(tasks):
    """Format recent tasks for prompt"""
    if not tasks:
        return "No recent tasks"
    
    formatted = []
    for task in tasks:
        due_date = task['dueDate'] if task['dueDate'] else "No due date"
        formatted.append(
            f"- {task['title']} ({task['status']}) - Priority: {task['priority']} - Due: {due_date}"
        )
    
    return "\n".join(formatted[:8])


def format_top_projects(projects):
    """Format top projects for prompt"""
    if not projects:
        return "No projects"
    
    formatted = []
    for proj in projects:
        formatted.append(f"- {proj['name']} - {proj['taskCount']} tasks")
    
    return "\n".join(formatted)


def build_messages(conversation_history, user_message):
    """
    Build message array for Gemini API with context
    """
    messages = []
    
    # Add last 10 messages from conversation history
    for msg in conversation_history[-10:]:
        if msg.get('role') in ['user', 'assistant']:
            messages.append({
                "role": msg.get('role'),
                "content": msg.get('content', '')
            })
    
    # Add current user message
    messages.append({
        "role": "user",
        "content": user_message
    })
    
    return messages


def extract_insights(user_data, query_lower):
    """
    Extract and generate insights based on user data and query
    """
    insights = []
    tasks = user_data['stats']['tasks']
    projects = user_data['stats']['projects']

    # Check for overdue tasks
    if tasks['overdue'] > 0:
        insights.append({
            "type": "warning",
            "icon": "⚠️",
            "title": f"{tasks['overdue']} Overdue Task(s)",
            "description": "You have tasks past their due date that need immediate attention"
        })

    # Check for upcoming deadlines
    if tasks['dueSoon'] > 0:
        insights.append({
            "type": "info",
            "icon": "📅",
            "title": f"{tasks['dueSoon']} Task(s) Due Soon",
            "description": "Multiple tasks coming due within the next week"
        })

    # Completion rate
    if tasks['total'] > 0:
        completion_rate = ((tasks['statusBreakdown'].get('Done', 0) + 
                           tasks['statusBreakdown'].get('Closed', 0)) / tasks['total']) * 100
        
        if completion_rate >= 80:
            insights.append({
                "type": "success",
                "icon": "🎉",
                "title": f"{int(completion_rate)}% Completion Rate",
                "description": "Excellent task completion! Keep up this momentum."
            })
        elif completion_rate >= 50:
            insights.append({
                "type": "info",
                "icon": "📈",
                "title": f"{int(completion_rate)}% Completion Rate",
                "description": "Good progress on your tasks. Keep pushing!"
            })

    # Workload analysis
    high_priority_count = tasks['priorityBreakdown'].get('High', 0)
    if high_priority_count > 3:
        insights.append({
            "type": "warning",
            "icon": "🔴",
            "title": f"{high_priority_count} High Priority Tasks",
            "description": "You have many high-priority items. Consider prioritization."
        })

    # Project portfolio
    if projects['total'] > 5:
        insights.append({
            "type": "info",
            "icon": "📊",
            "title": f"Managing {projects['total']} Projects",
            "description": "Diverse project portfolio. Stay organized with sprints and milestones."
        })

    # Weekly productivity
    if tasks['completedWeek'] > 0:
        insights.append({
            "type": "success",
            "icon": "✅",
            "title": f"{tasks['completedWeek']} Tasks Completed This Week",
            "description": f"Great weekly performance!"
        })

    return insights


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
        tasks = user_data['stats']['tasks']
        projects = user_data['stats']['projects']
        sprints = user_data['stats']['sprints']

        # Critical: Overdue tasks
        if tasks['overdue'] > 0:
            suggestions.append({
                "type": "critical",
                "icon": "🚨",
                "title": f"{tasks['overdue']} Overdue Task(s)",
                "message": "Immediate action required. Review and update overdue items.",
                "action": "View Overdue Tasks",
                "priority": 1
            })

        # High priority: Due soon
        if tasks['dueSoon'] > 0:
            suggestions.append({
                "type": "warning",
                "icon": "⏰",
                "title": f"{tasks['dueSoon']} Task(s) Due This Week",
                "message": "Plan your time wisely for upcoming deadlines.",
                "action": "View Upcoming",
                "priority": 2
            })

        # Positive: Great progress
        if tasks['completedWeek'] >= 3:
            suggestions.append({
                "type": "success",
                "icon": "🌟",
                "title": "Excellent Weekly Performance!",
                "message": f"You've completed {tasks['completedWeek']} tasks this week. Keep it up!",
                "action": None,
                "priority": 3
            })

        # Info: Project status
        idle_projects = projects['total'] - projects['withTasks']
        if idle_projects > 0:
            suggestions.append({
                "type": "info",
                "icon": "📌",
                "title": f"{idle_projects} Project(s) Inactive",
                "message": "Some projects have no active tasks. Consider planning next steps.",
                "action": "View Projects",
                "priority": 4
            })

        # Info: Sprint status
        if sprints['active'] == 0 and sprints['total'] > 0:
            suggestions.append({
                "type": "tip",
                "icon": "🏃",
                "title": "No Active Sprints",
                "message": "Consider starting a new sprint to organize your work.",
                "action": "View Sprints",
                "priority": 5
            })

        # Sort by priority
        suggestions.sort(key=lambda x: x['priority'])

        return success_response({
            "suggestions": suggestions,
            "summary": {
                "totalTasks": tasks['total'],
                "completedTasks": tasks['statusBreakdown'].get('Done', 0) + tasks['statusBreakdown'].get('Closed', 0),
                "totalProjects": projects['total'],
                "activeSprints": sprints['active']
            },
            "note": "Powered by Google Gemini - Completely FREE with $300 credit!"
        })

    except Exception as e:
        print(f"Error getting suggestions: {str(e)}")
        return error_response(f"Failed to get suggestions: {str(e)}", 500)


def analyze_user_data(user_id):
    """
    Comprehensive user data analysis
    """
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

        now = datetime.utcnow()

        def format_date(dt):
            if not dt:
                return None
            if isinstance(dt, str):
                try:
                    dt = datetime.fromisoformat(dt.replace('Z', '+00:00'))
                except:
                    return dt
            return dt.strftime("%Y-%m-%d")

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