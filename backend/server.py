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

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def handle_request(self):
        # Read body first for POST/PUT
        body = b""
        if self.command in ["POST", "PUT"]:
            length = int(self.headers.get("Content-Length", 0))
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

        key = f"{self.command}:{self.path}"
        handler = routes.get(key)

        if not handler:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Not Found"}).encode("utf-8"))
            return

        # Execute handler
        try:
            body_str = body.decode("utf-8") if body else ""
            if "profile" in key:
                resp = handler(user_id) if user_id else error_response("Unauthorized", 401)
            else:
                resp = handler(body_str)
        except Exception as e:
            resp = error_response(f"Server error: {str(e)}", 500)

        # NOW send response and headers in correct order
        self.send_response(resp["status"])
        for k, v in resp["headers"]:
            self.send_header(k, v)
        self.send_header("Access-Control-Allow-Origin", "*")  # Ensure CORS on all responses
        self.end_headers()
        self.wfile.write(resp["body"].encode("utf-8"))

if __name__ == "__main__":
    server = ThreadingHTTPServer(("localhost", 8000), Handler)
    print("Server running on http://localhost:8000")
    server.serve_forever()