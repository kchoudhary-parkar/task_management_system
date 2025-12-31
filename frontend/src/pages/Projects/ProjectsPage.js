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
//       setSuccess("Project created successfully!");
//       setShowForm(false);
//       fetchProjects();
//       setTimeout(() => setSuccess(""), 3000);
//     } catch (err) {
//       setError(err.message || "Failed to create project");
//     }
//   };

//   const handleUpdateProject = async (projectData) => {
//     try {
//       setError("");
//       setSuccess("");
//       await projectAPI.update(editingProject._id, projectData);
//       setSuccess("Project updated successfully!");
//       setShowForm(false);
//       setEditingProject(null);
//       fetchProjects();
//       setTimeout(() => setSuccess(""), 3000);
//     } catch (err) {
//       setError(err.message || "Failed to update project");
//     }
//   };

//   const handleDeleteProject = async (projectId) => {
//     if (!window.confirm("Are you sure you want to delete this project?")) {
//       return;
//     }

//     try {
//       setError("");
//       setSuccess("");
//       await projectAPI.delete(projectId);
//       setSuccess("Project deleted successfully!");
//       fetchProjects();
//       setTimeout(() => setSuccess(""), 3000);
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
//       <div className="projects-page">
//         <div className="loading">Loading projects...</div>
//       </div>
//     );
//   }

//   return (
//     <div className="projects-page">
//       <div className="projects-header">
//         <h1>My Projects</h1>
//         <button onClick={() => setShowForm(true)} className="btn btn-create">
//           + New Project
//         </button>
//       </div>

//       {error && <div className="alert alert-error">{error}</div>}
//       {success && <div className="alert alert-success">{success}</div>}

//       <div className="projects-stats">
//         <p>Total Projects: <strong>{projects.length}</strong></p>
//       </div>

//       {projects.length === 0 ? (
//         <div className="empty-state">
//           <h2>No Projects Yet</h2>
//           <p>Create your first project to get started!</p>
//           <button onClick={() => setShowForm(true)} className="btn btn-primary">
//             Create Project
//           </button>
//         </div>
//       ) : (
//         <div className="projects-list">
//           {projects.map((project) => (
//             <ProjectCard
//               key={project._id}
//               project={project}
//               onDelete={handleDeleteProject}
//               onEdit={handleEditProject}
//             />
//           ))}
//         </div>
//       )}

//       {showForm && (
//         <ProjectForm
//           onSubmit={editingProject ? handleUpdateProject : handleCreateProject}
//           onCancel={handleCloseForm}
//           initialData={editingProject}
//         />
//       )}
//     </div>
//   );
// }

// export default ProjectsPage;


import React, { useState, useEffect } from "react";
import { projectAPI } from "../../services/api";
import { ProjectCard, ProjectForm } from "../../components/Projects";
import "./ProjectsPage.css";

function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

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
          <p>Organize and track work across your Mini Jira workspace.</p>
        </div>

        <div className="projects-header-actions">
          <div className="projects-stat-chip">
            <span className="stat-label">Total</span>
            <span className="stat-value">{projects.length}</span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary btn-create"
          >
            + New Project
          </button>
        </div>
      </header>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {projects.length === 0 ? (
        <div className="empty-state glass-panel">
          <h2>No Projects Yet</h2>
          <p>Create your first project to get started.</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Create Project
          </button>
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
