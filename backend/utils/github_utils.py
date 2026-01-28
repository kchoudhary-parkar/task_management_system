import requests
import os
import re
from datetime import datetime, timezone
from cryptography.fernet import Fernet

# GitHub API base URL
GITHUB_API_BASE = "https://api.github.com"

def get_encryption_key():
    """Get or create encryption key for storing tokens"""
    # In production, store this securely (not in code)
    return os.getenv("ENCRYPTION_KEY", Fernet.generate_key())

def encrypt_token(token):
    """Encrypt GitHub token before storing"""
    try:
        f = Fernet(get_encryption_key())
        return f.encrypt(token.encode()).decode()
    except:
        return token  # Fallback to plaintext if encryption fails

def decrypt_token(encrypted_token):
    """Decrypt GitHub token"""
    try:
        f = Fernet(get_encryption_key())
        return f.decrypt(encrypted_token.encode()).decode()
    except:
        return encrypted_token  # Return as-is if decryption fails

def parse_repo_url(repo_url):
    """
    Parse GitHub repo URL to extract owner and repo name
    Examples:
        https://github.com/company/cdw-backend
        git@github.com:company/cdw-backend.git
    Returns: (owner, repo_name)
    """
    # Clean URL
    repo_url = repo_url.strip().rstrip('/')
    
    # HTTPS format
    match = re.search(r'github\.com[/:]([^/]+)/([^/\.]+)', repo_url)
    if match:
        owner, repo = match.groups()
        return owner, repo
    
    raise ValueError("Invalid GitHub repository URL")

def extract_ticket_id(text):
    """
    Extract ticket ID from branch name or commit message
    Examples:
        feature/CC-16-login → CC-16
        CC-16: Add authentication → CC-16
        bugfix/TASK-123-fix-bug → TASK-123
    """
    if not text:
        return None
    
    # Pattern: PROJECT_PREFIX-NUMBER
    match = re.search(r'([A-Z]+)-(\d+)', text)
    if match:
        return match.group(0)  # Returns full match like "CC-16"
    
    return None

def get_github_headers(token=None):
    """Get headers for GitHub API requests"""
    token = token or os.getenv("GITHUB_TOKEN")
    return {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }

def add_collaborator(repo_url, username, token, permission="push"):
    """
    Add a collaborator to GitHub repository
    
    Args:
        repo_url: Full GitHub repo URL
        username: GitHub username to add
        token: GitHub access token
        permission: 'pull', 'push', 'admin', 'maintain', 'triage'
    
    Returns:
        dict: Response data or error
    """
    try:
        owner, repo = parse_repo_url(repo_url)
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/collaborators/{username}"
        
        response = requests.put(
            url,
            headers=get_github_headers(token),
            json={"permission": permission}
        )
        
        if response.status_code in [201, 204]:
            return {"success": True, "message": f"Added {username} as collaborator"}
        else:
            return {"success": False, "error": response.json()}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

def create_webhook(repo_url, webhook_url, token, events=None):
    """
    Create a webhook on GitHub repository
    
    Args:
        repo_url: Full GitHub repo URL
        webhook_url: URL to receive webhook events (your DOIT app)
        token: GitHub access token
        events: List of events to subscribe to
    
    Returns:
        dict: Webhook data including webhook_id
    """
    if events is None:
        events = ["push", "pull_request", "create", "delete"]
    
    try:
        owner, repo = parse_repo_url(repo_url)
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/hooks"
        
        payload = {
            "name": "web",
            "active": True,
            "events": events,
            "config": {
                "url": webhook_url,
                "content_type": "json",
                "insecure_ssl": "0"
            }
        }
        
        response = requests.post(
            url,
            headers=get_github_headers(token),
            json=payload
        )
        
        if response.status_code == 201:
            data = response.json()
            return {
                "success": True,
                "webhook_id": data["id"],
                "webhook_url": data["config"]["url"]
            }
        else:
            return {"success": False, "error": response.json()}
    
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_branches(repo_url, token, ticket_id=None):
    """
    Get branches from GitHub repository
    
    Args:
        repo_url: Full GitHub repo URL
        token: GitHub access token
        ticket_id: Optional ticket ID to filter branches
    
    Returns:
        list: Branch data
    """
    try:
        owner, repo = parse_repo_url(repo_url)
        url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/branches"
        
        response = requests.get(url, headers=get_github_headers(token))
        
        print(f"[GITHUB API] GET {url}")
        print(f"[GITHUB API] Response status: {response.status_code}")
        
        if response.status_code == 200:
            branches = response.json()
            
            # Filter by ticket ID if provided
            if ticket_id:
                branches = [b for b in branches if ticket_id in b['name']]
            
            return branches
        else:
            print(f"[GITHUB API] Error response: {response.text}")
            return []
    
    except Exception as e:
        print(f"Error fetching branches: {e}")
        import traceback
        traceback.print_exc()
        return []

def search_commits(repo_url, token, ticket_id):
    """
    Search commits mentioning ticket ID
    
    Args:
        repo_url: Full GitHub repo URL
        token: GitHub access token
        ticket_id: Ticket ID to search for
    
    Returns:
        list: Commit data
    """
    try:
        owner, repo = parse_repo_url(repo_url)
        query = f"repo:{owner}/{repo}+{ticket_id}"
        url = f"{GITHUB_API_BASE}/search/commits?q={query}"
        
        headers = get_github_headers(token)
        headers["Accept"] = "application/vnd.github.cloak-preview"
        
        response = requests.get(url, headers=headers)
        
        print(f"[GITHUB API] Search commits: {url}")
        print(f"[GITHUB API] Response status: {response.status_code}")
        
        if response.status_code == 200:
            return response.json().get('items', [])
        else:
            print(f"[GITHUB API] Error response: {response.text}")
            return []
    
    except Exception as e:
        print(f"Error searching commits: {e}")
        import traceback
        traceback.print_exc()
        return []

def search_pull_requests(repo_url, token, ticket_id):
    """
    Search pull requests mentioning ticket ID
    
    Args:
        repo_url: Full GitHub repo URL
        token: GitHub access token
        ticket_id: Ticket ID to search for
    
    Returns:
        list: Pull request data
    """
    try:
        owner, repo = parse_repo_url(repo_url)
        query = f"repo:{owner}/{repo}+type:pr+{ticket_id}"
        url = f"{GITHUB_API_BASE}/search/issues?q={query}"
        
        response = requests.get(url, headers=get_github_headers(token))
        
        if response.status_code == 200:
            prs = response.json().get('items', [])
            
            # Fetch detailed PR info to get merge status
            detailed_prs = []
            for pr in prs:
                pr_url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/pulls/{pr['number']}"
                pr_response = requests.get(pr_url, headers=get_github_headers(token))
                if pr_response.status_code == 200:
                    detailed_prs.append(pr_response.json())
            
            return detailed_prs
        else:
            return []
    
    except Exception as e:
        print(f"Error searching pull requests: {e}")
        return []

def calculate_time_ago(timestamp_str):
    """
    Calculate time ago from timestamp
    
    Args:
        timestamp_str: ISO format timestamp
    
    Returns:
        str: Human readable time ago (e.g., "2 hours ago")
    """
    if not timestamp_str:
        return None
    
    try:
        # Parse GitHub timestamp
        timestamp = datetime.fromisoformat(timestamp_str.replace('Z', '+00:00'))
        now = datetime.now(timezone.utc)
        
        diff = now - timestamp
        
        seconds = diff.total_seconds()
        
        if seconds < 60:
            return f"{int(seconds)} seconds ago"
        elif seconds < 3600:
            minutes = int(seconds / 60)
            return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
        elif seconds < 86400:
            hours = int(seconds / 3600)
            return f"{hours} hour{'s' if hours != 1 else ''} ago"
        else:
            days = int(seconds / 86400)
            return f"{days} day{'s' if days != 1 else ''} ago"
    
    except Exception as e:
        return timestamp_str
