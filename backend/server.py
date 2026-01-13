import json
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from routes.router import routes
from utils.auth_utils import verify_token
from utils.response import error_response
from init_db import initialize_super_admin
from init_db import initialize_super_admin

class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.handle_request()

    def do_POST(self):
        self.handle_request()
    
    def do_PUT(self):
        self.handle_request()
    
    def do_DELETE(self):
        self.handle_request()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tab-Session-Key")
        self.end_headers()

    def handle_request(self):
        # Read body first for POST/PUT
        body = b""
        if self.command in ["POST", "PUT", "DELETE"]:
            length = int(self.headers.get("Content-Length", 0))
            if length > 0:
                body = self.rfile.read(length)

        # Extract IP address and User-Agent for security tracking
        ip_address = self.client_address[0] if self.client_address else None
        user_agent = self.headers.get("User-Agent", "Unknown")

        # Auth check
        auth_header = self.headers.get("Authorization")
        tab_session_key = self.headers.get("X-Tab-Session-Key")  # 🔐 Extract tab key
        user_id = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
            user_id = verify_token(token, ip_address, user_agent, tab_session_key)

        # Route lookup
        if self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(b"Server running")
            return

        # Parse dynamic routes
        path = self.path
        param1 = None
        param2 = None
        query_params = {}
        
        # Extract query parameters
        if "?" in path:
            path, query_string = path.split("?", 1)
            for param in query_string.split("&"):
                if "=" in param:
                    key_param, value = param.split("=", 1)
                    query_params[key_param] = value
        
        # Handle /api/projects/{id}
        if path.startswith("/api/projects/") and path != "/api/projects/":
            parts = path.split("/")
            if len(parts) == 4 and parts[3]:  # /api/projects/{id}
                param1 = parts[3]
                path = "/api/projects/"
            # Handle /api/projects/{id}/sprints
            elif len(parts) == 5 and parts[4] == "sprints":
                param1 = parts[3]
                path = "/api/projects/sprints/"
            # Handle /api/projects/{id}/backlog
            elif len(parts) == 5 and parts[4] == "backlog":
                param1 = parts[3]
                path = "/api/projects/backlog/"
            # Handle /api/projects/{id}/tasks/done
            elif len(parts) == 6 and parts[4] == "tasks" and parts[5] == "done":
                param1 = parts[3]
                path = "/api/projects/tasks/done/"
            # Handle /api/projects/{id}/members
            elif len(parts) == 5 and parts[4] == "members":
                param1 = parts[3]
                path = "/api/projects/members/"
            # Handle /api/projects/{id}/members/{user_id}
            elif len(parts) == 6 and parts[4] == "members":
                param1 = parts[3]
                param2 = parts[5]
                path = "/api/projects/members/user/"
        
        # Handle /api/sprints/{id}
        elif path.startswith("/api/sprints/"):
            parts = path.split("/")
            if len(parts) == 4 and parts[3]:
                param1 = parts[3]
                path = "/api/sprints/"
            # Handle /api/sprints/{id}/start
            elif len(parts) == 5 and parts[4] == "start":
                param1 = parts[3]
                path = "/api/sprints/start/"
            # Handle /api/sprints/{id}/complete
            elif len(parts) == 5 and parts[4] == "complete":
                param1 = parts[3]
                path = "/api/sprints/complete/"
            # Handle /api/sprints/{id}/tasks
            elif len(parts) == 5 and parts[4] == "tasks":
                param1 = parts[3]
                path = "/api/sprints/tasks/"
            # Handle /api/sprints/{id}/tasks/{task_id}
            elif len(parts) == 6 and parts[4] == "tasks":
                param1 = parts[3]
                param2 = parts[5]
                path = "/api/sprints/tasks/"
        
        # Handle /api/tasks/{id} or /api/tasks/project/{id}
        elif path.startswith("/api/tasks/"):
            parts = path.split("/")
            if len(parts) == 4 and parts[3] and parts[3] != "my":
                if parts[2] == "tasks" and parts[3] == "project":
                    # Will be /api/tasks/project/{project_id}
                    pass
                else:
                    # /api/tasks/{id}
                    param1 = parts[3]
                    path = "/api/tasks/"
            elif len(parts) == 5:
                if parts[3] == "project":
                    # /api/tasks/project/{project_id}
                    param1 = parts[4]
                    path = "/api/tasks/project/"
                else:
                    # /api/tasks/{id}/labels, attachments, links, approve
                    param1 = parts[3]
                    if parts[4] == "labels":
                        path = "/api/tasks/labels/"
                    elif parts[4] == "attachments":
                        path = "/api/tasks/attachments/"
                    elif parts[4] == "links":
                        path = "/api/tasks/links/"
                    elif parts[4] == "approve":
                        path = "/api/tasks/approve/"
            elif len(parts) == 6:
                param1 = parts[3]
                if parts[4] == "labels":
                    # /api/tasks/{id}/labels/{label}
                    param2 = parts[5]
                    path = "/api/tasks/labels/remove/"
        
        key = f"{self.command}:{path}"
        handler = routes.get(key)

        if not handler:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Route Not Found"}).encode("utf-8"))
            return

        # Execute handler
        try:
            body_str = body.decode("utf-8") if body else ""
            
            # Auth routes (pass IP and User-Agent for security)
            if key == "POST:/api/auth/register":
                resp = handler(body_str, ip_address, user_agent)
            elif key == "POST:/api/auth/login":
                resp = handler(body_str, ip_address, user_agent)
            elif key == "POST:/api/auth/logout":
                resp = handler(user_id, body_str) if user_id else error_response("Unauthorized", 401)
            elif key == "POST:/api/auth/logout-all":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "GET:/api/auth/sessions":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            
            # Route handlers
            elif "profile" in key or key == "GET:/api/tasks/my":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            
            # User routes
            elif key == "GET:/api/users/search":
                email_query = query_params.get("email", "")
                resp = handler(email_query) if user_id else error_response("Unauthorized", 401)
            elif key == "GET:/api/users":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "PUT:/api/users/role":
                resp = handler(user_id, body_str) if user_id else error_response("Unauthorized", 401)
            
            # Project routes
            elif key == "POST:/api/projects":
                resp = handler(body_str, user_id)
            elif key == "GET:/api/projects":
                resp = handler(user_id)
            elif key == "GET:/api/projects/" and param1:
                resp = handler(param1, user_id)
            elif key == "PUT:/api/projects/" and param1:
                resp = handler(body_str, param1, user_id)
            elif key == "DELETE:/api/projects/" and param1:
                resp = handler(param1, user_id)
            
            # Project Members routes
            elif key == "POST:/api/projects/members/" and param1:
                resp = handler(body_str, param1, user_id)
            elif key == "GET:/api/projects/members/" and param1:
                resp = handler(param1, user_id)
            elif key == "DELETE:/api/projects/members/user/" and param1 and param2:
                resp = handler(param1, param2, user_id)
            
            # Task routes
            elif key == "POST:/api/tasks":
                resp = handler(body_str, user_id)
            elif key == "GET:/api/tasks/project/" and param1:
                resp = handler(param1, user_id)
            elif key == "GET:/api/tasks/" and param1:
                resp = handler(param1, user_id)
            elif key == "PUT:/api/tasks/" and param1:
                resp = handler(body_str, param1, user_id)
            elif key == "DELETE:/api/tasks/" and param1:
                resp = handler(param1, user_id)
            
            # Task label routes
            elif key == "POST:/api/tasks/labels/" and param1:
                resp = handler(param1, body_str, user_id)
            elif key == "DELETE:/api/tasks/labels/remove/" and param1 and param2:
                resp = handler(param1, param2, user_id)
            elif key == "GET:/api/tasks/labels/" and param1:
                # param1 is project_id for getting all labels
                resp = handler(param1, user_id)
            
            # Task attachment routes
            elif key == "POST:/api/tasks/attachments/" and param1:
                resp = handler(param1, body_str, user_id)
            elif key == "DELETE:/api/tasks/attachments/" and param1:
                resp = handler(param1, body_str, user_id)
            
            # Task link routes
            elif key == "POST:/api/tasks/links/" and param1:
                resp = handler(param1, body_str, user_id)
            elif key == "DELETE:/api/tasks/links/" and param1:
                resp = handler(param1, body_str, user_id)
            
            # Task approval routes
            elif key == "POST:/api/tasks/approve/" and param1:
                resp = handler(param1, user_id)
            elif key == "GET:/api/projects/tasks/done/" and param1:
                resp = handler(param1, user_id)
            
            # Sprint routes
            elif key == "POST:/api/projects/sprints/" and param1:
                resp = handler(body_str, param1, user_id)
            elif key == "GET:/api/projects/sprints/" and param1:
                resp = handler(param1, user_id)
            elif key == "GET:/api/projects/backlog/" and param1:
                resp = handler(param1, user_id)
            elif key == "GET:/api/sprints/" and param1:
                resp = handler(param1, user_id)
            elif key == "PUT:/api/sprints/" and param1:
                resp = handler(body_str, param1, user_id)
            elif key == "DELETE:/api/sprints/" and param1:
                resp = handler(param1, user_id)
            elif key == "POST:/api/sprints/start/" and param1:
                resp = handler(param1, user_id)
            elif key == "POST:/api/sprints/complete/" and param1:
                resp = handler(param1, user_id)
            elif key == "POST:/api/sprints/tasks/" and param1:
                resp = handler(param1, body_str, user_id)
            elif key == "DELETE:/api/sprints/tasks/" and param1 and param2:
                resp = handler(param1, param2, user_id)
            
            else:
                resp = handler(body_str)
        except Exception as e:
            import traceback
            traceback.print_exc()
            resp = error_response(f"Server error: {str(e)}", 500)

        # Send response
        self.send_response(resp["status"])
        for k, v in resp["headers"]:
            self.send_header(k, v)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(resp["body"].encode("utf-8"))

if __name__ == "__main__":
    # Initialize super-admin account on startup
    print("Initializing database...")
    initialize_super_admin()
    print()
    
    server = ThreadingHTTPServer(("localhost", 8000), Handler)
    print("Server running on http://localhost:8000")
    server.serve_forever()