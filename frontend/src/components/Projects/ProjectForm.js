import React, { useState, useEffect } from "react";
import "./ProjectForm.css";

function ProjectForm({ onSubmit, onCancel, initialData = null }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (name.trim().length < 3) {
      setError("Project name must be at least 3 characters");
      return;
    }

    onSubmit({ name: name.trim(), description: description.trim() });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{initialData ? "Edit Project" : "Create New Project"}</h2>
          <button type="button" onClick={onCancel} className="btn-close">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="project-form">
          <div className="form-group">
            <label htmlFor="name">Project Name *</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter project name"
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
              placeholder="Enter project description (optional)"
              rows="4"
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProjectForm;
