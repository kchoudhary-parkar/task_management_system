import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { userAPI } from "../../services/api";
import "./UsersPage.css";
import Loader from "../../components/Loader/Loader";

const UsersPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    superAdmins: 0,
    admins: 0,
    members: 0,
  });

  const isSuperAdmin = user?.role === "super-admin";
  const isAdmin = user?.role === "admin" || user?.role === "super-admin";

  useEffect(() => {
    if (!isAdmin) {
      navigate("/");
      return;
    }
    fetchUsers();
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await userAPI.getAllUsers();
      const usersList = response.users || [];
      setUsers(usersList);

      // Calculate stats
      setStats({
        total: usersList.length,
        superAdmins: usersList.filter((u) => u.role === "super-admin").length,
        admins: usersList.filter((u) => u.role === "admin").length,
        members: usersList.filter((u) => u.role === "member").length,
      });
    } catch (err) {
      console.error("Failed to fetch users:", err);
      setError(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!isSuperAdmin) {
      alert("Only super-admins can change user roles");
      return;
    }

    if (!window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      await userAPI.updateUserRole(userId, newRole);
      // Refresh users list
      fetchUsers();
    } catch (err) {
      console.error("Failed to update role:", err);
      alert(err.message || "Failed to update user role");
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case "super-admin":
        return "role-badge super-admin";
      case "admin":
        return "role-badge admin";
      case "member":
        return "role-badge member";
      default:
        return "role-badge";
    }
  };

  if (loading) {
    return <div className="users-page"><Loader /></div>;
  }

  if (error) {
    return <div className="users-page"><div className="error-message">{error}</div></div>;
  }

  return (
    <div className="users-page">
      <div className="users-header">
        <h1>👥 User Management</h1>
        <p className="users-subtitle">
          {isSuperAdmin ? "Manage user roles and permissions" : "View all users"}
        </p>
      </div>

      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-value">{stats.total}</div>
          <div className="stat-label">Total Users</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.superAdmins}</div>
          <div className="stat-label">Super Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.admins}</div>
          <div className="stat-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.members}</div>
          <div className="stat-label">Members</div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="no-users">No users found</div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                {isSuperAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className={u.id === user?.id ? "current-user" : ""}>
                  <td>
                    {u.name}
                    {u.id === user?.id && <span className="you-badge">YOU</span>}
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <span className={getRoleBadgeClass(u.role)}>
                      {u.role === "super-admin" ? "Super Admin" : u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                    </span>
                  </td>
                  {isSuperAdmin && (
                    <td>
                      {u.id === user?.id ? (
                        <span className="text-muted">Cannot modify yourself</span>
                      ) : u.role === "super-admin" ? (
                        <span className="text-muted">Cannot modify super-admin</span>
                      ) : (
                        <div className="action-buttons">
                          {u.role === "member" && (
                            <button
                              className="btn-promote"
                              onClick={() => handleRoleChange(u.id, "admin")}
                            >
                              Promote to Admin
                            </button>
                          )}
                          {u.role === "admin" && (
                            <button
                              className="btn-demote"
                              onClick={() => handleRoleChange(u.id, "member")}
                            >
                              Demote to Member
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
