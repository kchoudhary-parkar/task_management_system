import React from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import KanbanTaskCard from "./KanbanTaskCard";
import "./KanbanColumn.css";

function KanbanColumn({ column, tasks, user, isOwner }) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column ${isOver ? "column-over" : ""}`}
      style={{ borderTopColor: column.color }}
    >
      <div className="column-header">
        <div className="column-title">
          <span className="column-name">{column.title}</span>
          <span className="task-count" style={{ backgroundColor: column.color }}>
            {tasks.length}
          </span>
        </div>
      </div>

      <div className="column-content">
        <SortableContext
          items={tasks.map((task) => task._id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.length === 0 ? (
            <div className="empty-column">
              <p>Drop tasks here</p>
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanTaskCard 
                key={task._id} 
                task={task}
                user={user}
                isOwner={isOwner}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}

export default KanbanColumn;