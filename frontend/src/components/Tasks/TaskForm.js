import React, { useState, useEffect } from "react";
import "./TaskForm.css";

function TaskForm({ onSubmit, onCancel, initialData = null, members = [] }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [issueType, setIssueType] = useState("task");
  const [priority, setPriority] = useState("Medium");
  const [status, setStatus] = useState("To Do");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [labels, setLabels] = useState([]);
  const [labelInput, setLabelInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description || "");
      setIssueType(initialData.issue_type || "task");
      setPriority(initialData.priority || "Medium");
      setStatus(initialData.status || "To Do");
      setAssigneeId(initialData.assignee_id || "");
      setDueDate(initialData.due_date || "");
      setLabels(initialData.labels || []);
    }
  }, [initialData]);

  const handleAddLabel = (e) => {
    e.preventDefault();
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
    
    if (labels.includes(label)) {
      setError("Label already added");
      return;
    }
    
    setLabels([...labels, label]);
    setLabelInput("");
    setError("");
  };

  const handleRemoveLabel = (labelToRemove) => {
    setLabels(labels.filter(l => l !== labelToRemove));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (title.trim().length < 3) {
      setError("Task title must be at least 3 characters");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      issue_type: issueType,
      priority,
      status,
      assignee_id: assigneeId || null,
      due_date: dueDate || null,
      labels: labels,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content task-form-modal">
        <div className="modal-header">
          <h2>{initialData ? "Edit Task" : "Create New Task"}</h2>
          <button onClick={onCancel} className="btn-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form">
          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description (optional)"
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="issueType">Issue Type</label>
              <select
                id="issueType"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
              >
                <option value="task">✅ Task</option>
                <option value="bug">🐛 Bug</option>
                <option value="story">📖 Story</option>
                <option value="epic">🎯 Epic</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Testing">Testing</option>
                <option value="Incomplete">Incomplete</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="assignee">Assign To</label>
              <select
                id="assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
              >
                <option value="">Unassigned</option>
                {members.map((member) => (
                  <option key={member.user_id} value={member.user_id}>
                    {member.name} ({member.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="labels">Labels (optional)</label>
            <div className="label-input-container">
              <input
                type="text"
                id="labels"
                value={labelInput}
                onChange={(e) => setLabelInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleAddLabel(e);
                  }
                }}
                placeholder="Type label and press Enter"
                maxLength={30}
              />
              <button type="button" onClick={handleAddLabel} className="btn-add-label">
                + Add
              </button>
            </div>
            {labels.length > 0 && (
              <div className="labels-list">
                {labels.map((label) => (
                  <span key={label} className="label-badge">
                    {label}
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(label)}
                      className="label-remove"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? "Update Task" : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TaskForm;
