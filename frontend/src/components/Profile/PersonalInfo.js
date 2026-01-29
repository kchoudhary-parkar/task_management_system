// import React, { useState, useEffect } from "react";
// import "./ProfileSections.css";

// const PersonalInfo = ({ data, user, onUpdate }) => {
//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     mobile: "",
//     address: "",
//     city: "",
//     country: ""
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState({ type: "", text: "" });

//   useEffect(() => {
//     if (data) {
//       setFormData({
//         mobile: data.mobile || "",
//         address: data.address || "",
//         city: data.city || "",
//         country: data.country || ""
//       });
//     }
//   }, [data]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage({ type: "", text: "" });

//     try {
//       await onUpdate(formData);
//       setMessage({ type: "success", text: "✅ Personal information updated successfully!" });
//       setIsEditing(false);
//       setTimeout(() => setMessage({ type: "", text: "" }), 3000);
//     } catch (err) {
//       setMessage({ type: "error", text: err.message || "Failed to update information" });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="profile-section">
//       <div className="section-header">
//         <div>
//           <h2>Personal Information</h2>
//           <p>Manage your personal details and contact information</p>
//         </div>
//         {!isEditing && (
//           <button
//             className="btn-edit"
//             onClick={() => setIsEditing(true)}
//           >
//             ✏️ Edit
//           </button>
//         )}
//       </div>

//       {message.text && (
//         <div className={`message ${message.type}`}>
//           {message.text}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} className="profile-form">
//         <div className="form-grid">
//           <div className="form-group">
//             <label>Full Name</label>
//             <input
//               type="text"
//               value={user?.name || ""}
//               disabled
//               className="form-input disabled"
//             />
//             <small className="form-hint">Name cannot be changed here</small>
//           </div>

//           <div className="form-group">
//             <label>Email Address</label>
//             <input
//               type="email"
//               value={user?.email || ""}
//               disabled
//               className="form-input disabled"
//             />
//             <small className="form-hint">Email cannot be changed here</small>
//           </div>

//           <div className="form-group">
//             <label>Mobile Number *</label>
//             <input
//               type="tel"
//               name="mobile"
//               value={formData.mobile}
//               onChange={handleChange}
//               disabled={!isEditing}
//               className="form-input"
//               placeholder="+1 234 567 8900"
//             />
//           </div>

//           <div className="form-group">
//             <label>Country *</label>
//             <input
//               type="text"
//               name="country"
//               value={formData.country}
//               onChange={handleChange}
//               disabled={!isEditing}
//               className="form-input"
//               placeholder="e.g., United States"
//             />
//           </div>

//           <div className="form-group full-width">
//             <label>Address *</label>
//             <textarea
//               name="address"
//               value={formData.address}
//               onChange={handleChange}
//               disabled={!isEditing}
//               className="form-input"
//               rows="3"
//               placeholder="Street address, building number, etc."
//             />
//           </div>

//           <div className="form-group">
//             <label>City *</label>
//             <input
//               type="text"
//               name="city"
//               value={formData.city}
//               onChange={handleChange}
//               disabled={!isEditing}
//               className="form-input"
//               placeholder="e.g., New York"
//             />
//           </div>
//         </div>

//         {isEditing && (
//           <div className="form-actions">
//             <button
//               type="button"
//               className="btn-cancel"
//               onClick={() => {
//                 setIsEditing(false);
//                 setFormData({
//                   mobile: data.mobile || "",
//                   address: data.address || "",
//                   city: data.city || "",
//                   country: data.country || ""
//                 });
//               }}
//               disabled={loading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="btn-save"
//               disabled={loading}
//             >
//               {loading ? "Saving..." : "💾 Save Changes"}
//             </button>
//           </div>
//         )}
//       </form>
//     </div>
//   );
// };

// export default PersonalInfo;
// Updated PersonalInfo.js
import React, { useState, useEffect } from "react";
import "./ProfileSections.css";
import { Pencil, Save } from 'lucide-react';

const PersonalInfo = ({ data, user, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    mobile: "",
    address: "",
    city: "",
    country: ""
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (data) {
      setFormData({
        mobile: data.mobile || "",
        address: data.address || "",
        city: data.city || "",
        country: data.country || ""
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
      setMessage({ type: "success", text: "Personal information updated successfully!" });
      setIsEditing(false);
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (err) {
      setMessage({ type: "error", text: err.message || "Failed to update information" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-section">
      <div className="section-header">
        <div>
          <h2>Personal Information</h2>
          <p>Manage your personal details and contact information</p>
        </div>
        {!isEditing && (
          <button
            className="btn-edit"
            onClick={() => setIsEditing(true)}
            aria-label="Edit personal information"
          >
            <Pencil className="btn-icon-text" size={16} />
            Edit
          </button>
        )}
      </div>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              value={user?.name || ""}
              disabled
              className="form-input disabled"
              aria-label="Full name (read-only)"
            />
            <small className="form-hint">Name cannot be changed here</small>
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={user?.email || ""}
              disabled
              className="form-input disabled"
              aria-label="Email address (read-only)"
            />
            <small className="form-hint">Email cannot be changed here</small>
          </div>

          <div className="form-group">
            <label htmlFor="mobile">Mobile Number *</label>
            <input
              id="mobile"
              type="tel"
              name="mobile"
              value={formData.mobile}
              onChange={handleChange}
              disabled={!isEditing}
              className="form-input"
              placeholder="+1 234 567 8900"
              aria-label="Mobile number"
            />
          </div>

          <div className="form-group">
            <label htmlFor="country">Country *</label>
            <input
              id="country"
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              disabled={!isEditing}
              className="form-input"
              placeholder="e.g., United States"
              aria-label="Country"
            />
          </div>

          <div className="form-group full-width">
            <label htmlFor="address">Address *</label>
            <textarea
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              disabled={!isEditing}
              className="form-input"
              rows="3"
              placeholder="Street address, building number, etc."
              aria-label="Address"
            />
          </div>

          <div className="form-group">
            <label htmlFor="city">City *</label>
            <input
              id="city"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              disabled={!isEditing}
              className="form-input"
              placeholder="e.g., New York"
              aria-label="City"
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
                  mobile: data.mobile || "",
                  address: data.address || "",
                  city: data.city || "",
                  country: data.country || ""
                });
              }}
              disabled={loading}
              aria-label="Cancel editing"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-save"
              disabled={loading}
              aria-label="Save changes"
            >
              {loading ? (
                <>
                  <span className="btn-spinner"></span>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="btn-icon-text" size={16} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PersonalInfo;