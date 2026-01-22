from controllers.auth_controller import (
    register, login, profile, logout, logout_all_sessions, get_user_sessions, refresh_session,clerk_sync
)
from controllers.project_controller import (
    create_project, 
    get_user_projects, 
    get_project_by_id, 
    update_project, 
    delete_project
)
from controllers.member_controller import (
    add_project_member,
    get_project_members,
    remove_project_member
)
from controllers.task_controller import (
    create_task,
    get_project_tasks,
    get_task_by_id,
    update_task,
    delete_task,
    get_my_tasks,
    add_label_to_task,
    remove_label_from_task,
    get_project_labels,
    add_attachment_to_task,
    remove_attachment_from_task,
    add_link_to_task,
    remove_link_from_task,
    approve_task,
    get_done_tasks_for_approval,
    get_all_pending_approval_tasks,
    get_all_closed_tasks,
    add_task_comment
)
from controllers.sprint_controller import (
    create_sprint,
    get_project_sprints,
    get_sprint_by_id,
    update_sprint,
    start_sprint,
    complete_sprint,
    delete_sprint,
    add_task_to_sprint,
    remove_task_from_sprint,
    get_backlog_tasks,
    get_available_sprint_tasks
)
from controllers.user_controller import search_users_by_email, get_all_users, update_user_role
from controllers.dashboard_controller import get_dashboard_analytics, get_downloadable_report
from controllers.profile_controller import (
    get_profile,
    update_personal_info,
    update_education,
    update_certificates,
    update_organization
)
from controllers.system_dashboard_controller import get_system_analytics
from controllers.chat_controller import chat_ask, get_chat_suggestions

routes = {
    # Chat routes
    "POST:/api/chat/ask": chat_ask,
    "GET:/api/chat/suggestions": get_chat_suggestions,
    
    # Auth routes
    "POST:/api/auth/register": register,
    "POST:/api/auth/login": login,
    "POST:/api/auth/clerk-sync": clerk_sync,  # Add this line
    "GET:/api/auth/profile": profile,
    "POST:/api/auth/logout": logout,
    "POST:/api/auth/logout-all": logout_all_sessions,
    "POST:/api/auth/refresh-session": refresh_session,  # Create new tab session
    "GET:/api/auth/sessions": get_user_sessions,
    
    # Dashboard routes
    "GET:/api/dashboard/analytics": get_dashboard_analytics,
    "GET:/api/dashboard/report": get_downloadable_report,
    "GET:/api/dashboard/system": get_system_analytics,  # System-wide analytics (super-admin only)
    
    # User routes
    "GET:/api/users/search": search_users_by_email,
    "GET:/api/users": get_all_users,  # Get all users (admin+)
    "PUT:/api/users/role": update_user_role,  # Update user role (super-admin only)
    
    # Project routes
    "POST:/api/projects": create_project,
    "GET:/api/projects": get_user_projects,
    "GET:/api/projects/": get_project_by_id,  # Will handle dynamic ID
    "PUT:/api/projects/": update_project,  # Will handle dynamic ID
    "DELETE:/api/projects/": delete_project,  # Will handle dynamic ID
    
    # Project Members routes
    "POST:/api/projects/members/": add_project_member,  # POST /api/projects/{id}/members
    "GET:/api/projects/members/": get_project_members,  # GET /api/projects/{id}/members
    "DELETE:/api/projects/members/user/": remove_project_member,  # DELETE /api/projects/{id}/members/{user_id}
    
    # Task routes
    "POST:/api/tasks": create_task,
    "GET:/api/tasks/my": get_my_tasks,  # Get tasks assigned to me
    "GET:/api/tasks/project/": get_project_tasks,  # GET /api/tasks/project/{project_id}
    "GET:/api/tasks/": get_task_by_id,  # GET /api/tasks/{task_id}
    "PUT:/api/tasks/": update_task,  # PUT /api/tasks/{task_id}
    "DELETE:/api/tasks/": delete_task,  # DELETE /api/tasks/{task_id}
    "POST:/api/tasks/comments/": add_task_comment,
    
    # Task label routes
    "POST:/api/tasks/labels/": add_label_to_task,  # POST /api/tasks/{task_id}/labels
    "DELETE:/api/tasks/labels/remove/": remove_label_from_task,  # DELETE /api/tasks/{task_id}/labels/{label}
    "GET:/api/tasks/labels/": get_project_labels,  # GET /api/tasks/labels/{project_id} - Get all labels for project
    
    # Task attachment routes
    "POST:/api/tasks/attachments/": add_attachment_to_task,  # POST /api/tasks/{task_id}/attachments
    "DELETE:/api/tasks/attachments/": remove_attachment_from_task,  # DELETE /api/tasks/{task_id}/attachments
    
    # Task link routes
    "POST:/api/tasks/links/": add_link_to_task,  # POST /api/tasks/{task_id}/links
    "DELETE:/api/tasks/links/": remove_link_from_task,  # DELETE /api/tasks/{task_id}/links
    
    # Task approval routes
    "POST:/api/tasks/approve/": approve_task,  # POST /api/tasks/{task_id}/approve
    "GET:/api/projects/tasks/done/": get_done_tasks_for_approval,  # GET /api/projects/{project_id}/tasks/done
    "GET:/api/tasks/pending-approval": get_all_pending_approval_tasks,  # GET all pending approval tasks
    "GET:/api/tasks/closed": get_all_closed_tasks,  # GET all closed tasks
    
    # Sprint routes
    "POST:/api/projects/sprints/": create_sprint,  # POST /api/projects/{project_id}/sprints
    "GET:/api/projects/sprints/": get_project_sprints,  # GET /api/projects/{project_id}/sprints
    "GET:/api/projects/backlog/": get_backlog_tasks,  # GET /api/projects/{project_id}/backlog
    "GET:/api/projects/available-tasks/": get_available_sprint_tasks,  # GET /api/projects/{project_id}/available-tasks
    "GET:/api/sprints/": get_sprint_by_id,  # GET /api/sprints/{sprint_id}
    "PUT:/api/sprints/": update_sprint,  # PUT /api/sprints/{sprint_id}
    "DELETE:/api/sprints/": delete_sprint,  # DELETE /api/sprints/{sprint_id}
    "POST:/api/sprints/start/": start_sprint,  # POST /api/sprints/{sprint_id}/start
    "POST:/api/sprints/complete/": complete_sprint,  # POST /api/sprints/{sprint_id}/complete
    "POST:/api/sprints/tasks/": add_task_to_sprint,  # POST /api/sprints/{sprint_id}/tasks
    "DELETE:/api/sprints/tasks/": remove_task_from_sprint,  # DELETE /api/sprints/{sprint_id}/tasks/{task_id}
    
    # Profile routes
    "GET:/api/profile": get_profile,  # GET /api/profile
    "PUT:/api/profile/personal": update_personal_info,  # PUT /api/profile/personal
    "PUT:/api/profile/education": update_education,  # PUT /api/profile/education
    "PUT:/api/profile/certificates": update_certificates,  # PUT /api/profile/certificates
    "PUT:/api/profile/organization": update_organization,  # PUT /api/profile/organization
}