from controllers.auth_controller import register, login, profile
from controllers.project_controller import (
    create_project, 
    get_user_projects, 
    get_project_by_id, 
    update_project, 
    delete_project
)

routes = {
    # Auth routes
    "POST:/api/auth/register": register,
    "POST:/api/auth/login": login,
    "GET:/api/auth/profile": profile,
    
    # Project routes
    "POST:/api/projects": create_project,
    "GET:/api/projects": get_user_projects,
    "GET:/api/projects/": get_project_by_id,  # Will handle dynamic ID
    "PUT:/api/projects/": update_project,  # Will handle dynamic ID
    "DELETE:/api/projects/": delete_project,  # Will handle dynamic ID
}