import React, { useState, useEffect, useCallback } from "react";
import { memberAPI, userAPI } from "../../services/api";
import "./MemberManager.css";

function MemberManager({ projectId, isOwner }) {
  const [members, setMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);

  const fetchMembers = useCallback(async () => {
    try {
      setLoading(true);
      setError(""); // Clear any previous errors
      const data = await memberAPI.getMembers(projectId);
      setMembers(data.members || []);
    } catch (err) {
      console.error("Error fetching members:", err);
      // Don't show error for empty member list
      if (!err.message.includes("Not Found")) {
        setError(err.message || "Failed to load team members");
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Search users by email
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    setError("");

    if (query.length < 2) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearching(true);
      const data = await userAPI.searchByEmail(query);
      setSearchResults(data.users || []);
      setShowSearchResults(true);
    } catch (err) {
      setError(err.message || "Failed to search users");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAddMember = async (user) => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");
      await memberAPI.addMember(projectId, user.email);
      setSuccess(`${user.name} added successfully!`);
      setSearchQuery("");
      setSearchResults([]);
      setShowSearchResults(false);
      await fetchMembers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to add member");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      await memberAPI.removeMember(projectId, userId);
      setSuccess("Member removed successfully!");
      await fetchMembers();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to remove member");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="member-manager">
      <div className="member-manager-header">
        <h3>Project Members ({members.length})</h3>
      </div>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}

      {isOwner && (
        <div className="add-member-form">
          <div className="search-container">
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search user by email..."
              disabled={loading}
            />
            {searching && <span className="search-loading">Searching...</span>}
          </div>
          
          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((user) => (
                <div key={user._id} className="search-result-item">
                  <div className="search-user-info">
                    <div className="search-user-avatar">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <strong>{user.name}</strong>
                      <p>{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddMember(user)}
                    className="btn btn-add"
                    disabled={loading}
                  >
                    Add
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {showSearchResults && searchResults.length === 0 && !searching && (
            <div className="no-results">No users found</div>
          )}
        </div>
      )}

      {loading && members.length === 0 ? (
        <p className="loading-text">Loading members...</p>
      ) : (
        <div className="members-list">
          {members.length === 0 ? (
            <p className="no-members">No members added yet.</p>
          ) : (
            members.map((member) => (
              <div key={member.user_id} className="member-item">
                <div className="member-info">
                  <div className="member-avatar">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="member-details">
                    <h4>{member.name}</h4>
                    <p>{member.email}</p>
                    <span className="member-added-date">
                      Added {new Date(member.added_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {isOwner && (
                  <button
                    onClick={() => handleRemoveMember(member.user_id)}
                    className="btn-remove"
                    disabled={loading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default MemberManager;
