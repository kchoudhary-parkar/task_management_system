# Team Management & Task Assignment System

## Overview
The Task Management System now implements a proper team-based workflow where:
1. **Project Owner creates a team** for each project
2. **Search and add members** by email from the users database
3. **Only Project Owner** can create, edit, delete, and assign tasks
4. **Team Members** can only view tasks

---

## Key Features

### 1. User Search Functionality
**Backend**: `controllers/user_controller.py`
```python
def search_users_by_email(email_query):
    # Searches users collection in MongoDB
    # Returns up to 10 matching users
    # Case-insensitive regex search
```

**API Endpoint**: `GET /api/users/search?email=query`
- Requires authentication
- Returns: List of users matching the email query

### 2. Team Member Management
**MemberManager Component** now includes:
- **Search Box**: Type email to search existing users
- **Live Search**: Shows results as you type (min 2 characters)
- **Search Results Dropdown**: Displays matching users with:
  - User avatar (first letter of name)
  - Full name
  - Email address
  - "Add" button to add them to the project team
- **Member List**: Shows all current team members
- **Remove Member**: Project owner can remove members

### 3. Permission-Based Task Operations
**Only Project Owner Can**:
- ✅ Create new tasks
- ✅ Edit existing tasks
- ✅ Delete tasks
- ✅ Assign tasks to team members
- ✅ Add/remove team members

**Team Members Can**:
- ✅ View all project tasks
- ✅ See task details
- ✅ View team members
- ❌ **Cannot** create/edit/delete tasks
- ❌ **Cannot** add/remove members

### 4. UI Changes

**TasksPage**:
- "Create Task" button only visible to project owner
- "View Team Members" button for all (renamed from "Manage Members")

**TaskCard**:
- Edit (✏️) and Delete (🗑️) buttons only visible to project owner
- All users can view task cards

**MemberManager**:
- Search functionality only available to project owner
- "Remove" button only visible to project owner

---

## How It Works

### Adding Team Members (Project Owner)
1. Click "View Team Members" button
2. Type email in search box (e.g., "john@example.com")
3. See matching users appear in dropdown
4. Click "Add" button next to desired user
5. User is added to project team
6. Can now assign tasks to this member

### Creating and Assigning Tasks (Project Owner)
1. Click "+ Create Task" button
2. Fill in task details:
   - Title (required)
   - Description (optional)
   - Priority (Low/Medium/High)
   - Status (To Do/In Progress/Done)
   - **Assign To**: Dropdown shows all team members
   - Due Date (optional)
3. Click "Create Task"
4. Task is created and assigned to selected member

### Viewing Tasks (All Team Members)
1. Navigate to project tasks page
2. See all tasks with status filters:
   - All (total count)
   - To Do (count)
   - In Progress (count)
   - Done (count)
3. View task details including assignee
4. **Note**: Cannot modify tasks if not the owner

---

## Technical Implementation

### Backend Changes
1. **New Controller**: `user_controller.py` - User search functionality
2. **New Route**: `GET /api/users/search` - Search users by email
3. **Server Update**: Added query parameter parsing for search endpoint

### Frontend Changes
1. **New API Method**: `userAPI.searchByEmail(query)`
2. **MemberManager Component**:
   - Changed from email input to search with dropdown
   - Added search state management
   - Real-time search results display
3. **TaskCard Component**:
   - Added `isOwner` prop
   - Conditional rendering of edit/delete buttons
4. **TasksPage Component**:
   - Pass `isOwner` to TaskCard
   - Conditional rendering of "Create Task" button
   - Updated button labels for clarity

### Permission Logic
```javascript
const isOwner = project.owner_id === user.id;

// Only show to owner:
{isOwner && <button>Create Task</button>}
{isOwner && <button>Edit</button>}
{isOwner && <button>Delete</button>}
```

---

## Testing the Workflow

### 1. Register Two Users
- User A: `owner@example.com` (Project Owner)
- User B: `member@example.com` (Team Member)

### 2. As Owner (User A)
1. Login as `owner@example.com`
2. Create a project
3. Go to project tasks page
4. Click "View Team Members"
5. Search for `member@example.com`
6. Add User B to team
7. Click "+ Create Task"
8. Assign task to User B
9. See edit/delete buttons on tasks

### 3. As Member (User B)
1. Logout and login as `member@example.com`
2. Navigate to the project (should see it in projects list)
3. Go to project tasks page
4. See assigned tasks
5. **Notice**: No "Create Task" button
6. **Notice**: No edit/delete buttons on task cards
7. Can view team members but cannot add/remove

---

## Database Structure

### Users Collection
```javascript
{
  _id: ObjectId,
  name: "John Doe",
  email: "john@example.com",
  password: "hashed_password"
}
```

### Projects Collection
```javascript
{
  _id: ObjectId,
  name: "Project Name",
  owner_id: "user_id_string",
  members: [
    {
      user_id: "member_user_id",
      email: "member@example.com",
      name: "Member Name",
      added_at: "2025-12-31T..."
    }
  ]
}
```

### Tasks Collection
```javascript
{
  _id: ObjectId,
  title: "Task Title",
  project_id: "project_id_string",
  created_by: "owner_user_id",
  assignee_id: "member_user_id",
  assignee_name: "Member Name",
  assignee_email: "member@example.com",
  priority: "High|Medium|Low",
  status: "To Do|In Progress|Done",
  due_date: "2025-12-31"
}
```

---

## Benefits of This Approach

1. **Clear Ownership**: Only project owner has full control
2. **Team Collaboration**: Multiple members can view and track progress
3. **Real User Search**: Search from actual registered users
4. **Permission Security**: Frontend + Backend permission checks
5. **Scalable**: Can add more roles later (admin, viewer, etc.)
6. **User-Friendly**: Intuitive search instead of manual email entry

---

## Next Steps (Future Enhancements)

1. **Task Comments**: Allow team members to comment on tasks
2. **Task Status Updates**: Let assignees update their task status
3. **Notifications**: Notify members when assigned a task
4. **Activity Log**: Track who did what and when
5. **Role-Based Permissions**: Add more granular roles (admin, editor, viewer)
6. **Bulk Operations**: Assign multiple tasks at once

---

## Summary

The system now properly implements a **team-based task management workflow** where:
- Project owners create teams by searching and adding registered users
- Only owners can create/edit/delete/assign tasks
- Team members have read-only access to tasks
- Clean, intuitive UI with search functionality
- Proper permission checks on both frontend and backend
