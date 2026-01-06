import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./KanbanTaskCard.css";

function KanbanTaskCard({ task, isDragging = false, user, isOwner }) {
  // All team members can interact with all tasks in the project
  // If user can view the Kanban board, they are a team member and can drag/drop tasks
  const canInteract = true; // All team members have full access
  const isLocked = !canInteract;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ 
    id: task._id,
    disabled: isLocked // Disable drag for locked tasks
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "#ef4444";
      case "Medium":
        return "#f59e0b";
      case "Low":
        return "#10b981";
      default:
        return "#6b7280";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(canInteract ? listeners : {})} // Only attach drag listeners if user can interact
      className={`kanban-task-card ${isDragging ? "dragging" : ""} ${isLocked ? "locked" : ""}`}
      title={isLocked ? "You don't have permission to move this task" : ""}
    >
      {isLocked && (
        <div className="locked-overlay">
          <span className="lock-icon">🔒</span>
        </div>
      )}
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
        <span
          className="task-card-priority"
          style={{ backgroundColor: getPriorityColor(task.priority) }}
        >
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      <div className="task-card-footer">
        <div className="task-card-assignee">
          {task.assignee_name && task.assignee_name !== "Unassigned" ? (
            <>
              <div className="assignee-avatar">
                {task.assignee_name.charAt(0).toUpperCase()}
              </div>
              <span className="assignee-name">{task.assignee_name}</span>
            </>
          ) : (
            <span className="unassigned">Unassigned</span>
          )}
        </div>

        {task.due_date && (
          <div className="task-card-due-date">
            <span className="due-date-icon">📅</span>
            <span>{formatDate(task.due_date)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default KanbanTaskCard;