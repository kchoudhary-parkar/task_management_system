import React, { useState } from "react";
import "./ProfileSections.css";

const Education = ({ data, onUpdate }) => {
  const [educationList, setEducationList] = useState(data || []);
  const [showForm, setShowForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    type: "SSC",
    institution: "",
    board: "",
    yearOfPassing: "",
    percentage: "",
    stream: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      let updated;
      if (editingIndex !== null) {
        updated = [...educationList];
        updated[editingIndex] = formData;
      } else {
        updated = [...educationList, formData];
      }

      await onUpdate(updated);
      setEducationList(updated);
      setMessage({ type: "success", text: "✅ Education details saved successfully!" });
      resetForm();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to save education details" });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (index) => {
    setFormData(educationList[index]);
    setEditingIndex(index);
    setShowForm(true);
  };

  const handleDelete = async (index) => {
    if (!window.confirm("Are you sure you want to delete this education entry?")) return;

    try {
      const updated = educationList.filter((_, i) => i !== index);
      await onUpdate(updated);
      setEducationList(updated);
      setMessage({ type: "success", text: "✅ Education entry deleted!" });
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to delete entry" });
    }
  };

  const resetForm = () => {
    setFormData({
      type: "SSC",
      institution: "",
      board: "",
      yearOfPassing: "",
      percentage: "",
      stream: ""
    });
    setShowForm(false);
    setEditingIndex(null);
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <div>
          <h2>Education</h2>
          <p>Add your educational qualifications</p>
        </div>
        {!showForm && (
          <button className="btn-add" onClick={() => setShowForm(true)}>
            ➕ Add Education
          </button>
        )}
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="profile-form education-form">
          <h3>{editingIndex !== null ? "Edit Education" : "Add New Education"}</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Education Level *</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="form-input"
                required
              >
                <option value="SSC">SSC (10th)</option>
                <option value="HSC">HSC (12th)</option>
                <option value="Diploma">Diploma</option>
                <option value="Bachelor">Bachelor's Degree</option>
                <option value="Master">Master's Degree</option>
                <option value="PhD">PhD</option>
              </select>
            </div>

            <div className="form-group">
              <label>Institution Name *</label>
              <input
                type="text"
                name="institution"
                value={formData.institution}
                onChange={handleChange}
                className="form-input"
                placeholder="School/College/University name"
                required
              />
            </div>

            <div className="form-group">
              <label>Board/University *</label>
              <input
                type="text"
                name="board"
                value={formData.board}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., CBSE, State Board, University name"
                required
              />
            </div>

            <div className="form-group">
              <label>Year of Passing *</label>
              <input
                type="number"
                name="yearOfPassing"
                value={formData.yearOfPassing}
                onChange={handleChange}
                className="form-input"
                placeholder="2020"
                min="1950"
                max="2030"
                required
              />
            </div>

            <div className="form-group">
              <label>Percentage/CGPA *</label>
              <input
                type="text"
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., 85% or 8.5 CGPA"
                required
              />
            </div>

            {(formData.type === "HSC" || formData.type === "Bachelor" || formData.type === "Master") && (
              <div className="form-group">
                <label>Stream/Specialization</label>
                <input
                  type="text"
                  name="stream"
                  value={formData.stream}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="e.g., Science, Commerce, Computer Engineering"
                />
              </div>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={resetForm}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-save" disabled={loading}>
              {loading ? "Saving..." : "💾 Save"}
            </button>
          </div>
        </form>
      )}

      <div className="education-list">
        {educationList.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🎓</span>
            <p>No education details added yet</p>
            <button className="btn-add-inline" onClick={() => setShowForm(true)}>
              ➕ Add your first education entry
            </button>
          </div>
        ) : (
          educationList.map((edu, index) => (
            <div key={index} className="education-card">
              <div className="card-header">
                <div className="card-icon">🎓</div>
                <div className="card-title">
                  <h4>{edu.type}</h4>
                  <span className="card-year">{edu.yearOfPassing}</span>
                </div>
                <div className="card-actions">
                  <button
                    className="btn-icon"
                    onClick={() => handleEdit(index)}
                    title="Edit"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => handleDelete(index)}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              <div className="card-body">
                <p className="institution">{edu.institution}</p>
                <p className="board">{edu.board}</p>
                {edu.stream && <p className="stream">Stream: {edu.stream}</p>}
                <p className="percentage">Score: {edu.percentage}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Education;
