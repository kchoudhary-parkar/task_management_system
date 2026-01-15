// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { dashboardAPI } from "../../services/api";
// import { AuthContext } from "../../context/AuthContext";
// import "./DashboardPage.css";
// import Loader from "../../components/Loader/Loader";
// import TaskStatusChart from "../../components/Charts/TaskStatusChart";
// import TaskPriorityChart from "../../components/Charts/TaskPriorityChart";
// import ProjectProgressChart from "../../components/Charts/ProjectProgressChart";
// import TaskStatsCard from "../../components/Charts/TaskStatsCard";
// import { exportToPDF, exportToExcel, exportToCSV } from "../../utils/exportUtils";

// function DashboardPage() {
//   const navigate = useNavigate();
//   const { user } = useContext(AuthContext);
  
//   const [analytics, setAnalytics] = useState(null);
//   const [report, setReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [exportLoading, setExportLoading] = useState(false);

//   useEffect(() => {
//     fetchDashboardData();
//   }, []);

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       const [analyticsData, reportData] = await Promise.all([
//         dashboardAPI.getAnalytics(),
//         dashboardAPI.getReport()
//       ]);

//       if (analyticsData.success) {
//         setAnalytics(analyticsData.analytics);
//       }
      
//       if (reportData.success) {
//         setReport(reportData.report);
//       }
//     } catch (err) {
//       console.error("Failed to load dashboard:", err);
//       setError(err.message || "Failed to load dashboard data");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleExportPDF = () => {
//     if (!analytics) return;
//     setExportLoading(true);
//     try {
//       exportToPDF(analytics, user?.name || "User");
//     } catch (err) {
//       console.error("Failed to export PDF:", err);
//       alert("Failed to export PDF: " + err.message);
//     } finally {
//       setExportLoading(false);
//     }
//   };

//   const handleExportExcel = () => {
//     if (!analytics) return;
//     setExportLoading(true);
//     try {
//       exportToExcel(analytics, report, user?.name || "User");
//     } catch (err) {
//       console.error("Failed to export Excel:", err);
//       alert("Failed to export Excel: " + err.message);
//     } finally {
//       setExportLoading(false);
//     }
//   };

//   const handleExportCSV = () => {
//     if (!analytics) return;
//     setExportLoading(true);
//     try {
//       exportToCSV(analytics, user?.name || "User");
//     } catch (err) {
//       console.error("Failed to export CSV:", err);
//       alert("Failed to export CSV: " + err.message);
//     } finally {
//       setExportLoading(false);
//     }
//   };

//   const getTimeAgo = (timestamp) => {
//     if (!timestamp) return "";
    
//     const past = new Date(timestamp);
//     const now = new Date();
    
//     if (isNaN(past.getTime())) {
//       return "Unknown time";
//     }

//     const diffMs = now.getTime() - past.getTime();
//     if (diffMs < 0) return "Just now";

//     const diffSeconds = Math.floor(diffMs / 1000);
//     const diffMins = Math.floor(diffSeconds / 60);
//     const diffHours = Math.floor(diffMins / 60);
//     const diffDays = Math.floor(diffHours / 24);

//     if (diffSeconds < 10) return "Just now";
//     if (diffSeconds < 60) return `${diffSeconds}s ago`;
//     if (diffMins < 60) return `${diffMins}m ago`;
//     if (diffHours < 24) return `${diffHours}h ago`;
//     if (diffDays < 7) return `${diffDays}d ago`;
//     if (diffDays < 30) {
//       const weeks = Math.floor(diffDays / 7);
//       return `${weeks}w ago`;
//     }

//     return past.toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
//     });
//   };

//   const getPriorityClass = (priority) => {
//     if (!priority) return "low";
//     return priority.toLowerCase();
//   };

//   const getDaysUntilText = (daysUntil) => {
//     if (daysUntil < 0) {
//       return `${Math.abs(daysUntil)} days overdue`;
//     } else if (daysUntil === 0) {
//       return "Due today";
//     } else if (daysUntil === 1) {
//       return "Due tomorrow";
//     } else {
//       return `${daysUntil} days left`;
//     }
//   };

//   if (loading) {
//     return (
//       <div className="dashboard-page">
//         <Loader />
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="dashboard-page">
//         <div className="error-container">
//           <h2>⚠️ Error Loading Dashboard</h2>
//           <p>{error}</p>
//           <button onClick={fetchDashboardData} className="btn-retry">
//             Try Again
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!analytics) {
//     return (
//       <div className="dashboard-page">
//         <div className="error-container">
//           <h2>No Data Available</h2>
//           <p>Unable to load dashboard data.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-page">
//       <div className="dashboard-container">
//         {/* Header with Export Buttons */}
//         <div className="dashboard-header">
//           <div className="header-content">
//             <h1>📊 Dashboard</h1>
//             <p className="dashboard-subtitle">
//               Welcome back, {user?.name || "User"}! Here's your workspace overview
//             </p>
//           </div>
//           <div className="export-buttons">
//             <button
//               onClick={handleExportPDF}
//               disabled={exportLoading}
//               className="btn-export btn-export-pdf"
//               title="Download as PDF"
//             >
//               📄 PDF
//             </button>
//             <button
//               onClick={handleExportExcel}
//               disabled={exportLoading}
//               className="btn-export btn-export-excel"
//               title="Download as Excel"
//             >
//               📊 Excel
//             </button>
//             <button
//               onClick={handleExportCSV}
//               disabled={exportLoading}
//               className="btn-export btn-export-csv"
//               title="Download as CSV"
//             >
//               📋 CSV
//             </button>
//           </div>
//         </div>

//         {/* Task Statistics Cards */}
//         <TaskStatsCard stats={analytics.task_stats} />

//         {/* Project Statistics Cards */}
//         <div className="project-stats-cards">
//           <div className="project-stat-card" onClick={() => navigate("/projects")}>
//             <div className="pstat-icon" style={{ background: '#dbeafe', color: '#3b82f6' }}>
//               📊
//             </div>
//             <div className="pstat-content">
//               <div className="pstat-value">{analytics.project_stats.total}</div>
//               <div className="pstat-label">Total Projects</div>
//             </div>
//           </div>
          
//           <div className="project-stat-card">
//             <div className="pstat-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
//               👑
//             </div>
//             <div className="pstat-content">
//               <div className="pstat-value">{analytics.project_stats.owned}</div>
//               <div className="pstat-label">Owned Projects</div>
//             </div>
//           </div>
          
//           <div className="project-stat-card">
//             <div className="pstat-icon" style={{ background: '#e0e7ff', color: '#6366f1' }}>
//               👥
//             </div>
//             <div className="pstat-content">
//               <div className="pstat-value">{analytics.project_stats.member_of}</div>
//               <div className="pstat-label">Member Of</div>
//             </div>
//           </div>
          
//           <div className="project-stat-card">
//             <div className="pstat-icon" style={{ background: '#dcfce7', color: '#22c55e' }}>
//               ✅
//             </div>
//             <div className="pstat-content">
//               <div className="pstat-value">{analytics.project_stats.active}</div>
//               <div className="pstat-label">Active Projects</div>
//             </div>
//           </div>
//         </div>

//         {/* Charts Grid */}
//         <div className="charts-grid">
//           <TaskStatusChart data={analytics.status_distribution} />
//           <TaskPriorityChart data={analytics.priority_distribution} />
//         </div>

//         {/* Project Progress Chart */}
//         <ProjectProgressChart data={analytics.project_progress} />

//         {/* Upcoming Deadlines */}
//         <div className="deadlines-section-new">
//           <div className="section-header">
//             <h2>📅 Upcoming Deadlines</h2>
//             <span className="deadline-count">{analytics.upcoming_deadlines.length} tasks</span>
//           </div>

//           {analytics.upcoming_deadlines.length === 0 ? (
//             <div className="no-deadlines">
//               <span className="no-deadlines-icon">🎉</span>
//               <p>No upcoming deadlines! You're all caught up.</p>
//             </div>
//           ) : (
//             <div className="deadlines-list">
//               {analytics.upcoming_deadlines.map((task, index) => (
//                 <div
//                   key={index}
//                   className={`deadline-item ${task.days_until < 0 ? 'overdue' : task.days_until === 0 ? 'today' : ''}`}
//                   onClick={() => navigate(`/projects/${task.project_id}`)}
//                 >
//                   <div className="deadline-left">
//                     <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
//                       {task.priority}
//                     </span>
//                     <div className="deadline-info">
//                       <h4>{task.title}</h4>
//                       <p className="deadline-project">📁 {task.project_name}</p>
//                     </div>
//                   </div>
//                   <div className="deadline-right">
//                     <div className="deadline-date">
//                       <span className="date-text">
//                         {new Date(task.due_date).toLocaleDateString('en-US', {
//                           month: 'short',
//                           day: 'numeric'
//                         })}
//                       </span>
//                       <span className={`days-until ${task.days_until < 0 ? 'overdue' : ''}`}>
//                         {getDaysUntilText(task.days_until)}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Recent Activity */}
//         <div className="activity-section-new">
//           <div className="section-header">
//             <h2>🔔 Recent Activity</h2>
//           </div>

//           {!analytics.recent_activities || analytics.recent_activities.length === 0 ? (
//             <div className="no-activity">
//               <span className="no-activity-icon">📭</span>
//               <p>No recent activity. Start working on tasks!</p>
//             </div>
//           ) : (
//             <div className="activity-list">
//               {analytics.recent_activities.map((activity, index) => (
//                 <div
//                   key={index}
//                   className="activity-item-new"
//                   onClick={() => navigate(`/projects/${activity.project_id}`)}
//                 >
//                   <div className={`activity-status-badge ${activity.status.toLowerCase().replace(' ', '-')}`}>
//                     {activity.status}
//                   </div>
//                   <div className="activity-content-new">
//                     <h4>{activity.title}</h4>
//                     <div className="activity-meta-new">
//                       <span className={`priority-text ${getPriorityClass(activity.priority)}`}>
//                         {activity.priority}
//                       </span>
//                       <span className="activity-project-new">📁 {activity.project_name}</span>
//                       <span className="activity-time-new">{getTimeAgo(activity.updated_at)}</span>
//                     </div>
//                   </div>
//                   <div className="activity-arrow-new">→</div>
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

import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./DashboardPage.css";
import Loader from "../../components/Loader/Loader";
import TaskStatusChart from "../../components/Charts/TaskStatusChart";
import TaskPriorityChart from "../../components/Charts/TaskPriorityChart";
import ProjectProgressChart from "../../components/Charts/ProjectProgressChart";
import TaskStatsCard from "../../components/Charts/TaskStatsCard";
import { exportToPDF, exportToExcel, exportToCSV } from "../../utils/exportUtils";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [analytics, setAnalytics] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [exportLoading, setExportLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [analyticsData, reportData] = await Promise.all([
        dashboardAPI.getAnalytics(),
        dashboardAPI.getReport()
      ]);

      if (analyticsData.success) {
        setAnalytics(analyticsData.analytics);
      }
      
      if (reportData.success) {
        setReport(reportData.report);
      }
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    if (!analytics) return;
    setExportLoading(true);
    try {
      exportToPDF(analytics, user?.name || "User");
    } catch (err) {
      console.error("Failed to export PDF:", err);
      alert("Failed to export PDF: " + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportExcel = () => {
    if (!analytics) return;
    setExportLoading(true);
    try {
      exportToExcel(analytics, report, user?.name || "User");
    } catch (err) {
      console.error("Failed to export Excel:", err);
      alert("Failed to export Excel: " + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!analytics) return;
    setExportLoading(true);
    try {
      exportToCSV(analytics, user?.name || "User");
    } catch (err) {
      console.error("Failed to export CSV:", err);
      alert("Failed to export CSV: " + err.message);
    } finally {
      setExportLoading(false);
    }
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return "";
    
    const past = new Date(timestamp);
    const now = new Date();
    
    if (isNaN(past.getTime())) {
      return "Unknown time";
    }

    const diffMs = now.getTime() - past.getTime();
    if (diffMs < 0) return "Just now";

    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 10) return "Just now";
    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}w ago`;
    }

    return past.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: past.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const getPriorityClass = (priority) => {
    if (!priority) return "low";
    return priority.toLowerCase();
  };

  const getDaysUntilText = (daysUntil) => {
    if (daysUntil < 0) {
      return `${Math.abs(daysUntil)} days overdue`;
    } else if (daysUntil === 0) {
      return "Due today";
    } else if (daysUntil === 1) {
      return "Due tomorrow";
    } else {
      return `${daysUntil} days left`;
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="error-container">
            <h2>⚠️ Error Loading Dashboard</h2>
            <p>{error}</p>
            <button onClick={fetchDashboardData} className="btn-retry">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="error-container">
            <h2>No Data Available</h2>
            <p>Unable to load dashboard data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header with Export Buttons */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>📊 Dashboard</h1>
            <p className="dashboard-subtitle">
              Welcome back, {user?.name || "User"}! Here's your workspace overview
            </p>
          </div>
          <div className="export-buttons">
            <button
              onClick={handleExportPDF}
              disabled={exportLoading}
              className="btn-export btn-export-pdf"
              title="Download as PDF"
              aria-label="Export dashboard as PDF"
            >
              📄 PDF
            </button>
            <button
              onClick={handleExportExcel}
              disabled={exportLoading}
              className="btn-export btn-export-excel"
              title="Download as Excel"
              aria-label="Export dashboard as Excel"
            >
              📊 Excel
            </button>
            <button
              onClick={handleExportCSV}
              disabled={exportLoading}
              className="btn-export btn-export-csv"
              title="Download as CSV"
              aria-label="Export dashboard as CSV"
            >
              📋 CSV
            </button>
          </div>
        </div>

        {/* Task Statistics Cards */}
        <TaskStatsCard stats={analytics.task_stats} />

        {/* Project Statistics Cards */}
        <div className="project-stats-cards">
          <div 
            className="project-stat-card project-stat-card-total" 
            onClick={() => navigate("/projects")}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && navigate("/projects")}
          >
            <div className="pstat-icon pstat-icon-blue">
              📊
            </div>
            <div className="pstat-content">
              <div className="pstat-value">{analytics.project_stats.total}</div>
              <div className="pstat-label">Total Projects</div>
            </div>
          </div>
          
          <div 
            className="project-stat-card project-stat-card-owned"
            role="button"
            tabIndex={0}
          >
            <div className="pstat-icon pstat-icon-green">
              👑
            </div>
            <div className="pstat-content">
              <div className="pstat-value">{analytics.project_stats.owned}</div>
              <div className="pstat-label">Owned Projects</div>
            </div>
          </div>
          
          <div 
            className="project-stat-card project-stat-card-member"
            role="button"
            tabIndex={0}
          >
            <div className="pstat-icon pstat-icon-purple">
              👥
            </div>
            <div className="pstat-content">
              <div className="pstat-value">{analytics.project_stats.member_of}</div>
              <div className="pstat-label">Member Of</div>
            </div>
          </div>
          
          <div 
            className="project-stat-card project-stat-card-active"
            role="button"
            tabIndex={0}
          >
            <div className="pstat-icon pstat-icon-success">
              ✅
            </div>
            <div className="pstat-content">
              <div className="pstat-value">{analytics.project_stats.active}</div>
              <div className="pstat-label">Active Projects</div>
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="charts-grid">
          <TaskStatusChart data={analytics.status_distribution} />
          <TaskPriorityChart data={analytics.priority_distribution} />
        </div>

        {/* Project Progress Chart */}
        <ProjectProgressChart data={analytics.project_progress} />

        {/* Upcoming Deadlines */}
        <div className="deadlines-section-new">
          <div className="section-header">
            <h2>📅 Upcoming Deadlines</h2>
            <span className="deadline-count">{analytics.upcoming_deadlines.length} tasks</span>
          </div>

          {analytics.upcoming_deadlines.length === 0 ? (
            <div className="no-deadlines">
              <span className="no-deadlines-icon">🎉</span>
              <p>No upcoming deadlines! You're all caught up.</p>
            </div>
          ) : (
            <div className="deadlines-list">
              {analytics.upcoming_deadlines.map((task, index) => (
                <div
                  key={index}
                  className={`deadline-item ${task.days_until < 0 ? 'overdue' : task.days_until === 0 ? 'today' : ''}`}
                  onClick={() => navigate(`/projects/${task.project_id}/tasks`)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && navigate(`/projects/${task.project_id}/tasks`)}
                >
                  <div className="deadline-left">
                    <span className={`priority-badge ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                    <div className="deadline-info">
                      <h4>{task.title}</h4>
                      <p className="deadline-project">📁 {task.project_name}</p>
                    </div>
                  </div>
                  <div className="deadline-right">
                    <div className="deadline-date">
                      <span className="date-text">
                        {new Date(task.due_date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <span className={`days-until ${task.days_until < 0 ? 'overdue' : ''}`}>
                        {getDaysUntilText(task.days_until)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="activity-section-new">
          <div className="section-header">
            <h2>🔔 Recent Activity</h2>
          </div>

          {!analytics.recent_activities || analytics.recent_activities.length === 0 ? (
            <div className="no-activity">
              <span className="no-activity-icon">📭</span>
              <p>No recent activity. Start working on tasks!</p>
            </div>
          ) : (
            <div className="activity-list">
              {analytics.recent_activities.map((activity, index) => (
                <div
                  key={index}
                  className="activity-item-new"
                  onClick={() => navigate(`/projects/${activity.project_id}/tasks`)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === 'Enter' && navigate(`/projects/${activity.project_id}/tasks`)}
                >
                  <div className={`activity-status-badge ${activity.status.toLowerCase().replace(' ', '-')}`}>
                    {activity.status}
                  </div>
                  <div className="activity-content-new">
                    <h4>{activity.title}</h4>
                    <div className="activity-meta-new">
                      <span className={`priority-text ${getPriorityClass(activity.priority)}`}>
                        {activity.priority}
                      </span>
                      <span className="activity-project-new">📁 {activity.project_name}</span>
                      <span className="activity-time-new">{getTimeAgo(activity.updated_at)}</span>
                    </div>
                  </div>
                  <div className="activity-arrow-new">→</div>
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