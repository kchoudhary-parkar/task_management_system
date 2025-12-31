import json

def json_response(data, status=200):
    return {
        "status": status,
        "headers": [("Content-Type", "application/json")],
        "body": json.dumps(data)
    }

def error_response(message, status=400):
    return json_response({"error": message}, status)