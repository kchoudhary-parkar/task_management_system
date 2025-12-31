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

  return (
    <div className="task-card" onClick={onClick}>
      <div className="task-card-header">
        <h4 className="task-title">{task.title}</h4>
        {isOwner && (
          <div className="task-actions" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => onEdit(task)} className="btn-icon" title="Edit">
              ✏️
            </button>
            <button onClick={() => onDelete(task._id)} className="btn-icon" title="Delete">
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

      <div className="task-footer">
        <div className="task-assignee">
          <span className="assignee-icon">👤</span>
          <span>{task.assignee_name || "Unassigned"}</span>
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
