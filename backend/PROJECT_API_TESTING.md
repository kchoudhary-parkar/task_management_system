# Project Management API Testing Guide

## Available Endpoints

### 1. Create Project
**POST** `/api/projects`
- **Auth Required:** Yes (Bearer token)
- **Body:**
```json
{
  "name": "My First Project",
  "description": "Project description (optional)"
}
```

### 2. Get All User Projects
**GET** `/api/projects`
- **Auth Required:** Yes (Bearer token)
- Returns all projects created by the logged-in user

### 3. Get Project by ID
**GET** `/api/projects/{project_id}`
- **Auth Required:** Yes (Bearer token)
- Returns specific project details

### 4. Update Project
**PUT** `/api/projects/{project_id}`
- **Auth Required:** Yes (Bearer token)
- **Body:**
```json
{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

### 5. Delete Project
**DELETE** `/api/projects/{project_id}`
- **Auth Required:** Yes (Bearer token)

## Testing with curl (PowerShell)

```powershell
# 1. Register a user
Invoke-RestMethod -Uri "http://localhost:8000/api/auth/register" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","password":"password123","name":"Test User"}'

# 2. Login to get token
$response = Invoke-RestMethod -Uri "http://localhost:8000/api/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","password":"password123"}'
$token = $response.token

# 3. Create a project
$headers = @{"Authorization"="Bearer $token"; "Content-Type"="application/json"}
Invoke-RestMethod -Uri "http://localhost:8000/api/projects" -Method POST -Headers $headers -Body '{"name":"Website Redesign","description":"Redesign company website"}'

# 4. Get all projects
Invoke-RestMethod -Uri "http://localhost:8000/api/projects" -Method GET -Headers $headers

# 5. Get specific project (replace {id} with actual project ID)
Invoke-RestMethod -Uri "http://localhost:8000/api/projects/{id}" -Method GET -Headers $headers

# 6. Update project
Invoke-RestMethod -Uri "http://localhost:8000/api/projects/{id}" -Method PUT -Headers $headers -Body '{"name":"Updated Project Name"}'

# 7. Delete project
Invoke-RestMethod -Uri "http://localhost:8000/api/projects/{id}" -Method DELETE -Headers $headers
```

## Features Implemented
- ✅ User-based project ownership (each user sees only their projects)
- ✅ JWT authentication for all project operations
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Timestamps (created_at, updated_at)
- ✅ Access control (users can only modify their own projects)
- ✅ Input validation
