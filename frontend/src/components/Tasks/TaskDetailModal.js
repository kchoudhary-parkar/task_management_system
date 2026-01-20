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
  const [attachmentType, setAttachmentType] = useState("link");
  const [selectedFile, setSelectedFile] = useState(null);
  const [linkType, setLinkType] = useState("blocks");
  const [linkedTicketId, setLinkedTicketId] = useState("");
  
  // Local state for task data
  const [taskData, setTaskData] = useState(task);

  // Determine if user can change status
  const canChangeStatus = isOwner || (task.assignee_id === user?.id);
  
  // Check if task is unassigned and user is a member (not owner)
  const showAcceptTicket = !isOwner && !task.assignee_id;

  const handleAcceptTicket = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await taskAPI.update(task._id, { assignee_id: user.id });
      setSuccess("Ticket accepted! You are now assigned to this task.");
      setTimeout(() => {
        onUpdate(task._id, { assignee_id: user.id, assignee_name: user.name });
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to accept ticket");
      setLoading(false);
    }
  };

  const handleApproveTask = async () => {
    if (!window.confirm("Are you sure you want to approve and close this task?")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await taskAPI.approveTask(task._id);
      setSuccess("Task approved and closed successfully!");
      setTimeout(() => {
        onUpdate(task._id, { status: "Closed" });
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message || "Failed to approve task");
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (newStatus === "Done" && !comment.trim()) {
      setError("Please add a comment describing what you completed");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await taskAPI.updateStatus(task._id, newStatus, comment);
      setStatus(newStatus);
      setComment("");
      setSuccess("Status updated successfully!");
      setTimeout(() => {
        setSuccess("");
        onUpdate(task._id, { status: newStatus });
        if (newStatus === "Done" || newStatus === "Closed") {
          onClose();
        }
      }, 1000);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to update status");
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
      await taskAPI.addComment(task._id, comment);
      const newActivity = {
        action: "comment",
        user_name: user.name,
        comment: comment,
        timestamp: new Date().toISOString()
      };
      const updatedActivities = [...(taskData.activities || []), newActivity];
      setTaskData({ ...taskData, activities: updatedActivities });
      setComment("");
      setSuccess("Comment added!");
      setTimeout(() => setSuccess(""), 2000);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to add comment");
      setLoading(false);
    }
  };

  const handleAddLabel = async () => {
    if (!labelInput.trim()) return;

    try {
      setError("");
      await taskAPI.addLabel(task._id, labelInput.trim());
      const updatedLabels = [...(taskData.labels || []), labelInput.trim()];
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

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError("File size must be less than 10MB");
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("File type not supported. Please upload PDF, Excel, CSV, Word, or image files.");
      return;
    }

    setSelectedFile(file);
    setError("");
  };

  const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAddAttachment = async () => {
    if (!attachmentName.trim()) {
      setError("Attachment name is required");
      return;
    }

    let attachmentData = {
      name: attachmentName.trim()
    };

    try {
      setError("");
      setLoading(true);

      if (attachmentType === "link") {
        if (!attachmentUrl.trim()) {
          setError("URL is required for link attachments");
          setLoading(false);
          return;
        }

        if (!attachmentUrl.startsWith("http://") && !attachmentUrl.startsWith("https://")) {
          setError("URL must start with http:// or https://");
          setLoading(false);
          return;
        }

        attachmentData.url = attachmentUrl.trim();
      } else {
        if (!selectedFile) {
          setError("Please select a file to upload");
          setLoading(false);
          return;
        }

        const base64 = await convertFileToBase64(selectedFile);
        attachmentData.url = base64;
        attachmentData.fileName = selectedFile.name;
        attachmentData.fileType = selectedFile.type;
        attachmentData.fileSize = selectedFile.size;
      }

      await taskAPI.addAttachment(task._id, attachmentData);
      
      const newAttachment = {
        ...attachmentData,
        added_by_name: user.name,
        added_at: new Date().toISOString()
      };
      
      const updatedAttachments = [...(taskData.attachments || []), newAttachment];
      setTaskData({ ...taskData, attachments: updatedAttachments });
      
      setAttachmentName("");
      setAttachmentUrl("");
      setSelectedFile(null);
      setAttachmentType("link");
      
      const fileInput = document.getElementById('file-upload-input');
      if (fileInput) fileInput.value = '';
      
      setSuccess("Attachment added!");
      setTimeout(() => setSuccess(""), 2000);
      setLoading(false);
    } catch (err) {
      setError(err.message || "Failed to add attachment");
      setLoading(false);
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

  const handleRemoveLink = async (linkedTicketId, linkType) => {
    try {
      setError("");
      await taskAPI.removeLink(task._id, linkedTicketId, linkType);
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
          <button type="button" onClick={onClose} className="btn-close">✕</button>
        </div>

        <div className="modal-body">
          {showAcceptTicket ? (
            <div className="unassigned-task-view">
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
              </div>

              <div className="task-description-section">
                <h3>Description</h3>
                <p className="task-description">{task.description || "No description provided"}</p>
              </div>

              {error && <div className="error-message">{error}</div>}
              {success && <div className="success-message">{success}</div>}

              <div className="accept-ticket-section">
                <button
                  onClick={handleAcceptTicket}
                  disabled={loading}
                  className="btn btn-primary accept-ticket-btn"
                >
                  {loading ? "Accepting..." : "Accept This Ticket"}
                </button>
                <p className="accept-info">
                  Click to accept this ticket and it will be assigned to you. You'll then have full access to all task details.
                </p>
              </div>
            </div>
          ) : (
            <>
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
              {isOwner && status === "Done" && (
                <button 
                  className="btn-approve-task" 
                  onClick={handleApproveTask}
                  disabled={loading}
                >
                  ✓ Approve & Close
                </button>
              )}
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
              <button type="button" onClick={handleAddLabel} className="btn-add-label">
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
                        type="button"
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
              <select
                value={attachmentType}
                onChange={(e) => {
                  setAttachmentType(e.target.value);
                  setAttachmentUrl("");
                  setSelectedFile(null);
                  setError("");
                }}
                className="attachment-type-select"
              >
                <option value="link">Link</option>
                <option value="document">Document (PDF, Excel, CSV, Word, Images)</option>
              </select>
              
              <input
                type="text"
                value={attachmentName}
                onChange={(e) => setAttachmentName(e.target.value)}
                placeholder="Attachment name"
                className="attachment-input"
              />
              
              {attachmentType === "link" ? (
                <input
                  type="url"
                  value={attachmentUrl}
                  onChange={(e) => setAttachmentUrl(e.target.value)}
                  placeholder="https://example.com/file.pdf"
                  className="attachment-input"
                />
              ) : (
                <div className="file-upload-container">
                  <input
                    type="file"
                    id="file-upload-input"
                    onChange={handleFileSelect}
                    accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp"
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="file-upload-input" className="file-upload-btn">
                    {selectedFile ? selectedFile.name : "Choose File"}
                  </label>
                </div>
              )}
              
              <button type="button" onClick={handleAddAttachment} className="btn-add-attachment" disabled={loading}>
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
            {taskData.attachments && taskData.attachments.length > 0 && (
              <div className="attachments-list">
                {taskData.attachments.map((attachment, index) => {
                  const isDocument = attachment.url.startsWith('data:');
                  const fileIcon = isDocument ? '📄' : '🔗';
                  
                  return (
                    <div key={index} className="attachment-item">
                      {isDocument ? (
                        <a
                          href={attachment.url}
                          download={attachment.fileName || attachment.name}
                          className="attachment-link"
                        >
                          <span className="attachment-icon">{fileIcon}</span>
                          <span className="attachment-name">{attachment.name}</span>
                          {attachment.fileSize && (
                            <span className="file-size-badge">
                              ({(attachment.fileSize / 1024).toFixed(2)} KB)
                            </span>
                          )}
                        </a>
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="attachment-link"
                        >
                          <span className="attachment-icon">{fileIcon}</span>
                          <span className="attachment-name">{attachment.name}</span>
                        </a>
                      )}
                      <span className="attachment-meta">
                        Added by {attachment.added_by_name}
                      </span>
                      {isOwner && (
                        <button                          type="button"                          onClick={() => handleRemoveAttachment(attachment.url)}
                          className="btn-remove-attachment"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  );
                })}
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
                        onClick={() => handleRemoveLink(link.linked_ticket_id, link.type)} 
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

          <div className="activity-section">
            <h3>Activity</h3>
            {canChangeStatus && (
              <div className="add-comment-section">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="comment-textarea"
                  disabled={loading}
                />
                <button
                  type="button"
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
                          Changed status from <strong>{activity.old_status}</strong> to <strong>{activity.new_status}</strong>
                        </p>
                        {activity.comment && (
                          <p className="activity-comment">💬 {activity.comment}</p>
                        )}
                      </div>
                    )}
                    {activity.action === "comment" && (
                      <div className="activity-content">
                        <p className="activity-comment">💬 {activity.comment}</p>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="no-activity">No activity yet</p>
              )}
            </div>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskDetailModal;
