import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./TaskDetailModal.css";

function TaskDetailModal({ task, onClose, onUpdate, isOwner }) {
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState(task.status);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isAssignedToMe = task.assignee_id === user?.id;
  const canChangeStatus = isOwner || isAssignedToMe;

  const handleStatusChange = async (newStatus) => {
    // If marking as Done, require comment
    if (newStatus === "Done" && !comment.trim()) {
      setError("Please add a comment describing what you completed");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onUpdate(task._id, {
        status: newStatus,
        comment: comment.trim() || undefined,
      });
      setStatus(newStatus);
      setComment("");
    } catch (err) {
      setError(err.message || "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      setError("Comment cannot be empty");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await onUpdate(task._id, {
        comment: comment.trim(),
      });
      setComment("");
    } catch (err) {
      setError(err.message || "Failed to add comment");
    } finally {
      setLoading(false);
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

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High": return "#f44336";
      case "Medium": return "#ff9800";
      case "Low": return "#4caf50";
      default: return "#999";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task.title}</h2>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="modal-body">
          <div className="task-info-section">
            <div className="info-row">
              <span className="info-label">Status:</span>
              <span className={`status-badge ${status.toLowerCase().replace(' ', '-')}`}>
                {status}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Priority:</span>
              <span className="priority-badge" style={{ backgroundColor: getPriorityColor(task.priority) }}>
                {task.priority}
              </span>
            </div>
            <div className="info-row">
              <span className="info-label">Assigned to:</span>
              <span>{task.assignee_name || "Unassigned"}</span>
            </div>
            <div className="info-row">
              <span className="info-label">Due Date:</span>
              <span>{formatDate(task.due_date)}</span>
            </div>
          </div>

          {task.description && (
            <div className="description-section">
              <h3>Description</h3>
              <p>{task.description}</p>
            </div>
          )}

          {canChangeStatus && (
            <div className="status-change-section">
              <h3>Update Status</h3>
              {status === "Done" ? (
                <p className="status-complete-message">✅ Task is marked as complete</p>
              ) : (
                <>
                  <div className="status-buttons">
                    {["To Do", "In Progress", "Done"].map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(s)}
                        className={`status-btn ${status === s ? 'active' : ''}`}
                        disabled={loading}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                  {status !== task.status && (
                    <div className="comment-required-section">
                      <label>
                        {status === "Done" ? "Comment (Required)" : "Add a comment (Optional)"}
                      </label>
                      <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder={
                          status === "Done"
                            ? "Describe what you completed..."
                            : "Add any updates or notes..."
                        }
                        rows="3"
                        className="comment-textarea"
                      />
                      <button
                        onClick={() => handleStatusChange(status)}
                        disabled={loading || (status === "Done" && !comment.trim())}
                        className="btn btn-primary"
                      >
                        {loading ? "Updating..." : `Change Status to ${status}`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="comments-section">
            <h3>Activity & Comments</h3>
            
            {canChangeStatus && (
              <div className="add-comment">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  rows="2"
                  className="comment-textarea"
                />
                <button
                  onClick={handleAddComment}
                  disabled={loading || !comment.trim()}
                  className="btn btn-secondary"
                >
                  {loading ? "Adding..." : "Add Comment"}
                </button>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <div className="activities-list">
              {task.activities && task.activities.length > 0 ? (
                [...task.activities].reverse().map((activity, index) => (
                  <div key={index} className="activity-item">
                    <div className="activity-header">
                      <span className="activity-user">👤 {activity.user_name}</span>
                      <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                    </div>
                    {activity.action === "status_change" && (
                      <div className="activity-content">
                        <p className="activity-action">
                          Changed status from <strong>{activity.old_value}</strong> to <strong>{activity.new_value}</strong>
                        </p>
                        {activity.comment && (
                          <p className="activity-comment">{activity.comment}</p>
                        )}
                      </div>
                    )}
                    {activity.action === "comment" && (
                      <div className="activity-content">
                        <p className="activity-comment">{activity.comment}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-activities">No activity yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
