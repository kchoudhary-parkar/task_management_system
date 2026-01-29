# import json
# from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
# from routes.router import routes
# from utils.auth_utils import verify_token
# from utils.response import error_response
# from init_db import initialize_super_admin

# class Handler(BaseHTTPRequestHandler):
#     def do_GET(self):
#         self.handle_request()

#     def do_POST(self):
#         self.handle_request()
    
#     def do_PUT(self):
#         self.handle_request()
    
#     def do_DELETE(self):
#         self.handle_request()

#     def do_OPTIONS(self):
#         self.send_response(200)
#         origin = self.headers.get("Origin", "http://localhost:3000")
#         self.send_header("Access-Control-Allow-Origin", origin)
#         self.send_header("Access-Control-Allow-Credentials", "true")
#         self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
#         self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Tab-Session-Key")
#         self.end_headers()

#     def handle_request(self):
#         # Read body first for POST/PUT
#         body = b""
#         if self.command in ["POST", "PUT", "DELETE"]:
#             length = int(self.headers.get("Content-Length", 0))
#             if length > 0:
#                 body = self.rfile.read(length)

#         # Extract IP address and User-Agent for security tracking
#         ip_address = self.client_address[0] if self.client_address else None
#         user_agent = self.headers.get("User-Agent", "Unknown")

#         # Auth check
#         auth_header = self.headers.get("Authorization")
#         tab_session_key = self.headers.get("X-Tab-Session-Key")  # 🔐 Extract tab key
#         user_id = None
#         skip_tab_validation = False  # Will be set to True for refresh-session endpoint
#         if auth_header and auth_header.startswith("Bearer "):
#             token = auth_header[7:]
#             # Check if this is a refresh-session request (skip tab validation for it)
#             if self.path.startswith("/api/auth/refresh-session"):
#                 skip_tab_validation = True
#             user_id = verify_token(token, ip_address, user_agent, tab_session_key, skip_tab_validation)

#         # Route lookup
#         if self.path == "/":
#             self.send_response(200)
#             self.send_header("Content-Type", "text/plain")
#             origin = self.headers.get("Origin", "http://localhost:3000")
#             self.send_header("Access-Control-Allow-Origin", origin)
#             self.send_header("Access-Control-Allow-Credentials", "true")
#             self.end_headers()
#             self.wfile.write(b"Server running")
#             return

#         # Parse dynamic routes
#         path = self.path
#         param1 = None
#         param2 = None
#         query_params = {}
        
#         # Extract query parameters
#         if "?" in path:
#             path, query_string = path.split("?", 1)
#             for param in query_string.split("&"):
#                 if "=" in param:
#                     key_param, value = param.split("=", 1)
#                     query_params[key_param] = value
        
#         # ============================================
#         # TEAM CHAT ROUTES - Parse paths with IDs
#         # ============================================
        
#         # Handle /api/chat/projects/{id}/channels
#         if path.startswith("/api/chat/projects/") and "/channels" in path:
#             parts = path.split("/")
#             if len(parts) == 6 and parts[5] == "channels":
#                 # /api/chat/projects/{project_id}/channels
#                 param1 = parts[4]
#                 path = "/api/chat/projects/channels/"
        
#         # Handle /api/chat/channels/{id}/messages
#         elif path.startswith("/api/chat/channels/") and "/messages" in path:
#             parts = path.split("/")
#             if len(parts) == 6 and parts[5] == "messages":
#                 # /api/chat/channels/{channel_id}/messages
#                 param1 = parts[4]
#                 path = "/api/chat/channels/messages/"
        
#         # Handle /api/chat/channels/{id} (for DELETE)
#         elif path.startswith("/api/chat/channels/") and path != "/api/chat/channels/":
#             parts = path.split("/")
#             if len(parts) == 5 and parts[4]:
#                 # /api/chat/channels/{channel_id}
#                 param1 = parts[4]
#                 path = "/api/chat/channels/"
        
#         # ============================================
#         # PROJECT ROUTES
#         # ============================================
        
#         # Handle /api/projects/{id}
#         elif path.startswith("/api/projects/") and path != "/api/projects/":
#             parts = path.split("/")
#             if len(parts) == 4 and parts[3]:  # /api/projects/{id}
#                 param1 = parts[3]
#                 path = "/api/projects/"
#             # Handle /api/projects/{id}/sprints
#             elif len(parts) == 5 and parts[4] == "sprints":
#                 param1 = parts[3]
#                 path = "/api/projects/sprints/"
            
#             # Handle /api/projects/{id}/backlog
#             elif len(parts) == 5 and parts[4] == "backlog":
#                 param1 = parts[3]
#                 path = "/api/projects/backlog/"
#             # Handle /api/projects/{id}/available-tasks
#             elif len(parts) == 5 and parts[4] == "available-tasks":
#                 param1 = parts[3]
#                 path = "/api/projects/available-tasks/"
#             # Handle /api/projects/{id}/tasks/done
#             elif len(parts) == 6 and parts[4] == "tasks" and parts[5] == "done":
#                 param1 = parts[3]
#                 path = "/api/projects/tasks/done/"
#             # Handle /api/projects/{id}/members
#             elif len(parts) == 5 and parts[4] == "members":
#                 param1 = parts[3]
#                 path = "/api/projects/members/"
#             # Handle /api/projects/{id}/members/{user_id}
#             elif len(parts) == 6 and parts[4] == "members":
#                 param1 = parts[3]
#                 param2 = parts[5]
#                 path = "/api/projects/members/user/"
        
#         # ============================================
#         # SPRINT ROUTES
#         # ============================================
        
#         # Handle /api/sprints/{id}
#         elif path.startswith("/api/sprints/"):
#             parts = path.split("/")
#             if len(parts) == 4 and parts[3]:
#                 param1 = parts[3]
#                 path = "/api/sprints/"
#             # Handle /api/sprints/{id}/start
#             elif len(parts) == 5 and parts[4] == "start":
#                 param1 = parts[3]
#                 path = "/api/sprints/start/"
#             # Handle /api/sprints/{id}/complete
#             elif len(parts) == 5 and parts[4] == "complete":
#                 param1 = parts[3]
#                 path = "/api/sprints/complete/"
#             # Handle /api/sprints/{id}/tasks
#             elif len(parts) == 5 and parts[4] == "tasks":
#                 param1 = parts[3]
#                 path = "/api/sprints/tasks/"
#             # Handle /api/sprints/{id}/tasks/{task_id}
#             elif len(parts) == 6 and parts[4] == "tasks":
#                 param1 = parts[3]
#                 param2 = parts[5]
#                 path = "/api/sprints/tasks/"
        
#         # ============================================
#         # TASK ROUTES
#         # ============================================
        
#         # Handle /api/tasks/{id} or /api/tasks/project/{id}
#         elif path.startswith("/api/tasks/"):
#             parts = path.split("/")
    
#             if len(parts) == 4 and parts[3] and parts[3] not in ["my", "pending-approval", "closed"]:
#                 if parts[2] == "tasks" and parts[3] == "project":
#                     # /api/tasks/project/{project_id} → handled later
#                     pass
#                 else:
#                     # /api/tasks/{id} → single task GET/PUT/DELETE
#                     param1 = parts[3]
#                     path = "/api/tasks/"
    
#             elif len(parts) == 5:
#                 if parts[3] == "project":
#                     # /api/tasks/project/{project_id}
#                     param1 = parts[4]
#                     path = "/api/tasks/project/"
#                 elif parts[3] == "git-activity":
#                     # /api/tasks/git-activity/{task_id} (DEPRECATED - old format)
#                     param1 = parts[4]
#                     path = "/api/tasks/git-activity/"
#                 elif parts[4] == "git-activity":
#                     # /api/tasks/{task_id}/git-activity (NEW format)
#                     param1 = parts[3]  # task_id
#                     path = "/api/tasks/git-activity/"
#                 else:
#                     # /api/tasks/{task_id}/SUBPATH (labels, attachments, links, approve, comments)
#                     param1 = parts[3]  # task_id
#                     subpath = parts[4]
            
#                     if subpath == "labels":
#                         path = "/api/tasks/labels/"
#                     elif subpath == "attachments":
#                         path = "/api/tasks/attachments/"
#                     elif subpath == "links":
#                         path = "/api/tasks/links/"
#                     elif subpath == "approve":
#                         path = "/api/tasks/approve/"
#                     elif subpath == "comments":
#                         path = "/api/tasks/comments/"
#                     else:
#                         # Unknown sub-path → will 404
#                         pass
    
#             elif len(parts) == 6:
#                 param1 = parts[3]
#                 if parts[4] == "labels":
#                     # /api/tasks/{id}/labels/{label}
#                     param2 = parts[5]
#                     path = "/api/tasks/labels/remove/"
        
#         # ============================================
#         # ROUTE LOOKUP AND EXECUTION
#         # ============================================
        
#         key = f"{self.command}:{path}"
#         handler = routes.get(key)

#         if not handler:
#             self.send_response(404)
#             self.send_header("Content-Type", "application/json")
#             origin = self.headers.get("Origin", "http://localhost:3000")
#             self.send_header("Access-Control-Allow-Origin", origin)
#             self.send_header("Access-Control-Allow-Credentials", "true")
#             self.end_headers()
#             self.wfile.write(json.dumps({"error": "Route Not Found"}).encode("utf-8"))
#             return

#         # Execute handler
#         try:
#             body_str = body.decode("utf-8") if body else ""
            
#             # ============================================
#             # AUTH ROUTES
#             # ============================================
#             if key == "POST:/api/auth/register":
#                 resp = handler(body_str, ip_address, user_agent)
#             elif key == "POST:/api/auth/login":
#                 resp = handler(body_str, ip_address, user_agent)
#             elif key == "POST:/api/auth/clerk-sync":
#                 resp = handler(body_str, ip_address, user_agent)
#             elif key == "GET:/api/auth/profile":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "POST:/api/auth/logout":
#                 resp = handler(user_id, body_str) if user_id else error_response("Unauthorized", 401)
#             elif key == "POST:/api/auth/logout-all":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "POST:/api/auth/refresh-session":
#                 resp = handler(user_id, ip_address, user_agent) if user_id else error_response("Unauthorized", 401)
#             elif key == "GET:/api/auth/sessions":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            
#             # ============================================
#             # DASHBOARD ROUTES
#             # ============================================
#             elif key == "GET:/api/dashboard/analytics":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "GET:/api/dashboard/report":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "GET:/api/dashboard/system":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            
#             # ============================================
#             # PROFILE ROUTES
#             # ============================================
#             elif key == "GET:/api/profile":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
#             elif key in ["PUT:/api/profile/personal", "PUT:/api/profile/education", "PUT:/api/profile/certificates", "PUT:/api/profile/organization"]:
#                 resp = handler(body_str, user_id) if user_id else error_response("Unauthorized", 401)
            
#             # ============================================
#             # USER ROUTES
#             # ============================================
#             elif key == "GET:/api/users/search":
#                 email_query = query_params.get("email", "")
#                 resp = handler(email_query) if user_id else error_response("Unauthorized", 401)
#             elif key == "GET:/api/users":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "PUT:/api/users/role":
#                 resp = handler(user_id, body_str) if user_id else error_response("Unauthorized", 401)
            
#             # ============================================
#             # PROJECT ROUTES
#             # ============================================
#             elif key == "POST:/api/projects":
#                 resp = handler(body_str, user_id)
#             elif key == "GET:/api/projects":
#                 resp = handler(user_id)
#             elif key == "GET:/api/projects/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "PUT:/api/projects/" and param1:
#                 resp = handler(body_str, param1, user_id)
#             elif key == "DELETE:/api/projects/" and param1:
#                 resp = handler(param1, user_id)
            
#             # ============================================
#             # PROJECT MEMBERS ROUTES
#             # ============================================
#             elif key == "POST:/api/projects/members/" and param1:
#                 resp = handler(body_str, param1, user_id)
#             elif key == "GET:/api/projects/members/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "DELETE:/api/projects/members/user/" and param1 and param2:
#                 resp = handler(param1, param2, user_id)
            
#             # ============================================
#             # TASK ROUTES
#             # ============================================
#             elif key == "POST:/api/tasks":
#                 resp = handler(body_str, user_id)
#             elif key == "GET:/api/tasks/my" or key == "GET:/api/tasks/pending-approval" or key == "GET:/api/tasks/closed":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "GET:/api/tasks/project/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "GET:/api/tasks/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "PUT:/api/tasks/" and param1:
#                 resp = handler(body_str, param1, user_id)
#             elif key == "DELETE:/api/tasks/" and param1:
#                 resp = handler(param1, user_id)
            
#             # ============================================
#             # TASK LABEL ROUTES
#             # ============================================
#             elif key == "POST:/api/tasks/labels/" and param1:
#                 resp = handler(param1, body_str, user_id)
#             elif key == "DELETE:/api/tasks/labels/remove/" and param1 and param2:
#                 resp = handler(param1, param2, user_id)
#             elif key == "GET:/api/tasks/labels/" and param1:
#                 # param1 is project_id for getting all labels
#                 resp = handler(param1, user_id)
            
#             # ============================================
#             # TASK ATTACHMENT ROUTES
#             # ============================================
#             elif key == "POST:/api/tasks/attachments/" and param1:
#                 resp = handler(param1, body_str, user_id)
#             elif key == "DELETE:/api/tasks/attachments/" and param1:
#                 resp = handler(param1, body_str, user_id)
            
#             # ============================================
#             # TASK COMMENT ROUTES
#             # ============================================
#             elif key == "POST:/api/tasks/comments/":
#                 # param1 = task_id (from URL), body_str already read, user_id from auth
#                 if param1 and body_str and user_id:
#                     resp = handler(param1, body_str, user_id)
#                 else:
#                     resp = error_response("Missing required parameters for comment", 400)
            
#             # ============================================
#             # TASK LINK ROUTES
#             # ============================================
#             elif key == "POST:/api/tasks/links/" and param1:
#                 resp = handler(param1, body_str, user_id)
#             elif key == "DELETE:/api/tasks/links/" and param1:
#                 resp = handler(param1, body_str, user_id)
            
#             # ============================================
#             # TASK APPROVAL ROUTES
#             # ============================================
#             elif key == "POST:/api/tasks/approve/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "GET:/api/projects/tasks/done/" and param1:
#                 resp = handler(param1, user_id)
            
#             # ============================================
#             # GIT ACTIVITY ROUTE
#             # ============================================
#             elif key == "GET:/api/tasks/git-activity/" and param1:
#                 resp = handler(param1, user_id)
            
#             # ============================================
#             # AI CHAT ROUTES (Chatbot)
#             # ============================================
#             elif key == "POST:/api/chat/ask":
#                 resp = handler(body_str, user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "GET:/api/chat/suggestions":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            
#             # ============================================
#             # TEAM CHAT ROUTES (Real-time messaging)
#             # ============================================
#             elif key == "GET:/api/chat/projects":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "GET:/api/chat/projects/channels/" and param1:
#                 resp = handler(param1, user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "GET:/api/chat/channels/messages/" and param1:
#                 resp = handler(param1, user_id, query_params) if user_id else error_response("Unauthorized", 401)
#             elif key == "POST:/api/chat/channels/messages/" and param1:
#                 resp = handler(body_str, param1, user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "POST:/api/chat/projects/channels/" and param1:
#                 resp = handler(body_str, param1, user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "DELETE:/api/chat/channels/" and param1:
#                 resp = handler(param1, user_id) if user_id else error_response("Unauthorized", 401)
#             elif key == "GET:/api/chat/stats":
#                 resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            
#             # ============================================
#             # SPRINT ROUTES
#             # ============================================
#             elif key == "POST:/api/projects/sprints/" and param1:
#                 resp = handler(body_str, param1, user_id)
#             elif key == "GET:/api/projects/sprints/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "GET:/api/projects/backlog/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "GET:/api/projects/available-tasks/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "GET:/api/sprints/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "PUT:/api/sprints/" and param1:
#                 resp = handler(body_str, param1, user_id)
#             elif key == "DELETE:/api/sprints/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "POST:/api/sprints/start/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "POST:/api/sprints/complete/" and param1:
#                 resp = handler(param1, user_id)
#             elif key == "POST:/api/sprints/tasks/" and param1:
#                 resp = handler(param1, body_str, user_id)
#             elif key == "DELETE:/api/sprints/tasks/" and param1 and param2:
#                 resp = handler(param1, param2, user_id)
            
#             # ============================================
#             # DEFAULT HANDLER
#             # ============================================
#             else:
#                 resp = handler(body_str)
                
#         except Exception as e:
#             import traceback
#             traceback.print_exc()
#             resp = error_response(f"Server error: {str(e)}", 500)

#         # Send response
#         self.send_response(resp["status"])
#         for k, v in resp["headers"]:
#             self.send_header(k, v)
#         origin = self.headers.get("Origin", "http://localhost:3000")
#         self.send_header("Access-Control-Allow-Origin", origin)
#         self.send_header("Access-Control-Allow-Credentials", "true")
#         self.end_headers()
#         self.wfile.write(resp["body"].encode("utf-8"))

# if __name__ == "__main__":
#     # Initialize super-admin account on startup
#     print("=" * 60)
#     print("DOIT Task Management System - Server")
#     print("=" * 60)
#     print("\nInitializing database...")
#     initialize_super_admin()
#     print("✓ Database initialized")
#     print()
    
#     server = ThreadingHTTPServer(("localhost", 8000), Handler)
#     print("=" * 60)
#     print("Server Status: RUNNING")
#     print("=" * 60)
#     print("Address: http://localhost:8000")
#     print("\nAvailable Routes:")
#     print("  - Auth: /api/auth/*")
#     print("  - Projects: /api/projects/*")
#     print("  - Tasks: /api/tasks/*")
#     print("  - Sprints: /api/sprints/*")
#     print("  - Dashboard: /api/dashboard/*")
#     print("  - AI Chat: /api/chat/ask, /api/chat/suggestions")
#     print("  - Team Chat: /api/chat/projects/*, /api/chat/channels/*")
#     print("  - Profile: /api/profile/*")
#     print("  - Users: /api/users/*")
#     print("  - Git Integration: /api/tasks/git-activity/*")
#     print("\nPress CTRL+C to stop the server")
#     print("=" * 60)
#     print()
    
#     try:
#         server.serve_forever()
#     except KeyboardInterrupt:
#         print("\n\n" + "=" * 60)
#         print("Server shutting down gracefully...")
#         print("=" * 60)
#         server.shutdown()
import json
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from routes.router import routes
from utils.auth_utils import verify_token
from utils.response import error_response
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
        origin = self.headers.get("Origin", "http://localhost:3000")
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Credentials", "true")
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
        skip_tab_validation = False  # Will be set to True for refresh-session endpoint
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
            # Check if this is a refresh-session request (skip tab validation for it)
            if self.path.startswith("/api/auth/refresh-session"):
                skip_tab_validation = True
            user_id = verify_token(token, ip_address, user_agent, tab_session_key, skip_tab_validation)

        # Route lookup
        if self.path == "/":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            origin = self.headers.get("Origin", "http://localhost:3000")
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Credentials", "true")
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
        
        # ============================================
        # TEAM CHAT ROUTES - Parse paths with IDs (Enhanced)
        # ============================================
        
        # Enhanced: /api/chat/channels/{channel_id}/messages/{message_id}/reactions
        if path.startswith("/api/chat/channels/") and "/messages/" in path and "/reactions" in path:
            parts = path.split("/")
            if len(parts) == 8 and parts[7] == "reactions":
                param1 = parts[4]  # channel_id
                param2 = parts[6]  # message_id
                path = "/api/chat/channels/messages/reactions/"
        
        # Enhanced: /api/chat/channels/{channel_id}/messages/{message_id}/replies
        elif path.startswith("/api/chat/channels/") and "/messages/" in path and "/replies" in path:
            parts = path.split("/")
            if len(parts) == 8 and parts[7] == "replies":
                param1 = parts[4]  # channel_id
                param2 = parts[6]  # message_id
                path = "/api/chat/channels/messages/replies/"
        
        # Enhanced: /api/chat/channels/{channel_id}/messages/{message_id} (for PUT/DELETE specific message)
        elif path.startswith("/api/chat/channels/") and "/messages/" in path and path.count('/') == 6:
            parts = path.split("/")
            if len(parts) == 7 and parts[6]:
                param1 = parts[4]  # channel_id
                param2 = parts[6]  # message_id
                path = "/api/chat/channels/messages/message/"
        
        # Handle /api/chat/projects/{id}/channels
        elif path.startswith("/api/chat/projects/") and "/channels" in path:
            parts = path.split("/")
            if len(parts) == 6 and parts[5] == "channels":
                # /api/chat/projects/{project_id}/channels
                param1 = parts[4]
                path = "/api/chat/projects/channels/"
        
        # Handle /api/chat/channels/{id}/messages (GET/POST messages in channel)
        elif path.startswith("/api/chat/channels/") and "/messages" in path:
            parts = path.split("/")
            if len(parts) == 6 and parts[5] == "messages":
                # /api/chat/channels/{channel_id}/messages
                param1 = parts[4]
                path = "/api/chat/channels/messages/"
        
        # Handle /api/chat/channels/{id} (for DELETE channel)
        elif path.startswith("/api/chat/channels/") and path != "/api/chat/channels/":
            parts = path.split("/")
            if len(parts) == 5 and parts[4]:
                # /api/chat/channels/{channel_id}
                param1 = parts[4]
                path = "/api/chat/channels/"
        
        # ============================================
        # PROJECT ROUTES
        # ============================================
        
        # Handle /api/projects/{id}
        elif path.startswith("/api/projects/") and path != "/api/projects/":
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
            # Handle /api/projects/{id}/available-tasks
            elif len(parts) == 5 and parts[4] == "available-tasks":
                param1 = parts[3]
                path = "/api/projects/available-tasks/"
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
        
        # ============================================
        # SPRINT ROUTES
        # ============================================
        
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
        
        # ============================================
        # TASK ROUTES
        # ============================================
        
        # Handle /api/tasks/{id} or /api/tasks/project/{id}
        elif path.startswith("/api/tasks/"):
            parts = path.split("/")
    
            if len(parts) == 4 and parts[3] and parts[3] not in ["my", "pending-approval", "closed"]:
                if parts[2] == "tasks" and parts[3] == "project":
                    # /api/tasks/project/{project_id} → handled later
                    pass
                else:
                    # /api/tasks/{id} → single task GET/PUT/DELETE
                    param1 = parts[3]
                    path = "/api/tasks/"
    
            elif len(parts) == 5:
                if parts[3] == "project":
                    # /api/tasks/project/{project_id}
                    param1 = parts[4]
                    path = "/api/tasks/project/"
                elif parts[3] == "git-activity":
                    # /api/tasks/git-activity/{task_id} (DEPRECATED - old format)
                    param1 = parts[4]
                    path = "/api/tasks/git-activity/"
                elif parts[4] == "git-activity":
                    # /api/tasks/{task_id}/git-activity (NEW format)
                    param1 = parts[3]  # task_id
                    path = "/api/tasks/git-activity/"
                else:
                    # /api/tasks/{task_id}/SUBPATH (labels, attachments, links, approve, comments)
                    param1 = parts[3]  # task_id
                    subpath = parts[4]
            
                    if subpath == "labels":
                        path = "/api/tasks/labels/"
                    elif subpath == "attachments":
                        path = "/api/tasks/attachments/"
                    elif subpath == "links":
                        path = "/api/tasks/links/"
                    elif subpath == "approve":
                        path = "/api/tasks/approve/"
                    elif subpath == "comments":
                        path = "/api/tasks/comments/"
                    else:
                        # Unknown sub-path → will 404
                        pass
    
            elif len(parts) == 6:
                param1 = parts[3]
                if parts[4] == "labels":
                    # /api/tasks/{id}/labels/{label}
                    param2 = parts[5]
                    path = "/api/tasks/labels/remove/"
        
        # ============================================
        # ROUTE LOOKUP AND EXECUTION
        # ============================================
        
        key = f"{self.command}:{path}"
        handler = routes.get(key)

        if not handler:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            origin = self.headers.get("Origin", "http://localhost:3000")
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Access-Control-Allow-Credentials", "true")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Route Not Found"}).encode("utf-8"))
            return

        # Execute handler
        try:
            # Check if this is a file upload (multipart/form-data)
            content_type = self.headers.get("Content-Type", "")
            is_file_upload = content_type.startswith("multipart/form-data")
            
            # Only decode as UTF-8 if it's not a file upload
            if is_file_upload:
                body_str = None  # Keep binary data for file uploads
            else:
                body_str = body.decode("utf-8") if body else ""
            
            # ============================================
            # AUTH ROUTES
            # ============================================
            if key == "POST:/api/auth/register":
                resp = handler(body_str, ip_address, user_agent)
            elif key == "POST:/api/auth/login":
                resp = handler(body_str, ip_address, user_agent)
            elif key == "POST:/api/auth/clerk-sync":
                resp = handler(body_str, ip_address, user_agent)
            elif key == "GET:/api/auth/profile":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "POST:/api/auth/logout":
                resp = handler(user_id, body_str) if user_id else error_response("Unauthorized", 401)
            elif key == "POST:/api/auth/logout-all":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "POST:/api/auth/refresh-session":
                resp = handler(user_id, ip_address, user_agent) if user_id else error_response("Unauthorized", 401)
            elif key == "GET:/api/auth/sessions":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            
            # ============================================
            # DASHBOARD ROUTES
            # ============================================
            elif key == "GET:/api/dashboard/analytics":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "GET:/api/dashboard/report":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "GET:/api/dashboard/system":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            
            # ============================================
            # PROFILE ROUTES
            # ============================================
            elif key == "GET:/api/profile":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            elif key in ["PUT:/api/profile/personal", "PUT:/api/profile/education", "PUT:/api/profile/certificates", "PUT:/api/profile/organization"]:
                resp = handler(body_str, user_id) if user_id else error_response("Unauthorized", 401)
            
            # ============================================
            # USER ROUTES
            # ============================================
            elif key == "GET:/api/users/search":
                email_query = query_params.get("email", "")
                resp = handler(email_query) if user_id else error_response("Unauthorized", 401)
            elif key == "GET:/api/users":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "PUT:/api/users/role":
                resp = handler(user_id, body_str) if user_id else error_response("Unauthorized", 401)
            
            # ============================================
            # PROJECT ROUTES
            # ============================================
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
            
            # ============================================
            # PROJECT MEMBERS ROUTES
            # ============================================
            elif key == "POST:/api/projects/members/" and param1:
                resp = handler(body_str, param1, user_id)
            elif key == "GET:/api/projects/members/" and param1:
                resp = handler(param1, user_id)
            elif key == "DELETE:/api/projects/members/user/" and param1 and param2:
                resp = handler(param1, param2, user_id)
            
            # ============================================
            # TASK ROUTES
            # ============================================
            elif key == "POST:/api/tasks":
                resp = handler(body_str, user_id)
            elif key == "GET:/api/tasks/my" or key == "GET:/api/tasks/pending-approval" or key == "GET:/api/tasks/closed":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "GET:/api/tasks/project/" and param1:
                resp = handler(param1, user_id)
            elif key == "GET:/api/tasks/" and param1:
                resp = handler(param1, user_id)
            elif key == "PUT:/api/tasks/" and param1:
                resp = handler(body_str, param1, user_id)
            elif key == "DELETE:/api/tasks/" and param1:
                resp = handler(param1, user_id)
            
            # ============================================
            # TASK LABEL ROUTES
            # ============================================
            elif key == "POST:/api/tasks/labels/" and param1:
                resp = handler(param1, body_str, user_id)
            elif key == "DELETE:/api/tasks/labels/remove/" and param1 and param2:
                resp = handler(param1, param2, user_id)
            elif key == "GET:/api/tasks/labels/" and param1:
                # param1 is project_id for getting all labels
                resp = handler(param1, user_id)
            
            # ============================================
            # TASK ATTACHMENT ROUTES
            # ============================================
            elif key == "POST:/api/tasks/attachments/" and param1:
                resp = handler(param1, body_str, user_id)
            elif key == "DELETE:/api/tasks/attachments/" and param1:
                resp = handler(param1, body_str, user_id)
            
            # ============================================
            # TASK COMMENT ROUTES
            # ============================================
            elif key == "POST:/api/tasks/comments/":
                # param1 = task_id (from URL), body_str already read, user_id from auth
                if param1 and body_str and user_id:
                    resp = handler(param1, body_str, user_id)
                else:
                    resp = error_response("Missing required parameters for comment", 400)
            
            # ============================================
            # TASK LINK ROUTES
            # ============================================
            elif key == "POST:/api/tasks/links/" and param1:
                resp = handler(param1, body_str, user_id)
            elif key == "DELETE:/api/tasks/links/" and param1:
                resp = handler(param1, body_str, user_id)
            
            # ============================================
            # TASK APPROVAL ROUTES
            # ============================================
            elif key == "POST:/api/tasks/approve/" and param1:
                resp = handler(param1, user_id)
            elif key == "GET:/api/projects/tasks/done/" and param1:
                resp = handler(param1, user_id)
            
            # ============================================
            # GIT ACTIVITY ROUTE
            # ============================================
            elif key == "GET:/api/tasks/git-activity/" and param1:
                resp = handler(param1, user_id)
            
            # ============================================
            # AI CHAT ROUTES (Chatbot)
            # ============================================
            elif key == "POST:/api/chat/ask":
                resp = handler(body_str, user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "GET:/api/chat/suggestions":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            
            # ============================================
            # TEAM CHAT ROUTES (Real-time messaging - Enhanced)
            # ============================================
            elif key == "GET:/api/chat/projects":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "GET:/api/chat/projects/channels/" and param1:
                resp = handler(param1, user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "GET:/api/chat/channels/messages/" and param1:
                resp = handler(param1, user_id, query_params) if user_id else error_response("Unauthorized", 401)
            elif key == "POST:/api/chat/channels/messages/" and param1:
                resp = handler(body_str, param1, user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "POST:/api/chat/projects/channels/" and param1:
                resp = handler(body_str, param1, user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "DELETE:/api/chat/channels/" and param1:
                resp = handler(param1, user_id) if user_id else error_response("Unauthorized", 401)
            elif key == "GET:/api/chat/stats":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            
            # ============================================
            # ENHANCED CHAT ROUTES - Message Operations
            # ============================================
            # Edit message: PUT /api/chat/channels/{channel_id}/messages/{message_id}
            elif key == "PUT:/api/chat/channels/messages/message/" and param1 and param2:
                resp = handler(param1, param2, body_str, user_id) if user_id else error_response("Unauthorized", 401)
            # Delete message: DELETE /api/chat/channels/{channel_id}/messages/{message_id}
            elif key == "DELETE:/api/chat/channels/messages/message/" and param1 and param2:
                resp = handler(param1, param2, user_id) if user_id else error_response("Unauthorized", 401)
            
            # ============================================
            # ENHANCED CHAT ROUTES - Reactions
            # ============================================
            # Add/Remove reaction: POST /api/chat/channels/{channel_id}/messages/{message_id}/reactions
            elif key == "POST:/api/chat/channels/messages/reactions/" and param1 and param2:
                resp = handler(param1, param2, body_str, user_id) if user_id else error_response("Unauthorized", 401)
            
            # ============================================
            # ENHANCED CHAT ROUTES - Thread Replies
            # ============================================
            # Get thread replies: GET /api/chat/channels/{channel_id}/messages/{message_id}/replies
            elif key == "GET:/api/chat/channels/messages/replies/" and param1 and param2:
                resp = handler(param1, param2, user_id, query_params) if user_id else error_response("Unauthorized", 401)
            # Post thread reply: POST /api/chat/channels/{channel_id}/messages/{message_id}/replies
            elif key == "POST:/api/chat/channels/messages/replies/" and param1 and param2:
                resp = handler(param1, param2, body_str, user_id) if user_id else error_response("Unauthorized", 401)
            
            # ============================================
            # ENHANCED CHAT ROUTES - File Upload
            # ============================================
            # Upload attachment: POST /api/chat/upload
            elif key == "POST:/api/chat/upload":
                if user_id:
                    # For file uploads, pass the raw binary body and headers
                    resp = handler(body, self.headers, user_id)
                else:
                    resp = error_response("Unauthorized", 401)
            
            # ============================================
            # ENHANCED CHAT ROUTES - Mentions & Search
            # ============================================
            # Get user mentions: GET /api/chat/mentions
            elif key == "GET:/api/chat/mentions":
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            # Search messages: GET /api/chat/search/{channel_id}
            elif key == "GET:/api/chat/search/" and param1:
                resp = handler(param1, user_id, query_params) if user_id else error_response("Unauthorized", 401)
            
            # ============================================
            # SPRINT ROUTES
            # ============================================
            elif key == "POST:/api/projects/sprints/" and param1:
                resp = handler(body_str, param1, user_id)
            elif key == "GET:/api/projects/sprints/" and param1:
                resp = handler(param1, user_id)
            elif key == "GET:/api/projects/backlog/" and param1:
                resp = handler(param1, user_id)
            elif key == "GET:/api/projects/available-tasks/" and param1:
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
            
            # ============================================
            # DEFAULT HANDLER
            # ============================================
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
        origin = self.headers.get("Origin", "http://localhost:3000")
        self.send_header("Access-Control-Allow-Origin", origin)
        self.send_header("Access-Control-Allow-Credentials", "true")
        self.end_headers()
        self.wfile.write(resp["body"].encode("utf-8"))

if __name__ == "__main__":
    # Initialize super-admin account on startup
    print("=" * 60)
    print("DOIT Task Management System - Server")
    print("=" * 60)
    print("\nInitializing database...")
    initialize_super_admin()
    print("✓ Database initialized")
    print()
    
    server = ThreadingHTTPServer(("localhost", 8000), Handler)
    print("=" * 60)
    print("Server Status: RUNNING")
    print("=" * 60)
    print("Address: http://localhost:8000")
    print("\nAvailable Routes:")
    print("  - Auth: /api/auth/*")
    print("  - Projects: /api/projects/*")
    print("  - Tasks: /api/tasks/*")
    print("  - Sprints: /api/sprints/*")
    print("  - Dashboard: /api/dashboard/*")
    print("  - AI Chat: /api/chat/ask, /api/chat/suggestions")
    print("  - Team Chat: /api/chat/projects/*, /api/chat/channels/*")
    print("  - Enhanced Chat: Message reactions, editing, deletion, threads")
    print("  - Profile: /api/profile/*")
    print("  - Users: /api/users/*")
    print("  - Git Integration: /api/tasks/git-activity/*")
    print("\nPress CTRL+C to stop the server")
    print("=" * 60)
    print()
    
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n\n" + "=" * 60)
        print("Server shutting down gracefully...")
        print("=" * 60)
        server.shutdown()