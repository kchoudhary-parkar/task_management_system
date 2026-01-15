import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { taskAPI, projectAPI, memberAPI } from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import TaskCard from "../../components/Tasks/TaskCard";
import TaskForm from "../../components/Tasks/TaskForm";
import MemberManager from "../../components/Tasks/MemberManager";
import { TaskDetailModal } from "../../components/Tasks";
import { KanbanBoard } from "../../components/Kanban"; // Make sure this is your updated KanbanBoard
import { CalendarView } from "../../components/Calendar";

import "./TasksPage.css";
import Loader from "../../components/Loader/Loader";

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
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" or "list"
  const [showClosedTasks, setShowClosedTasks] = useState(false);

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
      setShowTaskForm(false);
      await fetchProjectData();
    } catch (err) {
      alert(err.message || "Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      await taskAPI.delete(taskId);
      await fetchProjectData();
    } catch (err) {
      alert(err.message || "Failed to delete task");
    }
  };

  const handleEditTask = (task) => setEditingTask(task);
  const handleTaskClick = (task) => setSelectedTask(task);

  const handleTaskDetailUpdate = async (taskId, updateData) => {
    try {
      await taskAPI.update(taskId, updateData);
      await fetchProjectData();
      setSelectedTask(null);
    } catch (error) {
      console.error("Failed to update task:", error);
      throw error;
    }
  };

  // Optimized handler for Kanban drag and drop - only updates local state
  const handleKanbanTaskUpdate = (taskId, updateData) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, ...updateData } : task
      )
    );
  };

  const handleMembersUpdate = () => fetchProjectData();

  const filteredTasks = statusFilter === "All"
    ? tasks
    : tasks.filter((task) => task.status === statusFilter);

  const isOwner = project && user && (
    project.owner_id === user.id ||
    project.user_id === user.id ||
    project.is_owner === true
  );

  if (loading) return <div className="tasks-page"><Loader /></div>;
  if (error) return <div className="tasks-page"><p className="error-message">{error}</p><button onClick={() => navigate("/projects")} className="btn btn-secondary">Back to Projects</button></div>;
  if (!project) return <div className="tasks-page"><p className="error-message">Project not found</p><button onClick={() => navigate("/projects")} className="btn btn-secondary">Back to Projects</button></div>;

  return (
    <div className="tasks-page">
      <div className="tasks-header">
        <div className="header-top">
          <div className="header-left-actions">
            <button onClick={() => navigate("/projects")} className="btn-view-closed1">
              ← Back to Projects
            </button>
            <button 
              onClick={() => setShowClosedTasks(true)} 
              className="btn-view-closed"
            >
              📦 View Closed/Completed Tickets
            </button>
          </div>
          <div className="header-actions">
            {/* View Mode Toggle */}
            <div className="view-mode-toggle">
              <button
                className={`view-btn ${viewMode === "kanban" ? "active" : ""}`}
                onClick={() => setViewMode("kanban")}
                title="Kanban View"
              >
                📊 Kanban
              </button>
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
                title="List View"
              >
                📋 List
              </button>
              <button
                className={`view-btn ${viewMode === "calendar" ? "active" : ""}`}
                onClick={() => setViewMode("calendar")}
                title="Calendar View"
              >
                📅 Calendar
              </button>
            </div>

            <button
              onClick={() => navigate(`/projects/${projectId}/sprints`)}
              className="btn btn-view-closed"
            >
              🏃 Sprint Management
            </button>

            <button
              onClick={() => setShowMembers(!showMembers)}
              className="btn btn-view-closed"
            >
              {showMembers ? "Hide Members" : "👥 Team"}
            </button>

            <button
              onClick={() => setShowTaskForm(true)}
              className="btn btn-primary"
            >
              + Create Task
            </button>
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
        {viewMode === "kanban" && (
          // KANBAN VIEW
          <KanbanBoard
            projectId={projectId}
            initialTasks={tasks}
            onTaskUpdate={handleKanbanTaskUpdate}
            user={user}
            isOwner={isOwner}
          />
        )}

        {viewMode === "calendar" && (
          // CALENDAR VIEW
          <CalendarView
            tasks={tasks}
            onTaskUpdate={fetchProjectData}
            onTaskClick={handleTaskClick}
            members={members}
          />
        )}

        {viewMode === "list" && (
          // LIST VIEW
          <>
            <div className="tasks-filters">
              <div className="filter-buttons">
                {["All", "To Do", "In Progress", "Testing", "Dev Complete", "Done"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`btn-view-closed ${statusFilter === status ? "active" : ""}`}
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
          </>
        )}
      </div>

      {/* Modals & Forms */}
      {showTaskForm && (
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowTaskForm(false)}
          members={members}
          user={user}
        />
      )}

      {editingTask && (
        <TaskForm
          onSubmit={handleUpdateTask}
          onCancel={() => setEditingTask(null)}
          initialData={editingTask}
          members={members}
          user={user}
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

      {/* Closed Tasks Modal */}
      {showClosedTasks && (
        <div className="closed-tasks-modal-overlay" onClick={() => setShowClosedTasks(false)}>
          <div className="closed-tasks-modal" onClick={(e) => e.stopPropagation()}>
            <div className="closed-tasks-header">
              <h2>📦 Closed/Completed Tickets</h2>
              <button onClick={() => setShowClosedTasks(false)} className="modal-close-btn">
                ×
              </button>
            </div>
            <div className="closed-tasks-list">
              {tasks.filter(t => t.status === "Closed").length === 0 ? (
                <p className="no-tasks">No closed tickets yet.</p>
              ) : (
                tasks.filter(t => t.status === "Closed").map((task) => (
                  <div 
                    key={task._id} 
                    className="closed-task-item"
                    onClick={() => {
                      setSelectedTask(task);
                      setShowClosedTasks(false);
                    }}
                  >
                    <div className="closed-task-header">
                      <span className="task-ticket-id">{task.ticket_id}</span>
                      <h4>{task.title}</h4>
                    </div>
                    <p className="closed-task-description">{task.description}</p>
                    {task.approved_by_name && (
                      <div className="approval-info">
                        <span className="approved-badge">✓ Approved by {task.approved_by_name}</span>
                        {task.approved_at && (
                          <span className="approved-date">
                            on {new Date(task.approved_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksPage;
