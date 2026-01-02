import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskAPI, projectAPI, memberAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import TaskCard from "../../components/Tasks/TaskCard";
import TaskForm from "../../components/Tasks/TaskForm";
import MemberManager from "../../components/Tasks/MemberManager";
import TaskDetailModal from "../../components/Tasks/TaskDetailModal";
import "./TasksPage.css";

function TasksPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [showMembers, setShowMembers] = useState(false);

  const fetchProjectData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      
      const [projectData, tasksData, membersData] = await Promise.all([
        projectAPI.getById(projectId),
        taskAPI.getByProject(projectId),
        memberAPI.getMembers(projectId),
      ]);
      
      setProject(projectData.project);
      setTasks(tasksData.tasks || []);
      setMembers(membersData.members || []);
    } catch (err) {
      setError(err.message || "Failed to load project data");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchProjectData();
  }, [fetchProjectData]);

  const handleCreateTask = async (taskData) => {
    try {
      await taskAPI.create(projectId, taskData);
      setShowTaskForm(false);
      await fetchProjectData();
    } catch (err) {
      alert(err.message || "Failed to create task");
    }
  };

  const handleUpdateTask = async (taskData) => {
    try {
      await taskAPI.update(editingTask._id, taskData);
      setEditingTask(null);
      await fetchProjectData();
    } catch (err) {
      alert(err.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) {
      return;
    }

    try {
      await taskAPI.delete(taskId);
      await fetchProjectData();
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
  };

  const handleTaskDetailUpdate = async (taskId, updateData) => {
    await taskAPI.update(taskId, updateData);
    await fetchProjectData();
    // Update the selected task with fresh data
    const updatedTask = tasks.find(t => t._id === taskId);
    if (updatedTask) {
      setSelectedTask(updatedTask);
    }
  };

  const handleMembersUpdate = () => {
    // Refresh project data when members are updated
    fetchProjectData();
  };

  const filteredTasks = statusFilter === "All"
    ? tasks
    : tasks.filter((task) => task.status === statusFilter);

  const isOwner = project && user && project.owner_id === user.id;

  if (loading) {
    return (
      <div className="tasks-page">
        <p className="loading-text">Loading project...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="tasks-page">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate("/projects")} className="btn btn-secondary">
          Back to Projects
        </button>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="tasks-page">
        <p className="error-message">Project not found</p>
        <button onClick={() => navigate("/projects")} className="btn btn-secondary">
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div className="header-top">
          <button onClick={() => navigate("/projects")} className="btn-back">
            ← Back to Projects
          </button>
          <div className="header-actions">
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="btn btn-secondary"
            >
              {showMembers ? "Hide Members" : "View Team Members"}
            </button>
            {isOwner && (
              <button
                onClick={() => setShowTaskForm(true)}
                className="btn btn-primary"
              >
                + Create Task
              </button>
            )}
          </div>
        </div>
        
        <div className="project-info">
          <h1>{project.name}</h1>
          {project.description && <p>{project.description}</p>}
        </div>
      </div>

      {showMembers && (
        <div className="members-section">
          <MemberManager 
            projectId={projectId} 
            isOwner={isOwner} 
            onMembersUpdate={handleMembersUpdate}
          />
        </div>
      )}

      <div className="tasks-content">
        <div className="tasks-filters">
          <div className="filter-buttons">
            {["All", "To Do", "In Progress", "Done"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`filter-btn ${statusFilter === status ? "active" : ""}`}
              >
                {status}
                {status === "All" && ` (${tasks.length})`}
                {status !== "All" && ` (${tasks.filter(t => t.status === status).length})`}
              </button>
            ))}
          </div>
        </div>

        <div className="tasks-grid">
          {filteredTasks.length === 0 ? (
            <div className="no-tasks">
              <p>No tasks found</p>
              {statusFilter !== "All" && (
                <button onClick={() => setStatusFilter("All")} className="btn btn-secondary">
                  View All Tasks
                </button>
              )}
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={handleEditTask}
                onDelete={handleDeleteTask}
                onClick={() => handleTaskClick(task)}
                isOwner={isOwner}
              />
            ))
          )}
        </div>
      </div>

      {showTaskForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskForm(false)}
          members={members}
        />
      )}

      {editingTask && (
        <TaskForm
          onSubmit={handleUpdateTask}
          onCancel={() => setEditingTask(null)}
          initialData={editingTask}
          members={members}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleTaskDetailUpdate}
          isOwner={isOwner}
        />
      )}
    </div>
  );
}

export default TasksPage;
