# Task Management System 🚀

A comprehensive task management system built with Python (backend) and React (frontend), featuring AI-powered assistance, multiple authentication methods, and advanced project management capabilities.

**Developer:** Abhishek Nage

---

## 🛠️ Tech Stack

### Backend
- **Server**: Pure Core Python (Custom HTTP Server)
- **Database**: MongoDB Atlas
- **Authentication**: JWT + Clerk Integration
- **AI Integration**: Google Gemini API (Free tier with $300 credit)

### Frontend
- **Framework**: React.js
- **Authentication**: Dual mode (Traditional + Clerk OAuth)
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: React Context API

---

## ✨ Key Features

### 🔐 Authentication & Security
- **Dual Authentication**:
  - Traditional email/password with enhanced validation
  - Clerk OAuth integration (Google, Microsoft)
- **JWT-based session management** with device fingerprinting
- **Tab-specific session keys** preventing token theft
- **Role-based access control** (Member, Admin, Super Admin)
- **Password strength validation** with real-time feedback

### 📊 Project Management
- **Project Creation & Organization** (Admin/Super Admin only)
- **Team Collaboration** with member management
- **Sprint Planning** with backlog management
- **Kanban Board** with drag-and-drop task management
- **Task Linking** (blocks, blocked-by, relates-to, duplicates)
- **File Attachments** (URLs and base64 documents up to 10MB)
- **Label System** with predefined colors
- **6-Stage Workflow**: To Do → In Progress → Testing → Dev Complete → Done → Closed

### 🤖 AI-Powered Chatbot
- **Intelligent Assistant** powered by Google Gemini 1.5 Flash
- **Context-Aware** responses based on:
  - User's tasks and assignments
  - Project portfolio and team collaboration
  - Sprint status and velocity
  - Workload distribution and blockers
- **Actionable Insights** with emoji-rich formatting
- **Proactive Analysis** of overdue tasks, bottlenecks, and opportunities
- **Completely FREE** with Google's $300 credit offer

### 📈 Analytics & Reporting
- **Personal Dashboard** with task statistics and project progress
- **System Dashboard** (Super Admin only) with organization-wide metrics
- **Export Capabilities**:
  - PDF reports with charts and visualizations
  - Excel spreadsheets with multiple worksheets
  - CSV exports with comprehensive data
- **Visual Charts**:
  - Task status distribution (pie/doughnut)
  - Priority breakdown
  - Project health metrics (bar charts)
  - User workload analysis

### 🎯 Task Management
- **Unique Ticket IDs** (e.g., PROJ-001, TASK-042)
- **Issue Types**: Task, Bug, Story, Epic
- **Priority Levels**: High, Medium, Low
- **Task Assignment** with validation
- **Due Date Tracking** with urgency indicators
- **Activity History** with comments and status changes
- **Approval Workflow** (Done → Closed by project owner)

### 👥 User Management
- **Profile System** with personal info, education, certificates, organization
- **User Search** by email
- **Role Management** (Super Admin only)
- **Team Workload** distribution tracking

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB Atlas account
- Git
- (Optional) Clerk account for OAuth
- (Optional) Google Gemini API key for chatbot

### Environment Variables

#### Backend (.env)
```bash
# Database
MONGO_URI=your_mongodb_atlas_connection_string

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key

# Super Admin Credentials
SADMIN_EMAIL=superadmin@gmail.com
SADMIN_PASSWORD=superadmin
SADMIN_NAME=Super Admin

# Clerk (Optional)
CLERK_SECRET_KEY=your_clerk_secret_key

# Google Gemini API (Optional)
GOOGLE_GEMINI_API_KEY=your_gemini_api_key
```

#### Frontend (.env)
```bash
# API Base URL
REACT_APP_API_BASE_URL=http://localhost:8000

# Clerk (Optional)
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

---

### Installation

#### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Initialize database (creates super admin)
python init_db.py

# Create indexes for performance
python migrations/create_indexes.py

# Start server
python server.py
```

Server runs on `http://localhost:8000`

#### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

App runs on `http://localhost:3000`

---

## 📁 Project Structure

```
task-management-system/
├── backend/
│   ├── controllers/          # Request handlers
│   │   ├── auth_controller.py
│   │   ├── chat_controller.py
│   │   ├── dashboard_controller.py
│   │   ├── project_controller.py
│   │   ├── task_controller.py
│   │   ├── sprint_controller.py
│   │   └── ...
│   ├── models/              # Database models
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── task.py
│   │   ├── sprint.py
│   │   └── profile.py
│   ├── utils/               # Utilities
│   │   ├── auth_utils.py    # JWT & session management
│   │   ├── validators.py    # Input validation
│   │   ├── ticket_utils.py  # Ticket ID generation
│   │   └── label_utils.py
│   ├── middleware/          # Middleware functions
│   ├── migrations/          # Database migrations
│   ├── routes/              # Route definitions
│   ├── server.py            # Main server file
│   ├── database.py          # MongoDB connection
│   ├── config.py            # Configuration
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/      # React components
    │   │   ├── Chat/        # AI Chatbot
    │   │   ├── Input/       # Form inputs
    │   │   └── ...
    │   ├── pages/           # Page components
    │   │   ├── Dashboard.js
    │   │   ├── Projects.js
    │   │   ├── Tasks.js
    │   │   ├── Sprints/
    │   │   ├── Profile/
    │   │   └── SystemDashboard/
    │   ├── services/        # API services
    │   │   ├── api.js
    │   │   └── sprintAPI.js
    │   ├── context/         # React Context
    │   │   └── AuthContext.js
    │   ├── utils/           # Utility functions
    │   │   ├── exportUtils.js
    │   │   ├── systemExportUtils.js
    │   │   └── requestCache.js
    │   ├── App.js
    │   └── index.js
    └── package.json
```

---

## 🔑 Default Credentials

**Super Admin:**
- Email: `superadmin@gmail.com`
- Password: `superadmin`

⚠️ **Important**: Change the super admin password immediately after first login!

---

## 🎨 Key Features in Detail

### AI Chatbot Integration
The AI chatbot provides:
- **Real-time insights** into your tasks and projects
- **Workload analysis** with team collaboration metrics
- **Sprint velocity** and completion trends
- **Blocker detection** and relationship mapping
- **Proactive suggestions** for improving productivity

Example queries:
- "How am I doing this week?"
- "Which projects need attention?"
- "Show me my blocked tasks"
- "What's my team's workload?"

### Sprint Management
- Create planned sprints with start/end dates
- Start sprints to activate them
- Add/remove tasks from active sprints
- Complete sprints (moves incomplete tasks to backlog)
- Track sprint velocity and completion rates

### Advanced Task Features
- **Task Linking**: Create relationships between tasks
- **Attachments**: Upload documents or link external files
- **Labels**: Organize with customizable tags
- **Comments**: Activity log with user attribution
- **Approval Workflow**: Two-stage completion (Done → Closed)

### Security Features
- Device fingerprinting prevents token reuse
- Tab-specific session keys prevent cross-tab theft
- Automatic session invalidation on suspicious activity
- Security event logging for audit trails
- Rate limiting and request deduplication

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/clerk-sync` - Clerk OAuth sync
- `POST /api/auth/logout` - Logout
- `POST /api/auth/refresh-session` - Refresh tab session

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create project (Admin+)
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks/my` - Get assigned tasks
- `POST /api/tasks` - Create task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/approve` - Approve task (Owner only)
- `POST /api/tasks/:id/comments` - Add comment

### Sprints
- `GET /api/projects/:id/sprints` - Get project sprints
- `POST /api/projects/:id/sprints` - Create sprint
- `POST /api/sprints/:id/start` - Start sprint
- `POST /api/sprints/:id/complete` - Complete sprint

### Dashboard
- `GET /api/dashboard/analytics` - Personal analytics
- `GET /api/dashboard/system` - System analytics (Super Admin)
- `GET /api/dashboard/report` - Downloadable report

### Chat
- `POST /api/chat/ask` - Ask AI assistant
- `GET /api/chat/suggestions` - Get AI suggestions

---

## 🔒 Security Best Practices

1. **Change default super admin password** immediately
2. **Use strong passwords** (8+ chars, uppercase, lowercase, numbers, special chars)
3. **Enable HTTPS** in production
4. **Rotate JWT secrets** regularly
5. **Monitor security logs** for suspicious activity
6. **Limit API rate** for production deployments

---

## 🐛 Troubleshooting

### Backend Issues
- **Port 8000 in use**: Change port in `server.py`
- **MongoDB connection fails**: Check `MONGO_URI` in `.env`
- **Super admin not created**: Run `python init_db.py`

### Frontend Issues
- **API connection fails**: Verify `REACT_APP_API_BASE_URL`
- **Clerk auth fails**: Check Clerk publishable key
- **Build errors**: Delete `node_modules` and reinstall

### Chatbot Issues
- **No responses**: Verify `GOOGLE_GEMINI_API_KEY`
- **Rate limits**: Check API quota at ai.google.dev

---

## 📝 License

This project is open source and available under the MIT License.

---

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Clerk for authentication services
- MongoDB Atlas for database hosting
- React community for excellent documentation

---

## 📧 Contact

**Developer:** Abhishek

For issues and feature requests, please create an issue in the repository.
