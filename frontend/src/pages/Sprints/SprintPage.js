import React, { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { projectAPI } from "../../services/api";
import { getProjectSprints, createSprint, startSprint, completeSprint, deleteSprint, addTaskToSprint } from "../../services/sprintAPI";
import { getBacklogTasks, getAvailableSprintTasks } from "../../services/sprintAPI";
import { AuthContext } from "../../context/AuthContext";
import "./SprintPage.css";
import SprintForm from "../../components/Sprints/SprintForm";
import SprintList from "../../components/Sprints/SprintList";
import BacklogView from "../../components/Sprints/BacklogView";
import Loader from "../../components/Loader/Loader";

const SprintPage = () => {
  const { projectId } = useParams();
  const { user } = useContext(AuthContext);
  const [project, setProject] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [backlogTasks, setBacklogTasks] = useState([]); // Tasks moved from completed sprints
  const [availableTasks, setAvailableTasks] = useState([]); // Tasks available to add to sprints
  const [showSprintForm, setShowSprintForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch all data in parallel for faster loading
      const [projectData, sprintsData, backlogData, availableData] = await Promise.all([
        projectAPI.getById(projectId),
        getProjectSprints(projectId),
        getBacklogTasks(projectId),
        getAvailableSprintTasks(projectId)
      ]);

      // Set project details
      setProject(projectData.project);
      
      // Check if current user is owner
      const owner = projectData.project.owner_id === user.id || 
                     projectData.project.user_id === user.id ||
                     projectData.project.is_owner === true;
      setIsOwner(owner);

      // Set sprints, backlog, and available tasks
      setSprints(sprintsData.sprints || []);
      setBacklogTasks(backlogData.tasks || []);
      setAvailableTasks(availableData.tasks || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async (sprintData) => {
    try {
      setError("");
      await createSprint(projectId, sprintData);
      setShowSprintForm(false);
      fetchProjectData(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  const handleStartSprint = async (sprintId) => {
    try {
      setError("");
      await startSprint(sprintId);
      fetchProjectData(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCompleteSprint = async (sprintId) => {
    if (!window.confirm("Complete this sprint? Incomplete tasks will be moved to backlog.")) {
      return;
    }
    
    try {
      setError("");
      await completeSprint(sprintId);
      fetchProjectData(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteSprint = async (sprintId) => {
    if (!window.confirm("Delete this sprint? All tasks will be moved to backlog.")) {
      return;
    }
    
    try {
      setError("");
      await deleteSprint(sprintId);
      fetchProjectData(); // Refresh data
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAddTaskToSprint = async (sprintId, taskId) => {
    try {
      setError("");
      await addTaskToSprint(sprintId, taskId);
      fetchProjectData(); // Refresh data
    } catch (err) {
      setError(err.message);
      alert(err.message || "Failed to add task to sprint");
    }
  };

  if (loading) {
    return (
      <div className="sprint-page-loading">
        <div style={{ position: 'relative', minHeight: '400px' }}>
          <Loader />
        </div>
      </div>
    );
  }

  if (!project) {
    return <div className="sprint-page-error">Project not found</div>;
  }

  const activeSprint = sprints.find(s => s.status === "active");
  const plannedSprints = sprints.filter(s => s.status === "planned");
  const completedSprints = sprints.filter(s => s.status === "completed");

  return (
    <div className="sprint-page">
      <div className="sprint-page-header">
        <div className="sprint-page-breadcrumb">
          <Link to="/projects" className="breadcrumb-link">Projects</Link>
          <span className="breadcrumb-separator">/</span>
          <Link to={`/projects/${projectId}/tasks`} className="breadcrumb-link">
            {project.name}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">Sprints</span>
        </div>
        
        <h1 className="sprint-page-title">Sprint Management</h1>
        
        {error && <div className="sprint-page-error">{error}</div>}
        
        {isOwner && (
          <button 
            className="create-sprint-btn"
            onClick={() => setShowSprintForm(true)}
            disabled={!!activeSprint && !showSprintForm}
          >
            + Create Sprint
          </button>
        )}
      </div>

      {showSprintForm && (
        <SprintForm
          onSubmit={handleCreateSprint}
          onCancel={() => setShowSprintForm(false)}
        />
      )}

      <div className="sprint-sections">
        {/* Active Sprint */}
        {activeSprint && (
          <div className="sprint-section active-sprint-section">
            <h2 className="section-title">Active Sprint</h2>
            <SprintList
              sprints={[activeSprint]}
              projectId={projectId}
              isOwner={isOwner}
              onStart={handleStartSprint}
              onComplete={handleCompleteSprint}
              onDelete={handleDeleteSprint}
              onRefresh={fetchProjectData}
              onAddTask={handleAddTaskToSprint}
              backlogTasks={backlogTasks}
              availableTasks={availableTasks}
            />
          </div>
        )}

        {/* Backlog - Only show when there are no active or planned sprints */}
        {!activeSprint && plannedSprints.length === 0 && backlogTasks.length > 0 && (
          <div className="sprint-section backlog-section">
            <h2 className="section-title">
              Backlog <span className="task-count">({backlogTasks.length} tasks)</span>
            </h2>
            <BacklogView
              tasks={backlogTasks}
              projectId={projectId}
              sprints={plannedSprints}
              isOwner={isOwner}
              onRefresh={fetchProjectData}
            />
          </div>
        )}

        {/* Planned Sprints */}
        {plannedSprints.length > 0 && (
          <div className="sprint-section planned-sprints-section">
            <h2 className="section-title">Planned Sprints ({plannedSprints.length})</h2>
            <SprintList
              sprints={plannedSprints}
              projectId={projectId}
              isOwner={isOwner}
              onStart={handleStartSprint}
              onComplete={handleCompleteSprint}
              onAddTask={handleAddTaskToSprint}
              backlogTasks={backlogTasks}
              availableTasks={availableTasks}
              onDelete={handleDeleteSprint}
              onRefresh={fetchProjectData}
            />
          </div>
        )}

        {/* Completed Sprints */}
        {completedSprints.length > 0 && (
          <div className="sprint-section completed-sprints-section">
            <h2 className="section-title">Completed Sprints ({completedSprints.length})</h2>
            <SprintList
              sprints={completedSprints}
              projectId={projectId}
              isOwner={isOwner}
              onStart={handleStartSprint}
              onComplete={handleCompleteSprint}
              onDelete={handleDeleteSprint}
              onRefresh={fetchProjectData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintPage;
