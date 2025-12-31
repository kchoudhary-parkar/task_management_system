import json
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from routes.router import routes
from utils.auth_utils import verify_token
from utils.response import error_response

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
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def handle_request(self):
        # Read body first for POST/PUT
        body = b""
        if self.command in ["POST", "PUT", "DELETE"]:
            length = int(self.headers.get("Content-Length", 0))
            if length > 0:
                body = self.rfile.read(length)

        # Auth check
        auth_header = self.headers.get("Authorization")
        user_id = None
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
            user_id = verify_token(token)

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
        
        # Handle /api/projects/{id}
        if path.startswith("/api/projects/") and path != "/api/projects/":
            parts = path.split("/")
            if len(parts) == 4 and parts[3]:  # /api/projects/{id}
                param1 = parts[3]
                path = "/api/projects/"
            # Handle /api/projects/{id}/members
            elif len(parts) == 5 and parts[4] == "members":
                param1 = parts[3]
                path = "/api/projects/members/"
            # Handle /api/projects/{id}/members/{user_id}
            elif len(parts) == 6 and parts[4] == "members":
                param1 = parts[3]
                param2 = parts[5]
                path = "/api/projects/members/user/"
        
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
            elif len(parts) == 5 and parts[3] == "project":
                # /api/tasks/project/{project_id}
                param1 = parts[4]
                path = "/api/tasks/project/"
        
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
            
            # Route handlers
            if "profile" in key or key == "GET:/api/tasks/my":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            
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
    server = ThreadingHTTPServer(("localhost", 8000), Handler)
    print("Server running on http://localhost:8000")
    server.serve_forever()