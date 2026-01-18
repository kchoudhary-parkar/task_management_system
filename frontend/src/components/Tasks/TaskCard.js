import React from "react";
import "./TaskCard.css";

function TaskCard({ task, onEdit, onDelete, onClick, isOwner = false }) {
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
        return "#22c55e";
      case "In Progress":
        return "#3b82f6";
      case "Testing":
        return "#f59e0b";
      case "Incomplete":
        return "#ef4444";
      case "To Do":
        return "#94a3b8";
      default:
        return "#94a3b8";
    }
  };

  const getIssueTypeIcon = (issueType) => {
    switch (issueType) {
      case "bug":
        return "🐛";
      case "task":
        return "✅";
      case "story":
        return "📖";
      case "epic":
        return "🎯";
      default:
        return "✅";
    }
  };

  const getIssueTypeColor = (issueType) => {
    switch (issueType) {
      case "bug":
        return "#ef4444";
      case "task":
        return "#3b82f6";
      case "story":
        return "#8b5cf6";
      case "epic":
        return "#f97316";
      default:
        return "#3b82f6";
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

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-card-header">
        <div className="task-header-left">
          {task.ticket_id && (
            <span className="task-ticket-id">{task.ticket_id}</span>
          )}
          <h4 className="task-title tcolor">{task.title}</h4>
        </div>
        {isOwner && (
          <div className="task-actions" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => onEdit(task)} className="btn-icon" title="Edit">
              ✏️
            </button>
            <button type="button" onClick={() => onDelete(task._id)} className="btn-icon" title="Delete">
              🗑️
            </button>
          </div>
        )}
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-meta">
        <span
          className="task-issue-type"
          style={{ backgroundColor: getIssueTypeColor(task.issue_type || "task") }}
        >
          {getIssueTypeIcon(task.issue_type || "task")} {(task.issue_type || "task").charAt(0).toUpperCase() + (task.issue_type || "task").slice(1)}
        </span>
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

      {task.labels && task.labels.length > 0 && (
        <div className="task-labels">
          {task.labels.map((label) => (
            <span key={label} className="task-label">
              {label}
            </span>
          ))}
        </div>
      )}

      <div className="task-footer">
        <div className="task-assignee">
          <span className="assignee-icon">👤</span>
          <span>{task.assignee_name || "Unassigned"}</span>
        </div>
        <div className="task-creator">
          <span className="creator-icon">✍️</span>
          <span>By: {task.created_by_name || "Unknown"}</span>
        </div>
        <div className="task-due-date">
          <span className="date-icon">📅</span>
          <span>{formatDate(task.due_date)}</span>
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
