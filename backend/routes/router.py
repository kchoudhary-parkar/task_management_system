from controllers.auth_controller import register, login, profile

routes = {
    "POST:/api/auth/register": register,
    "POST:/api/auth/login": login,
    "GET:/api/auth/profile": profile,  # will add auth decorator later
}