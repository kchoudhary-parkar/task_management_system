import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { projectAPI, taskAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalProjects: 0,
    myTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [projectsData, tasksData] = await Promise.all([
        projectAPI.getAll(),
        taskAPI.getMyTasks(),
      ]);

      const projects = projectsData.projects || [];
      const tasks = tasksData.tasks || [];

      setStats({
        totalProjects: projects.length,
        myTasks: tasks.length,
        completedTasks: tasks.filter((t) => t.status === "Done").length,
        pendingTasks: tasks.filter((t) => t.status !== "Done").length,
      });
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-container">
          <p className="loading-text">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name}! </h1>
          <p className="dashboard-subtitle">Here's an overview of your work</p>
        </div>

        <div className="dashboard-cards">
          <div
            className="dashboard-card projects-card"
            onClick={() => navigate("/projects")}
          >
            <div className="card-icon">📁</div>
            <div className="card-content">
              <h2>My Projects</h2>
              <p className="card-count">{stats.totalProjects}</p>
              <p className="card-description">
                View and manage all your projects
              </p>
            </div>
            <div className="card-arrow">→</div>
          </div>

          <div
            className="dashboard-card tasks-card"
            onClick={() => navigate("/my-tasks")}
          >
            <div className="card-icon">✅</div>
            <div className="card-content">
              <h2>Tasks Assigned to Me</h2>
              <p className="card-count">{stats.myTasks}</p>
              <p className="card-description">
                Tasks you need to work on
              </p>
            </div>
            <div className="card-arrow">→</div>
          </div>
        </div>

        <div className="stats-cards">
          <div className="stat-card pending">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <p className="stat-label">Pending Tasks</p>
              <p className="stat-value">{stats.pendingTasks}</p>
            </div>
          </div>

          <div className="stat-card completed">
            <div className="stat-icon">✨</div>
            <div className="stat-info">
              <p className="stat-label">Completed Tasks</p>
              <p className="stat-value">{stats.completedTasks}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
