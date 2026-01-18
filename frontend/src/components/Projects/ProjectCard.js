import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./ProjectCard.css";

function ProjectCard({ project, onDelete, onEdit }) {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  // Check if current user is the project owner
  const isOwner = project.owner_id === user?.id || project.user_id === user?.id || project.is_owner;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="project-card">
      <div className="project-card-header">
        <div className="project-title-row">
          <div className="project-title-with-prefix">
            {project.prefix && (
              <span className="project-prefix">{project.prefix}</span>
            )}
            <h3>{project.name}</h3>
          </div>
          <span className={`role-badge ${isOwner ? 'owner' : 'member'}`}>
            {isOwner ? '👑 Owner' : '👤 Member'}
          </span>
        </div>
        {isOwner && (
          <div className="project-card-actions">
            <button type="button" onClick={() => onEdit(project)} className="btn-edit" title="Edit">
              ✏️
            </button>
            <button type="button" onClick={() => onDelete(project._id)} className="btn-delete" title="Delete">
              🗑️
            </button>
          </div>
        )}
      </div>
      <p className="project-description">
        {project.description || "No description provided"}
      </p>
      <div className="project-card-footer">
        <small>Created: {formatDate(project.created_at)}</small>
        <button 
          onClick={() => navigate(`/projects/${project._id}/tasks`)} 
          className="btn-view-tasks"
        >
          View Tasks →
        </button>
      </div>
    </div>
  );
}

export default ProjectCard;
