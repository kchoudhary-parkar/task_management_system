import React, { useState, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { taskAPI } from "../../services/api";
import "./TaskDetailModal.css";

function TaskDetailModal({ task, onClose, onUpdate, isOwner }) {
  const { user } = useContext(AuthContext);
  const [status, setStatus] = useState(task.status);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  // State for adding new items
  const [labelInput, setLabelInput] = useState("");
  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [linkType, setLinkType] = useState("blocks");
  const [linkedTicketId, setLinkedTicketId] = useState("");
  
  // Local state for task data
  const [taskData, setTaskData] = useState(task);

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
    setSuccess("");

    try {
      await onUpdate(task._id, {
        status: newStatus,
        comment: comment.trim() || undefined,
      });
      setSuccess(`Task status updated to ${newStatus}!`);
      // Modal will auto-close via parent component
    } catch (err) {
      setError(err.message || "Failed to update task");
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
    setSuccess("");

    try {
      await onUpdate(task._id, {
        comment: comment.trim(),
      });
      setSuccess("Comment added successfully!");
      setComment("");
      // Modal will auto-close via parent component
    } catch (err) {
      setError(err.message || "Failed to add comment");
      setLoading(false);
    }
  };

  const handleAddLabel = async () => {
    const label = labelInput.trim().toLowerCase();
    if (!label) return;

    if (label.length > 30) {
      setError("Label must be 30 characters or less");
      return;
    }

    if (!/^[a-z0-9\-_\/]+$/.test(label)) {
      setError("Label can only contain letters, numbers, hyphens, underscores, and slashes");
      return;
    }

    if (taskData.labels && taskData.labels.includes(label)) {
      setError("Label already added");
      return;
    }

    try {
      setError("");
      await taskAPI.addLabel(task._id, label);
      const updatedLabels = [...(taskData.labels || []), label];
      setTaskData({ ...taskData, labels: updatedLabels });
      setLabelInput("");
      setSuccess("Label added!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message || "Failed to add label");
    }
  };

  const handleRemoveLabel = async (label) => {
    try {
      setError("");
      await taskAPI.removeLabel(task._id, label);
      const updatedLabels = taskData.labels.filter(l => l !== label);
      setTaskData({ ...taskData, labels: updatedLabels });
      setSuccess("Label removed!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message || "Failed to remove label");
    }
  };

  const handleAddAttachment = async () => {
    if (!attachmentName.trim() || !attachmentUrl.trim()) {
      setError("Both name and URL are required");
      return;
    }

    if (!attachmentUrl.startsWith("http://") && !attachmentUrl.startsWith("https://")) {
      setError("URL must start with http:// or https://");
      return;
    }

    try {
      setError("");
      await taskAPI.addAttachment(task._id, {
        name: attachmentName.trim(),
        url: attachmentUrl.trim()
      });
      const newAttachment = {
        name: attachmentName.trim(),
        url: attachmentUrl.trim(),
        added_by_name: user.name,
        added_at: new Date().toISOString()
      };
      const updatedAttachments = [...(taskData.attachments || []), newAttachment];
      setTaskData({ ...taskData, attachments: updatedAttachments });
      setAttachmentName("");
      setAttachmentUrl("");
      setSuccess("Attachment added!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message || "Failed to add attachment");
    }
  };

  const handleRemoveAttachment = async (url) => {
    try {
      setError("");
      await taskAPI.removeAttachment(task._id, url);
      const updatedAttachments = taskData.attachments.filter(a => a.url !== url);
      setTaskData({ ...taskData, attachments: updatedAttachments });
      setSuccess("Attachment removed!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message || "Failed to remove attachment");
    }
  };

  const handleAddLink = async () => {
    if (!linkedTicketId.trim()) {
      setError("Ticket ID is required");
      return;
    }

    try {
      setError("");
      await taskAPI.addLink(task._id, {
        type: linkType,
        linked_ticket_id: linkedTicketId.trim().toUpperCase()
      });
      const newLink = {
        type: linkType,
        linked_ticket_id: linkedTicketId.trim().toUpperCase()
      };
      const updatedLinks = [...(taskData.links || []), newLink];
      setTaskData({ ...taskData, links: updatedLinks });
      setLinkedTicketId("");
      setSuccess("Link added!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message || "Failed to add link");
    }
  };

  const handleRemoveLink = async (linkedTicketId) => {
    try {
      setError("");
      await taskAPI.removeLink(task._id, linkedTicketId);
      const updatedLinks = taskData.links.filter(l => l.linked_ticket_id !== linkedTicketId);
      setTaskData({ ...taskData, links: updatedLinks });
      setSuccess("Link removed!");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      setError(err.message || "Failed to remove link");
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

  const getIssueTypeIcon = (issueType) => {
    switch (issueType) {
      case "bug": return "🐛";
      case "task": return "✅";
      case "story": return "📖";
      case "epic": return "🎯";
      default: return "✅";
    }
  };

  const getIssueTypeColor = (issueType) => {
    switch (issueType) {
      case "bug": return "#ef4444";
      case "task": return "#3b82f6";
      case "story": return "#8b5cf6";
      case "epic": return "#f97316";
      default: return "#3b82f6";
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content task-detail-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-content">
            {task.ticket_id && (
              <span className="task-detail-ticket-id">{task.ticket_id}</span>
            )}
            <h2>{task.title}</h2>
          </div>
          <button onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="modal-body">
          <div className="task-info-section">
            <div className="info-row">
              <span className="info-label">Issue Type:</span>
              <span 
                className="issue-type-badge" 
                style={{ backgroundColor: getIssueTypeColor(task.issue_type || "task") }}
              >
                {getIssueTypeIcon(task.issue_type || "task")} {(task.issue_type || "task").charAt(0).toUpperCase() + (task.issue_type || "task").slice(1)}
              </span>
            </div>
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

          {taskData.description && (
            <div className="description-section">
              <h3>Description</h3>
              <p>{taskData.description}</p>
            </div>
          )}

          <div className="labels-section">
            <h3>Labels</h3>
            <div className="labels-input-group">
              <input
                type="text"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddLabel()}
                placeholder="Add label (e.g., frontend, bug-fix)"
                className="label-input"
              />
              <button onClick={handleAddLabel} className="btn-add-label">
                Add
              </button>
            </div>
            {taskData.labels && taskData.labels.length > 0 && (
              <div className="labels-container">
                {taskData.labels.map((label) => (
                  <span key={label} className="label-badge-detail">
                    {label}
                    {isOwner && (
                      <button 
                        onClick={() => handleRemoveLabel(label)} 
                        className="label-remove"
                      >
                        ×
                      </button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="attachments-section">
            <h3>Attachments</h3>
            <div className="attachment-input-group">
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="Attachment name"
                className="attachment-input"
              />
              <input
                type="url"
                value={attachmentUrl}
                onChange={(e) => setAttachmentUrl(e.target.value)}
                placeholder="https://example.com/file.pdf"
                className="attachment-input"
              />
              <button onClick={handleAddAttachment} className="btn-add-attachment">
                Add
              </button>
            </div>
            {taskData.attachments && taskData.attachments.length > 0 && (
              <div className="attachments-list">
                {taskData.attachments.map((attachment, index) => (
                  <div key={index} className="attachment-item">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" className="attachment-link">
                      <span className="attachment-icon">📎</span>
                      <span className="attachment-name">{attachment.name}</span>
                    </a>
                    <span className="attachment-meta">
                      Added by {attachment.added_by_name}
                    </span>
                    {isOwner && (
                      <button 
                        onClick={() => handleRemoveAttachment(attachment.url)} 
                        className="attachment-remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="links-section">
            <h3>Linked Tickets</h3>
            <div className="link-input-group">
              <select
                value={linkType}
                onChange={(e) => setLinkType(e.target.value)}
                className="link-type-select"
              >
                <option value="blocks">Blocks</option>
                <option value="blocked-by">Blocked by</option>
                <option value="relates-to">Relates to</option>
                <option value="duplicates">Duplicates</option>
              </select>
              <input
                type="text"
                value={linkedTicketId}
                onChange={(e) => setLinkedTicketId(e.target.value)}
                placeholder="Ticket ID (e.g., TMS-002)"
                className="link-input"
              />
              <button onClick={handleAddLink} className="btn-add-link">
                Add Link
              </button>
            </div>
            {taskData.links && taskData.links.length > 0 && (
              <div className="links-list">
                {taskData.links.map((link, index) => (
                  <div key={index} className="link-item">
                    <span className="link-type">{link.type}</span>
                    <span className="link-ticket">{link.linked_ticket_id}</span>
                    {isOwner && (
                      <button 
                        onClick={() => handleRemoveLink(link.linked_ticket_id)} 
                        className="link-remove"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {canChangeStatus && (
            <div className="status-change-section">
              <h3>Update Status</h3>
              {task.status === "Done" ? (
                <p className="status-complete-message">✅ Task is marked as complete</p>
              ) : (
                <>
                  <div className="status-buttons">
                    {["To Do", "In Progress", "Testing", "Incomplete", "Done"].map((s) => (
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
            {success && <div className="success-message">{success}</div>}

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

          {/* Submit/Close Button */}
          <div className="modal-footer">
            <button onClick={handleAddComment} className="btn btn-primary btn-submit">
              ✓ Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
