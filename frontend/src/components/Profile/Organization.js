import React, { useState, useEffect } from "react";
import "./ProfileSections.css";

const Organization = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    employee_id: "",
    department: "",
    joinDate: "",
    workEmail: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        role: data.role || "",
        employee_id: data.employee_id || "",
        department: data.department || "",
        joinDate: data.joinDate || "",
        workEmail: data.workEmail || ""
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await onUpdate(formData);
      setMessage({ type: "success", text: "✅ Organization details updated successfully!" });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update organization details" });
    } finally {
      setLoading(false);
    }
  };

  const hasData = data && (data.name || data.role || data.employee_id);

  return (
    <div className="profile-section">
      <div className="section-header">
        <div>
          <h2>Organization</h2>
          <p>Add your current employment information</p>
        </div>
        {!isEditing && (
          <button
            className="btn-edit"
            onClick={() => setIsEditing(true)}
          >
            ✏️ {hasData ? "Edit" : "Add Details"}
          </button>
        )}
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {!isEditing && !hasData ? (
        <div className="empty-state">
          <span className="empty-icon">🏢</span>
          <p>No organization details added yet</p>
          <button className="btn-add-inline" onClick={() => setIsEditing(true)}>
            ➕ Add organization details
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Organization Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="e.g., Tech Solutions Inc."
              />
            </div>

            <div className="form-group">
              <label>Role/Position *</label>
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="e.g., Software Engineer"
              />
            </div>

            <div className="form-group">
              <label>Employee ID</label>
              <input
                type="text"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="EMP12345"
              />
            </div>

            <div className="form-group">
              <label>Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="e.g., Engineering, IT, HR"
              />
            </div>

            <div className="form-group">
              <label>Join Date</label>
              <input
                type="month"
                name="joinDate"
                value={formData.joinDate}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Work Email</label>
              <input
                type="email"
                name="workEmail"
                value={formData.workEmail}
                onChange={handleChange}
                disabled={!isEditing}
                className="form-input"
                placeholder="you@company.com"
              />
            </div>
          </div>

          {isEditing && (
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: data.name || "",
                    role: data.role || "",
                    employee_id: data.employee_id || "",
                    department: data.department || "",
                    joinDate: data.joinDate || "",
                    workEmail: data.workEmail || ""
                  });
                }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-save"
                disabled={loading}
              >
                {loading ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          )}
        </form>
      )}

      {!isEditing && hasData && (
        <div className="organization-summary">
          <div className="summary-card">
            <div className="summary-icon">🏢</div>
            <div className="summary-content">
              <h4>{formData.name}</h4>
              <p className="summary-role">{formData.role}</p>
              {formData.department && (
                <p className="summary-detail">📂 {formData.department}</p>
              )}
              {formData.employee_id && (
                <p className="summary-detail">🆔 {formData.employee_id}</p>
              )}
              {formData.joinDate && (
                <p className="summary-detail">
                  📅 Joined {new Date(formData.joinDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              )}
              {formData.workEmail && (
                <p className="summary-detail">✉️ {formData.workEmail}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Organization;
