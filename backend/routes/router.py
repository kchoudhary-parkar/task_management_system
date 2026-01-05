from controllers.auth_controller import register, login, profile
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
    get_my_tasks
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
    remove_task_from_sprint
)
from controllers.user_controller import search_users_by_email, get_all_users, update_user_role

routes = {
    # Auth routes
    "POST:/api/auth/register": register,
    "POST:/api/auth/login": login,
    "GET:/api/auth/profile": profile,
    
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
    
    # Sprint routes
    "POST:/api/projects/sprints/": create_sprint,  # POST /api/projects/{project_id}/sprints
    "GET:/api/projects/sprints/": get_project_sprints,  # GET /api/projects/{project_id}/sprints
    "GET:/api/sprints/": get_sprint_by_id,  # GET /api/sprints/{sprint_id}
    "PUT:/api/sprints/": update_sprint,  # PUT /api/sprints/{sprint_id}
    "DELETE:/api/sprints/": delete_sprint,  # DELETE /api/sprints/{sprint_id}
    "POST:/api/sprints/start/": start_sprint,  # POST /api/sprints/{sprint_id}/start
    "POST:/api/sprints/complete/": complete_sprint,  # POST /api/sprints/{sprint_id}/complete
    "POST:/api/sprints/tasks/": add_task_to_sprint,  # POST /api/sprints/{sprint_id}/tasks
    "DELETE:/api/sprints/tasks/": remove_task_from_sprint,  # DELETE /api/sprints/{sprint_id}/tasks/{task_id}
}