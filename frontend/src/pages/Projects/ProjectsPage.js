// // import React, { useState, useEffect } from "react";
// // import { projectAPI } from "../../services/api";
// // import { ProjectCard, ProjectForm } from "../../components/Projects";
// // import "./ProjectsPage.css";

// // function ProjectsPage() {
// //   const [projects, setProjects] = useState([]);
// //   const [loading, setLoading] = useState(true);
// //   const [error, setError] = useState("");
// //   const [success, setSuccess] = useState("");
// //   const [showForm, setShowForm] = useState(false);
// //   const [editingProject, setEditingProject] = useState(null);

// //   useEffect(() => {
// //     fetchProjects();
// //   }, []);

// //   const fetchProjects = async () => {
// //     try {
// //       setLoading(true);
// //       setError("");
// //       const data = await projectAPI.getAll();
// //       setProjects(data.projects || []);
// //     } catch (err) {
// //       setError(err.message || "Failed to load projects");
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   const handleCreateProject = async (projectData) => {
// //     try {
// //       setError("");
// //       setSuccess("");
// //       await projectAPI.create(projectData);
// //       setSuccess("Project created successfully!");
// //       setShowForm(false);
// //       fetchProjects();
// //       setTimeout(() => setSuccess(""), 3000);
// //     } catch (err) {
// //       setError(err.message || "Failed to create project");
// //     }
// //   };

// //   const handleUpdateProject = async (projectData) => {
// //     try {
// //       setError("");
// //       setSuccess("");
// //       await projectAPI.update(editingProject._id, projectData);
// //       setSuccess("Project updated successfully!");
// //       setShowForm(false);
// //       setEditingProject(null);
// //       fetchProjects();
// //       setTimeout(() => setSuccess(""), 3000);
// //     } catch (err) {
// //       setError(err.message || "Failed to update project");
// //     }
// //   };

// //   const handleDeleteProject = async (projectId) => {
// //     if (!window.confirm("Are you sure you want to delete this project?")) {
// //       return;
// //     }

// //     try {
// //       setError("");
// //       setSuccess("");
// //       await projectAPI.delete(projectId);
// //       setSuccess("Project deleted successfully!");
// //       fetchProjects();
// //       setTimeout(() => setSuccess(""), 3000);
// //     } catch (err) {
// //       setError(err.message || "Failed to delete project");
// //     }
// //   };

// //   const handleEditProject = (project) => {
// //     setEditingProject(project);
// //     setShowForm(true);
// //   };

// //   const handleCloseForm = () => {
// //     setShowForm(false);
// //     setEditingProject(null);
// //   };

// //   if (loading) {
// //     return (
// //       <div className="projects-page">
// //         <div className="loading">Loading projects...</div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="projects-page">
// //       <div className="projects-header">
// //         <h1>My Projects</h1>
// //         <button onClick={() => setShowForm(true)} className="btn btn-create">
// //           + New Project
// //         </button>
// //       </div>

// //       {error && <div className="alert alert-error">{error}</div>}
// //       {success && <div className="alert alert-success">{success}</div>}

// //       <div className="projects-stats">
// //         <p>Total Projects: <strong>{projects.length}</strong></p>
// //       </div>

// //       {projects.length === 0 ? (
// //         <div className="empty-state">
// //           <h2>No Projects Yet</h2>
// //           <p>Create your first project to get started!</p>
// //           <button onClick={() => setShowForm(true)} className="btn btn-primary">
// //             Create Project
// //           </button>
// //         </div>
// //       ) : (
// //         <div className="projects-list">
// //           {projects.map((project) => (
// //             <ProjectCard
// //               key={project._id}
// //               project={project}
// //               onDelete={handleDeleteProject}
// //               onEdit={handleEditProject}
// //             />
// //           ))}
// //         </div>
// //       )}

// //       {showForm && (
// //         <ProjectForm
// //           onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
// //           onCancel={handleCloseForm}
// //           initialData={editingProject}
// //         />
// //       )}
// //     </div>
// //   );
// // }

// // export default ProjectsPage;


import React, { useState, useEffect, useContext } from "react";
import { projectAPI } from "../../services/api";
import { ProjectCard, ProjectForm } from "../../components/Projects";
import { AuthContext } from "../../context/AuthContext";
import "./ProjectsPage.css";

function ProjectsPage() {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const canCreateProject = user?.role === "admin" || user?.role === "super-admin";

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await projectAPI.getAll();
      setProjects(data.projects || []);
    } catch (err) {
      setError(err.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      setError("");
      setSuccess("");
      await projectAPI.create(projectData);
      setSuccess("Project created successfully!");
      setShowForm(false);
      fetchProjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to create project");
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      setError("");
      setSuccess("");
      await projectAPI.update(editingProject._id, projectData);
      setSuccess("Project updated successfully!");
      setShowForm(false);
      setEditingProject(null);
      fetchProjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to update project");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }

    try {
      setError("");
      setSuccess("");
      await projectAPI.delete(projectId);
      setSuccess("Project deleted successfully!");
      fetchProjects();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to delete project");
    }
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProject(null);
  };

  if (loading) {
    return (
      <div className="projects-page projects-page-center">
        <div className="glass-panel loading-panel">
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-page">
      <div className="projects-bg" />

      <header className="projects-header">
        <div className="projects-title-block">
          <h1>My Projects</h1>
          <p>{canCreateProject ? "Projects you own and projects you're a member of." : "Projects you're a member of and working on"}</p>
        </div>

        <div className="projects-header-actions">
          <div className="projects-stat-chip">
            <span className="stat-label">Total</span>
            <span className="stat-value">{projects.length}</span>
          </div>
          {canCreateProject && (
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary btn-create"
            >
              + New Project
            </button>
          )}
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {projects.length === 0 ? (
        <div className="empty-state glass-panel">
          <h2>{canCreateProject ? "No Projects Yet" : "You are not working on any of the project"}</h2>
          {canCreateProject && (
            <>
              <p>Create your first project to get started.</p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Create Project
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="projects-layout">
          <section className="projects-list glass-panel">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onDelete={handleDeleteProject}
                onEdit={handleEditProject}
              />
            ))}
          </section>
        </div>
      )}

      {showForm && (
        <ProjectForm
          onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
          onCancel={handleCloseForm}
          initialData={editingProject}
        />
      )}
    </div>
  );
}

export default ProjectsPage;

// // Enhanced ProjectsPage.js - Compatible with Global Theme (No Local Theme State)

// import React, { useState, useEffect } from "react";
// import { projectAPI } from "../../services/api";
// import { ProjectCard, ProjectForm } from "../../components/Projects";
// import "./ProjectsPage.css";

// function ProjectsPage() {
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");
//   const [showForm, setShowForm] = useState(false);
//   const [editingProject, setEditingProject] = useState(null);

//   // 🔥 NO LOCAL THEME STATE - Uses global theme from App.js
//   // Theme is automatically applied via CSS data-theme attribute

//   useEffect(() => {
//     fetchProjects();
//   }, []);

//   const fetchProjects = async () => {
//     try {
//       setLoading(true);
//       setError("");
//       const data = await projectAPI.getAll();
//       setProjects(data.projects || []);
//     } catch (err) {
//       setError(err.message || "Failed to load projects");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCreateProject = async (projectData) => {
//     try {
//       setError("");
//       setSuccess("");
//       await projectAPI.create(projectData);
//       setSuccess("Project created successfully! ✨");
//       setShowForm(false);
//       fetchProjects();
//       setTimeout(() => setSuccess(""), 4000);
//     } catch (err) {
//       setError(err.message || "Failed to create project");
//     }
//   };

//   const handleUpdateProject = async (projectData) => {
//     try {
//       setError("");
//       setSuccess("");
//       await projectAPI.update(editingProject._id, projectData);
//       setSuccess("Project updated successfully! ✅");
//       setShowForm(false);
//       setEditingProject(null);
//       fetchProjects();
//       setTimeout(() => setSuccess(""), 4000);
//     } catch (err) {
//       setError(err.message || "Failed to update project");
//     }
//   };

//   const handleDeleteProject = async (projectId) => {
//     if (!window.confirm("Are you sure you want to delete this project? All tasks will be lost.")) {
//       return;
//     }

//     try {
//       setError("");
//       setSuccess("");
//       await projectAPI.delete(projectId);
//       setSuccess("Project deleted successfully! 🗑️");
//       fetchProjects();
//       setTimeout(() => setSuccess(""), 4000);
//     } catch (err) {
//       setError(err.message || "Failed to delete project");
//     }
//   };

//   const handleEditProject = (project) => {
//     setEditingProject(project);
//     setShowForm(true);
//   };

//   const handleCloseForm = () => {
//     setShowForm(false);
//     setEditingProject(null);
//   };

//   if (loading) {
//     return (
//       <div className="projects-page projects-page-center">
//         <div className="glass-panel loading-panel animate-pulse">
//           <div className="loading-spinner"></div>
//           <p>Loading your projects...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="projects-page">
//       {/* Enhanced Background */}
//       <div className="projects-bg-gradient" />
      
//       {/* Enhanced Header */}
//       <header className="projects-header">
//         <div className="projects-title-block">
//           <div className="title-with-icon">📁</div>
//           <div>
//             <h1>My Projects</h1>
//             <p className="header-subtitle">
//               {projects.length} project{projects.length !== 1 ? 's' : ''} • Manage your work here
//             </p>
//           </div>
//         </div>

//         <div className="projects-header-actions">
//           <div className="projects-stat-chip glass-chip">
//             <span className="stat-icon">📊</span>
//             <span className="stat-value">{projects.length}</span>
//             <span className="stat-label">Total</span>
//           </div>
//           <button
//             onClick={() => setShowForm(true)}
//             className="btn btn-primary btn-create glass-btn"
//             aria-label="Create new project"
//           >
//             <span className="btn-icon">+</span>
//             New Project
//           </button>
//         </div>
//       </header>

//       {/* Enhanced Alerts */}
//       {error && (
//         <div className="alert alert-error glass-alert slide-in">
//           <span className="alert-icon">⚠️</span>
//           {error}
//           <button 
//             className="alert-close" 
//             onClick={() => setError("")}
//             aria-label="Dismiss error"
//           >
//             ×
//           </button>
//         </div>
//       )}
      
//       {success && (
//         <div className="alert alert-success glass-alert slide-in">
//           <span className="alert-icon">✅</span>
//           {success}
//           <button 
//             className="alert-close" 
//             onClick={() => setSuccess("")}
//             aria-label="Dismiss success message"
//           >
//             ×
//           </button>
//         </div>
//       )}

//       {/* Enhanced Empty State */}
//       {projects.length === 0 ? (
//         <div className="empty-state glass-panel elevate-hover">
//           <div className="empty-icon">📂</div>
//           <h2>No Projects Yet</h2>
//           <p>Create your first project to get started with task management.</p>
//           <div className="empty-actions">
//             <button
//               onClick={() => setShowForm(true)}
//               className="btn btn-primary glass-btn"
//             >
//               Create First Project
//             </button>
//           </div>
//         </div>
//       ) : (
//         <div className="projects-layout">
//           <section className="projects-list glass-panel">
//             <div className="projects-grid">
//               {projects.map((project) => (
//                 <ProjectCard
//                   key={project._id}
//                   project={project}
//                   onDelete={handleDeleteProject}
//                   onEdit={handleEditProject}
//                 />
//               ))}
//             </div>
//           </section>
//         </div>
//       )}

//       {/* Enhanced Modal Form */}
//       {showForm && (
//         <div className="modal-overlay" onClick={handleCloseForm}>
//           <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
//             <div className="modal-header">
//               <h3>{editingProject ? 'Edit Project' : 'New Project'}</h3>
//               <button 
//                 className="modal-close" 
//                 onClick={handleCloseForm}
//                 aria-label="Close modal"
//               >
//                 ×
//               </button>
//             </div>
//             <ProjectForm
//               onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
//               onCancel={handleCloseForm}
//               initialData={editingProject}
//             />
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default ProjectsPage;
