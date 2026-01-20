import Loader from "../Loader/Loader";
import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import KanbanTaskCard from "./KanbanTaskCard";
import { taskAPI } from "../../services/api";
import "./KanbanBoard.css";

const COLUMNS = [
  { id: "To Do", title: "TO DO", color: "#7a869a" },
  { id: "In Progress", title: "IN PROGRESS", color: "#2684ff" },
  { id: "Testing", title: "TESTING", color: "#ffab00" },
  { id: "Dev Complete", title: "DEV COMPLETE", color: "#6554c0" },
  { id: "Done", title: "DONE", color: "#36b37e" },
];

// Strict workflow order - tasks must follow this sequence
const WORKFLOW_ORDER = ["To Do", "In Progress", "Testing", "Dev Complete", "Done"];

// Helper function to validate workflow transition
const isValidTransition = (fromStatus, toStatus) => {
  const fromIndex = WORKFLOW_ORDER.indexOf(fromStatus);
  const toIndex = WORKFLOW_ORDER.indexOf(toStatus);
  
  if (fromIndex === -1 || toIndex === -1) return false;
  if (toIndex < fromIndex) return true;
  return toIndex === fromIndex + 1;
};

// Get required previous status for error messages
const getRequiredPreviousStatus = (targetStatus) => {
  const index = WORKFLOW_ORDER.indexOf(targetStatus);
  if (index <= 0) return null;
  return WORKFLOW_ORDER[index - 1];
};

function KanbanBoard({ projectId, initialTasks, onTaskUpdate, user, isOwner }) {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showClosedTasks, setShowClosedTasks] = useState(false);

  useEffect(() => {
    setTasks(initialTasks || []);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getTasksByStatus = (status) => {
    return tasks.filter(
      (task) => task.status === status && task.status !== "Closed"
    );
  };

  const getClosedTasks = () => {
    return tasks.filter((task) => task.status === "Closed");
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);

    if (!isOwner && user) {
      const isAssignedToUser =
        task.assignee_id && String(task.assignee_id) === String(user.id);
      if (!isAssignedToUser) {
        return;
      }
    }

    setActiveTask(task);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t._id === activeId);
    if (!activeTask) return;

    // Cannot move tasks OUT of "Done" or "Closed"
    if (activeTask.status === "Done" || activeTask.status === "Closed") {
      return;
    }

    const overColumn = COLUMNS.find((col) => col.id === overId);
    const overTask = tasks.find((t) => t._id === overId);

    let targetStatus;
    if (overColumn) {
      targetStatus = overColumn.id;
    } else if (overTask) {
      targetStatus = overTask.status;
    } else {
      return;
    }

    // Validate workflow transition before optimistic UI update
    if (!isValidTransition(activeTask.status, targetStatus)) {
      return;
    }

    // Optimistic UI update (only for valid transitions)
    if (activeTask.status !== targetStatus) {
      setTasks((prev) =>
        prev.map((t) =>
          t._id === activeId ? { ...t, status: targetStatus } : t
        )
      );
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((t) => t._id === activeId);
    if (!activeTask) return;

    const originalStatus = initialTasks.find((t) => t._id === activeId)?.status;

    // Cannot move tasks OUT of "Done" or "Closed"
    if (originalStatus === "Done" || originalStatus === "Closed") {
      toast.error("Tasks cannot be moved out of 'Done' or 'Closed' column. Once done, always done!", {
        position: "top-right",
        autoClose: 4000,
      });
      setTasks(initialTasks);
      return;
    }

    const overColumn = COLUMNS.find((col) => col.id === overId);
    const overTask = tasks.find((t) => t._id === overId);

    const finalStatus = overColumn
      ? overColumn.id
      : overTask
      ? overTask.status
      : activeTask.status;

    // No status change needed
    if (originalStatus === finalStatus) {
      return;
    }

    // 🔒 VALIDATE WORKFLOW ORDER
    if (!isValidTransition(originalStatus, finalStatus)) {
      const requiredStatus = getRequiredPreviousStatus(finalStatus);
      
      // Create a custom toast message with HTML formatting
      const toastMessage = (
        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            ⚠️ Invalid Workflow Transition
          </div>
          <div style={{ fontSize: '0.9em' }}>
            <div><strong>Current:</strong> {originalStatus}</div>
            <div><strong>Attempted:</strong> {finalStatus}</div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.85em', color: '#ddd' }}>
            📋 Workflow: To Do → In Progress → Testing → Dev Complete → Done
          </div>
          {requiredStatus && (
            <div style={{ marginTop: '8px', fontSize: '0.9em' }}>
              Move to <strong>{requiredStatus}</strong> first
            </div>
          )}
        </div>
      );

      toast.error(toastMessage, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      
      // Revert to original state
      setTasks(initialTasks);
      return;
    }

    try {
      setLoading(true);
      
      // Update backend
      await taskAPI.update(activeId, { status: finalStatus });

      // Notify parent component with updated task data
      if (onTaskUpdate) {
        onTaskUpdate(activeId, { status: finalStatus });
      }

      toast.success(`✅ Task moved to ${finalStatus}`, {
        position: "bottom-right",
        autoClose: 2000,
      });

      console.log(`✅ Task status updated: ${activeId} → ${finalStatus}`);
    } catch (error) {
      console.error("❌ Failed to update task status:", error);
      
      toast.error(`Failed to update task: ${error.message || "Unknown error"}`, {
        position: "top-right",
        autoClose: 4000,
      });
      
      // Revert to original state on error
      setTasks(initialTasks || []);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <Loader />
      </div>
    );
  }

  return (
    <div className="kanban-board">
      {/* Toast Container - Required for toasts to display */}
      <ToastContainer />

      {/* Board Header */}
      <div className="kanban-board-header">
        <div>
          <h2 className="board-title">Project Board</h2>
        
        </div>
        <div className="board-actions">
          <button
            className="btn-closed-tasks"
            onClick={() => setShowClosedTasks(true)}
          >
            📋 Closed Tasks ({getClosedTasks().length})
          </button>
        </div>
      </div>

      {/* Drag and Drop Context */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        {/* Columns */}
        <div className="kanban-columns">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
              user={user}
              isOwner={isOwner}
            />
          ))}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTask ? (
            <div className="drag-overlay">
              <KanbanTaskCard
                task={activeTask}
                isDragging={true}
                user={user}
                isOwner={isOwner}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Closed Tasks Modal */}
      {showClosedTasks && (
        <div
          className="closed-tasks-modal-overlay"
          onClick={() => setShowClosedTasks(false)}
        >
          <div
            className="closed-tasks-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="closed-tasks-modal-header">
              <h3>Closed Tasks</h3>
              <button
                className="modal-close-btn"
                onClick={() => setShowClosedTasks(false)}
              >
                ×
              </button>
            </div>
            <div className="closed-tasks-list">
              {getClosedTasks().length === 0 ? (
                <div className="kanban-empty">No closed tasks</div>
              ) : (
                getClosedTasks().map((task) => (
                  <div key={task._id} className="closed-task-item">
                    <div className="closed-task-header">
                      {task.ticket_id && (
                        <span className="task-ticket-id">{task.ticket_id}</span>
                      )}
                      <h4>{task.title}</h4>
                    </div>
                    {task.description && (
                      <p className="closed-task-description">
                        {task.description}
                      </p>
                    )}
                    {task.approved_by_name && (
                      <div className="approval-info">
                        <span className="approved-badge">
                          ✓ Approved by {task.approved_by_name}
                        </span>
                        {task.approved_date && (
                          <span className="approved-date">
                            on {new Date(task.approved_date).toLocaleDateString()}
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

export default KanbanBoard;