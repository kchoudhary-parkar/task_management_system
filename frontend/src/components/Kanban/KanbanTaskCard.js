
import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "./KanbanTaskCard.css";

function KanbanTaskCard({ task, isDragging = false, user, isOwner }) {
  // All team members can interact with all tasks
  const canInteract = true;
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
    disabled: isLocked,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`kanban-task-card ${isSortableDragging ? "dragging" : ""} ${
        isLocked ? "locked" : ""
      }`}
    >
      {/* Locked Overlay */}
      {isLocked && (
        <div className="locked-overlay">
          <span className="lock-icon">🔒</span>
        </div>
      )}

      {/* Card Header */}
      <div className="task-card-header">
        <h4 className="task-card-title">{task.title}</h4>
        {task.priority && (
          <span className={`task-card-priority ${task.priority.toLowerCase()}`}>
            {task.priority}
          </span>
        )}
      </div>

      {/* Card Description */}
      {task.description && (
        <p className="task-card-description">{task.description}</p>
      )}

      {/* Card Footer */}
      <div className="task-card-footer">
        {/* Assignee */}
        <div className="task-card-assignee">
          {task.assignee_name ? (
            <>
              <div className="assignee-avatar">
                {getInitials(task.assignee_name)}
              </div>
              <span className="assignee-name">{task.assignee_name}</span>
            </>
          ) : (
            <span className="unassigned">Unassigned</span>
          )}
        </div>

        {/* Due Date */}
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
