import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { taskAPI } from "../../services/api";
import "./MyTasksPage.css";

function MyTasksPage() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await taskAPI.getMyTasks();
      setTasks(data.tasks || []);
    } catch (err) {
      setError(err.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#f44336";
      case "Medium":
        return "#ff9800";
      case "Low":
        return "#4caf50";
      default:
        return "#999";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Done":
        return "#4caf50";
      case "In Progress":
        return "#2196f3";
      case "To Do":
        return "#999";
      default:
        return "#999";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const filteredTasks =
    statusFilter === "All"
      ? tasks
      : tasks.filter((task) => task.status === statusFilter);

  if (loading) {
    return (
      <div className="my-tasks-page">
        <p className="loading-text">Loading your tasks...</p>
      </div>
    );
  }

  return (
    <div className="my-tasks-page">
      <div className="my-tasks-container">
        <div className="my-tasks-header">
          <button onClick={() => navigate("/")} className="btn-back">
            ← Back to Dashboard
          </button>
          <h1>Tasks Assigned to Me</h1>
          <p className="tasks-subtitle">All tasks assigned to you across all projects</p>
        </div>

        {error && <p className="error-message">{error}</p>}

        <div className="tasks-filters">
          <div className="filter-buttons">
            {["All", "To Do", "In Progress", "Done"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`filter-btn ${
                  statusFilter === status ? "active" : ""
                }`}
              >
                {status}
                {status === "All" && ` (${tasks.length})`}
                {status !== "All" &&
                  ` (${tasks.filter((t) => t.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="my-tasks-grid">
          {filteredTasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks assigned to you yet</p>
              {statusFilter !== "All" && (
                <button
                  onClick={() => setStatusFilter("All")}
                  className="btn btn-secondary"
                >
                  View All Tasks
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div key={task._id} className="my-task-card">
                <div className="task-card-header">
                  <h3>{task.title}</h3>
                  <div className="task-meta">
                    <span
                      className="task-priority"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                    <span
                      className="task-status"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </span>
                  </div>
                </div>

                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}

                <div className="task-details">
                  <div className="task-detail-item">
                    <span className="detail-icon">📁</span>
                    <div className="detail-content">
                      <span className="detail-label">Project</span>
                      <span className="detail-value">{task.project_name || "Unknown Project"}</span>
                    </div>
                  </div>

                  <div className="task-detail-item">
                    <span className="detail-icon">👤</span>
                    <div className="detail-content">
                      <span className="detail-label">Assigned by</span>
                      <span className="detail-value">{task.created_by_name || "Project Owner"}</span>
                    </div>
                  </div>

                  <div className="task-detail-item">
                    <span className="detail-icon">📅</span>
                    <div className="detail-content">
                      <span className="detail-label">Due Date</span>
                      <span className="detail-value">{formatDate(task.due_date)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/projects/${task.project_id}/tasks`)}
                  className="btn-view-project"
                >
                  View in Project →
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MyTasksPage;
