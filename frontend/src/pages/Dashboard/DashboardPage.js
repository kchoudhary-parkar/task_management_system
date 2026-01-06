// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { projectAPI, taskAPI } from "../../services/api";
// import { AuthContext } from "../../context/AuthContext";
// import "./DashboardPage.css";

// function DashboardPage() {
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);
//   const [stats, setStats] = useState({
//     totalProjects: 0,
//     myTasks: 0,
//     completedTasks: 0,
//     pendingTasks: 0,
//   });
//   const [recentActivities, setRecentActivities] = useState([]);
//   const [upcomingDeadlines, setUpcomingDeadlines] = useState({
//     today: [],
//     thisWeek: [],
//     overdue: []
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       const [projectsData, tasksData] = await Promise.all([
//         projectAPI.getAll(),
//         taskAPI.getMyTasks(),
//       ]);

//       const projects = projectsData.projects || [];
//       const tasks = tasksData.tasks || [];

//       setStats({
//         totalProjects: projects.length,
//         myTasks: tasks.length,
//         completedTasks: tasks.filter((t) => t.status === "Done").length,
//         pendingTasks: tasks.filter((t) => t.status !== "Done").length,
//       });

//       // Process activities from tasks
//       processRecentActivities(tasks, projects);
      
//       // Process upcoming deadlines
//       processUpcomingDeadlines(tasks);
//     } catch (err) {
//       console.error("Failed to load dashboard:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processRecentActivities = (tasks, projects) => {
//     const activities = [];
    
//     // Get tasks with recent updates
//     tasks.forEach(task => {
//       const project = projects.find(p => p._id === task.project_id);
//       const projectName = project ? project.name : "Unknown Project";
      
//       // Task completion activity
//       if (task.status === "Done" && task.updated_at) {
//         activities.push({
//           id: `${task._id}-completed`,
//           type: "completed",
//           message: `You completed "${task.title}"`,
//           project: projectName,
//           time: new Date(task.updated_at).toISOString(), // Normalize to ISO string
//           taskId: task._id,
//           projectId: task.project_id
//         });
//       }
      
//       // Task assignment activity
//       if (task.assignee_id === user?.id && task.created_at) {
//         activities.push({
//           id: `${task._id}-assigned`,
//           type: "assigned",
//           message: `"${task.title}" was assigned to you`,
//           project: projectName,
//           time: new Date(task.created_at).toISOString(), // Normalize to ISO string
//           taskId: task._id,
//           projectId: task.project_id
//         });
//       }

//       // Task activity log
//       if (task.activities && task.activities.length > 0) {
//         task.activities.slice(-3).forEach(activity => {
//           // Ensure timestamp exists and is valid
//           const activityTime = activity.timestamp || activity.created_at || task.updated_at;
//           if (activityTime) {
//             activities.push({
//               id: `${task._id}-activity-${activityTime}`,
//               type: activity.action,
//               message: activity.action === "comment" 
//                 ? `${activity.user_name} commented on "${task.title}"` 
//                 : `${activity.user_name} changed status of "${task.title}" to ${activity.new_value}`,
//               project: projectName,
//               time: new Date(activityTime).toISOString(), // Normalize to ISO string
//               taskId: task._id,
//               projectId: task.project_id
//             });
//           }
//         });
//       }
//     });

//     // Sort by most recent and take last 10
//     activities.sort((a, b) => new Date(b.time) - new Date(a.time));
//     setRecentActivities(activities.slice(0, 10));
//   };

//   const processUpcomingDeadlines = (tasks) => {
//     const now = new Date();
//     const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
//     const endOfWeek = new Date(today);
//     endOfWeek.setDate(endOfWeek.getDate() + 7);

//     const deadlines = {
//       today: [],
//       thisWeek: [],
//       overdue: []
//     };

//     tasks.forEach(task => {
//       if (task.status === "Done" || !task.due_date) return;

//       const dueDate = new Date(task.due_date);
//       const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

//       if (dueDateOnly < today) {
//         deadlines.overdue.push(task);
//       } else if (dueDateOnly.getTime() === today.getTime()) {
//         deadlines.today.push(task);
//       } else if (dueDateOnly <= endOfWeek) {
//         deadlines.thisWeek.push(task);
//       }
//     });

//     // Sort by due date
//     Object.keys(deadlines).forEach(key => {
//       deadlines[key].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
//     });

//     setUpcomingDeadlines(deadlines);
//   };

//   const getTimeAgo = (timestamp) => {
//     if (!timestamp) return "";
    
//     // Parse the timestamp - JavaScript Date automatically converts UTC to local time
//     const past = new Date(timestamp);
//     const now = new Date();
    
//     // Check if date is valid
//     if (isNaN(past.getTime())) {
//       console.error('Invalid timestamp:', timestamp);
//       return "Unknown time";
//     }
    
//     // Calculate difference in milliseconds
//     const diffMs = now.getTime() - past.getTime();
    
//     // If the time is in the future (shouldn't happen), show as just now
//     if (diffMs < 0) {
//       return "Just now";
//     }
    
//     const diffSeconds = Math.floor(diffMs / 1000);
//     const diffMins = Math.floor(diffSeconds / 60);
//     const diffHours = Math.floor(diffMins / 60);
//     const diffDays = Math.floor(diffHours / 24);

//     if (diffSeconds < 10) return "Just now";
//     if (diffSeconds < 60) return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
//     if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
//     if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
//     if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
//     if (diffDays < 30) {
//       const weeks = Math.floor(diffDays / 7);
//       return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
//     }
    
//     return past.toLocaleDateString('en-US', { 
//       month: 'short', 
//       day: 'numeric',
//       year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
//     });
//   };

//   const getActivityIcon = (type) => {
//     switch(type) {
//       case "completed": return "✅";
//       case "assigned": return "👤";
//       case "comment": return "💬";
//       case "status_change": return "🔄";
//       default: return "📝";
//     }
//   };

//   const getDaysUntil = (dueDate) => {
//     const now = new Date();
//     const due = new Date(dueDate);
//     const diffTime = due - now;
//     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
//     return diffDays;
//   };

//   if (loading) {
//     return (
//       <div className="dashboard-page">
//         <div className="dashboard-container">
//           <p className="loading-text">Loading dashboard...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-page">
//       <div className="dashboard-container">
//         <div className="dashboard-header">
//           <h1>Welcome back, {user?.name}! </h1>
//           <p className="dashboard-subtitle">Here's an overview of your work</p>
//         </div>

//         <div className="dashboard-cards">
//           <div
//             className="dashboard-card projects-card"
//             onClick={() => navigate("/projects")}
//           >
//             <div className="card-icon">📁</div>
//             <div className="card-content">
//               <h2>My Projects</h2>
//               <p className="card-count">{stats.totalProjects}</p>
//               <p className="card-description">
//                 View and manage all your projects
//               </p>
//             </div>
//             <div className="card-arrow">→</div>
//           </div>

//           <div
//             className="dashboard-card tasks-card"
//             onClick={() => navigate("/my-tasks")}
//           >
//             <div className="card-icon">✅</div>
//             <div className="card-content">
//               <h2>Tasks Assigned to Me</h2>
//               <p className="card-count">{stats.myTasks}</p>
//               <p className="card-description">
//                 Tasks you need to work on
//               </p>
//             </div>
//             <div className="card-arrow">→</div>
//           </div>
//         </div>

//         <div className="stats-cards">
//           <div className="stat-card pending">
//             <div className="stat-icon">⏳</div>
//             <div className="stat-info">
//               <p className="stat-label">Pending Tasks</p>
//               <p className="stat-value">{stats.pendingTasks}</p>
//             </div>
//           </div>

//           <div className="stat-card completed">
//             <div className="stat-icon">✨</div>
//             <div className="stat-info">
//               <p className="stat-label">Completed Tasks</p>
//               <p className="stat-value">{stats.completedTasks}</p>
//             </div>
//           </div>
//         </div>

//         {/* Upcoming Deadlines Section */}
//         <div className="deadlines-section">
//           <div className="section-header">
//             <h2>⏰ Upcoming Deadlines</h2>
//           </div>

//           {upcomingDeadlines.overdue.length === 0 && 
//            upcomingDeadlines.today.length === 0 && 
//            upcomingDeadlines.thisWeek.length === 0 ? (
//             <div className="no-deadlines">
//               <span className="no-deadlines-icon">🎉</span>
//               <p>No upcoming deadlines! You're all caught up.</p>
//             </div>
//           ) : (
//             <div className="deadlines-grid">
//               {/* Overdue Tasks */}
//               {upcomingDeadlines.overdue.length > 0 && (
//                 <div className="deadline-column overdue">
//                   <h3>🚨 Overdue</h3>
//                   <div className="deadline-cards">
//                     {upcomingDeadlines.overdue.map(task => (
//                       <div 
//                         key={task._id} 
//                         className="deadline-card"
//                         onClick={() => navigate(`/projects/${task.project_id}/tasks`)}
//                       >
//                         <div className="deadline-card-header">
//                           <span className="task-priority" style={{
//                             backgroundColor: task.priority === "High" ? "#ef4444" : 
//                                            task.priority === "Medium" ? "#f59e0b" : "#10b981"
//                           }}>
//                             {task.priority}
//                           </span>
//                           <span className="overdue-badge">
//                             {Math.abs(getDaysUntil(task.due_date))} days overdue
//                           </span>
//                         </div>
//                         <h4>{task.title}</h4>
//                         <p className="deadline-date">
//                           📅 {new Date(task.due_date).toLocaleDateString()}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Due Today */}
//               {upcomingDeadlines.today.length > 0 && (
//                 <div className="deadline-column today">
//                   <h3>🔥 Due Today</h3>
//                   <div className="deadline-cards">
//                     {upcomingDeadlines.today.map(task => (
//                       <div 
//                         key={task._id} 
//                         className="deadline-card"
//                         onClick={() => navigate(`/projects/${task.project_id}/tasks`)}
//                       >
//                         <div className="deadline-card-header">
//                           <span className="task-priority" style={{
//                             backgroundColor: task.priority === "High" ? "#ef4444" : 
//                                            task.priority === "Medium" ? "#f59e0b" : "#10b981"
//                           }}>
//                             {task.priority}
//                           </span>
//                         </div>
//                         <h4>{task.title}</h4>
//                         <p className="deadline-date">📅 Today</p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {/* Due This Week */}
//               {upcomingDeadlines.thisWeek.length > 0 && (
//                 <div className="deadline-column this-week">
//                   <h3>📆 This Week</h3>
//                   <div className="deadline-cards">
//                     {upcomingDeadlines.thisWeek.slice(0, 5).map(task => (
//                       <div 
//                         key={task._id} 
//                         className="deadline-card"
//                         onClick={() => navigate(`/projects/${task.project_id}/tasks`)}
//                       >
//                         <div className="deadline-card-header">
//                           <span className="task-priority" style={{
//                             backgroundColor: task.priority === "High" ? "#ef4444" : 
//                                            task.priority === "Medium" ? "#f59e0b" : "#10b981"
//                           }}>
//                             {task.priority}
//                           </span>
//                           <span className="days-until">
//                             {getDaysUntil(task.due_date)} days
//                           </span>
//                         </div>
//                         <h4>{task.title}</h4>
//                         <p className="deadline-date">
//                           📅 {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>

//         {/* Recent Activity Feed */}
//         <div className="activity-section">
//           <div className="section-header">
//             <h2>📋 Recent Activity</h2>
//           </div>

//           {recentActivities.length === 0 ? (
//             <div className="no-activity">
//               <span className="no-activity-icon">💤</span>
//               <p>No recent activity. Start working on tasks!</p>
//             </div>
//           ) : (
//             <div className="activity-feed">
//               {recentActivities.map(activity => (
//                 <div 
//                   key={activity.id} 
//                   className={`activity-item ${activity.type}`}
//                   onClick={() => navigate(`/projects/${activity.projectId}/tasks`)}
//                 >
//                   <div className="activity-icon">
//                     {getActivityIcon(activity.type)}
//                   </div>
//                   <div className="activity-content">
//                     <p className="activity-message">{activity.message}</p>
//                     <div className="activity-meta">
//                       <span className="activity-project">📁 {activity.project}</span>
//                       <span className="activity-time">{getTimeAgo(activity.time)}</span>
//                     </div>
//                   </div>
//                   <div className="activity-arrow">→</div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default DashboardPage;

// Add this to your DashboardPage.js component

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { projectAPI, taskAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Theme state
  const [theme, setTheme] = useState(() => {
    // Get theme from localStorage or default to 'dark'
    return localStorage.getItem('dashboard-theme') || 'dark';
  });
  
  const [stats, setStats] = useState({
    totalProjects: 0,
    myTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState({
    today: [],
    thisWeek: [],
    overdue: []
  });
  const [loading, setLoading] = useState(true);

  // Apply theme on mount and when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dashboard-theme', theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData] = await Promise.all([
        projectAPI.getAll(),
        taskAPI.getMyTasks(),
      ]);

      const projects = projectsData.projects || [];
      const tasks = tasksData.tasks || [];

      setStats({
        totalProjects: projects.length,
        myTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === "Done").length,
        pendingTasks: tasks.filter((t) => t.status !== "Done").length,
      });

      processRecentActivities(tasks, projects);
      processUpcomingDeadlines(tasks);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const processRecentActivities = (tasks, projects) => {
    const activities = [];
    
    tasks.forEach(task => {
      const project = projects.find(p => p._id === task.project_id);
      const projectName = project ? project.name : "Unknown Project";
      
      if (task.status === "Done" && task.updated_at) {
        activities.push({
          id: `${task._id}-completed`,
          type: "completed",
          message: `You completed "${task.title}"`,
          project: projectName,
          time: new Date(task.updated_at).toISOString(),
          taskId: task._id,
          projectId: task.project_id
        });
      }
      
      if (task.assignee_id === user?.id && task.created_at) {
        activities.push({
          id: `${task._id}-assigned`,
          type: "assigned",
          message: `"${task.title}" was assigned to you`,
          project: projectName,
          time: new Date(task.created_at).toISOString(),
          taskId: task._id,
          projectId: task.project_id
        });
      }

      if (task.activities && task.activities.length > 0) {
        task.activities.slice(-3).forEach(activity => {
          const activityTime = activity.timestamp || activity.created_at || task.updated_at;
          if (activityTime) {
            activities.push({
              id: `${task._id}-activity-${activityTime}`,
              type: activity.action,
              message: activity.action === "comment" 
                ? `${activity.user_name} commented on "${task.title}"` 
                : `${activity.user_name} changed status of "${task.title}" to ${activity.new_value}`,
              project: projectName,
              time: new Date(activityTime).toISOString(),
              taskId: task._id,
              projectId: task.project_id
            });
          }
        });
      }
    });

    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    setRecentActivities(activities.slice(0, 10));
  };

  const processUpcomingDeadlines = (tasks) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    const deadlines = {
      today: [],
      thisWeek: [],
      overdue: []
    };

    tasks.forEach(task => {
      if (task.status === "Done" || !task.due_date) return;

      const dueDate = new Date(task.due_date);
      const dueDateOnly = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());

      if (dueDateOnly < today) {
        deadlines.overdue.push(task);
      } else if (dueDateOnly.getTime() === today.getTime()) {
        deadlines.today.push(task);
      } else if (dueDateOnly <= endOfWeek) {
        deadlines.thisWeek.push(task);
      }
    });

    Object.keys(deadlines).forEach(key => {
      deadlines[key].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
    });

    setUpcomingDeadlines(deadlines);
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    
    const past = new Date(timestamp);
    const now = new Date();
    
    if (isNaN(past.getTime())) {
      console.error('Invalid timestamp:', timestamp);
      return "Unknown time";
    }
    
    const diffMs = now.getTime() - past.getTime();
    
    if (diffMs < 0) {
      return "Just now";
    }
    
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 10) return "Just now";
    if (diffSeconds < 60) return `${diffSeconds} second${diffSeconds !== 1 ? "s" : ""} ago`;
    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} week${weeks !== 1 ? "s" : ""} ago`;
    }
    
    return past.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case "completed": return "✅";
      case "assigned": return "👤";
      case "comment": return "💬";
      case "status_change": return "🔄";
      default: return "📝";
    }
  };

  const getDaysUntil = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '12px' }}>
            <h1>Welcome back, {user?.name}! </h1>
            
          </div>
          <p className="dashboard-subtitle">Here's an overview of your work</p>
        </div>

        <div className="dashboard-cards">
          <div
            className="dashboard-card projects-card"
            onClick={() => navigate("/projects")}
          >
            <div className="card-icon">📁</div>
            <div className="card-content">
              <h2>My Projects</h2>
              <p className="card-count">{stats.totalProjects}</p>
              <p className="card-description">
                View and manage all your projects
              </p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          <div
            className="dashboard-card tasks-card"
            onClick={() => navigate("/my-tasks")}
          >
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h2>Tasks Assigned to Me</h2>
              <p className="card-count">{stats.myTasks}</p>
              <p className="card-description">
                Tasks you need to work on
              </p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          {(user?.role === "admin" || user?.role === "super-admin") && (
            <div
              className="dashboard-card users-card"
              onClick={() => navigate("/users")}
            >
              <div className="card-icon">👥</div>
              <div className="card-content">
                <h2>User Management</h2>
                <p className="card-description">
                  {user?.role === "super-admin" ? "Manage users and roles" : "View all users"}
                </p>
              </div>
              <div className="card-arrow">→</div>
            </div>
          )}
        </div>

        <div className="stats-cards">
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <p className="stat-label">Pending Tasks</p>
              <p className="stat-value">{stats.pendingTasks}</p>
            </div>
          </div>

          <div className="stat-card completed">
            <div className="stat-icon">✨</div>
            <div className="stat-info">
              <p className="stat-label">Completed Tasks</p>
              <p className="stat-value">{stats.completedTasks}</p>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines Section */}
        <div className="deadlines-section">
          <div className="section-header">
            <h2>⏰ Upcoming Deadlines</h2>
          </div>

          {upcomingDeadlines.overdue.length === 0 && 
           upcomingDeadlines.today.length === 0 && 
           upcomingDeadlines.thisWeek.length === 0 ? (
            <div className="no-deadlines">
              <span className="no-deadlines-icon">🎉</span>
              <p>No upcoming deadlines! You're all caught up.</p>
            </div>
          ) : (
            <div className="deadlines-grid">
              {upcomingDeadlines.overdue.length > 0 && (
                <div className="deadline-column overdue">
                  <h3>🚨 Overdue</h3>
                  <div className="deadline-cards">
                    {upcomingDeadlines.overdue.map(task => (
                      <div 
                        key={task._id} 
                        className="deadline-card"
                        onClick={() => navigate(`/projects/${task.project_id}/tasks`)}
                      >
                        <div className="deadline-card-header">
                          <span className="task-priority" style={{
                            backgroundColor: task.priority === "High" ? "#ef4444" : 
                                           task.priority === "Medium" ? "#f59e0b" : "#10b981"
                          }}>
                            {task.priority}
                          </span>
                          <span className="overdue-badge">
                            {Math.abs(getDaysUntil(task.due_date))} days overdue
                          </span>
                        </div>
                        <h4>{task.title}</h4>
                        <p className="deadline-date">
                          📅 {new Date(task.due_date).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {upcomingDeadlines.today.length > 0 && (
                <div className="deadline-column today">
                  <h3>🔥 Due Today</h3>
                  <div className="deadline-cards">
                    {upcomingDeadlines.today.map(task => (
                      <div 
                        key={task._id} 
                        className="deadline-card"
                        onClick={() => navigate(`/projects/${task.project_id}/tasks`)}
                      >
                        <div className="deadline-card-header">
                          <span className="task-priority" style={{
                            backgroundColor: task.priority === "High" ? "#ef4444" : 
                                           task.priority === "Medium" ? "#f59e0b" : "#10b981"
                          }}>
                            {task.priority}
                          </span>
                        </div>
                        <h4>{task.title}</h4>
                        <p className="deadline-date">📅 Today</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {upcomingDeadlines.thisWeek.length > 0 && (
                <div className="deadline-column this-week">
                  <h3>📆 This Week</h3>
                  <div className="deadline-cards">
                    {upcomingDeadlines.thisWeek.slice(0, 5).map(task => (
                      <div 
                        key={task._id} 
                        className="deadline-card"
                        onClick={() => navigate(`/projects/${task.project_id}/tasks`)}
                      >
                        <div className="deadline-card-header">
                          <span className="task-priority" style={{
                            backgroundColor: task.priority === "High" ? "#ef4444" : 
                                           task.priority === "Medium" ? "#f59e0b" : "#10b981"
                          }}>
                            {task.priority}
                          </span>
                          <span className="days-until">
                            {getDaysUntil(task.due_date)} days
                          </span>
                        </div>
                        <h4>{task.title}</h4>
                        <p className="deadline-date">
                          📅 {new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Recent Activity Feed */}
        <div className="activity-section">
          <div className="section-header">
            <h2>📋 Recent Activity</h2>
          </div>

          {recentActivities.length === 0 ? (
            <div className="no-activity">
              <span className="no-activity-icon">💤</span>
              <p>No recent activity. Start working on tasks!</p>
            </div>
          ) : (
            <div className="activity-feed">
              {recentActivities.map(activity => (
                <div 
                  key={activity.id} 
                  className={`activity-item ${activity.type}`}
                  onClick={() => navigate(`/projects/${activity.projectId}/tasks`)}
                >
                  <div className="activity-icon">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="activity-content">
                    <p className="activity-message">{activity.message}</p>
                    <div className="activity-meta">
                      <span className="activity-project">📁 {activity.project}</span>
                      <span className="activity-time">{getTimeAgo(activity.time)}</span>
                    </div>
                  </div>
                  <div className="activity-arrow">→</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;