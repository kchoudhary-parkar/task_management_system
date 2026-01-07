// import React, { useState, useEffect } from "react";
// import {
//   DndContext,
//   DragOverlay,
//   closestCorners,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
// } from "@dnd-kit/core";
// import {
//   sortableKeyboardCoordinates,
// } from "@dnd-kit/sortable"; // Removed arrayMove and others not used

// import KanbanColumn from "./KanbanColumn";
// import KanbanTaskCard from "./KanbanTaskCard";
// import { taskAPI } from "../../services/api";
// import "./KanbanBoard.css";

// const COLUMNS = [
//   { id: "To Do", title: "TO DO", color: "#94a3b8" },
//   { id: "In Progress", title: "IN PROGRESS", color: "#3b82f6" },
//   { id: "Testing", title: "TESTING", color: "#f59e0b" },
//   { id: "Incomplete", title: "INCOMPLETE", color: "#ef4444" },
//   { id: "Done", title: "DONE", color: "#22c55e" },
// ];

// function KanbanBoard({ projectId, initialTasks, onTaskUpdate, user, isOwner }) {
//   const [tasks, setTasks] = useState(initialTasks || []);
//   const [activeTask, setActiveTask] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showClosedTasks, setShowClosedTasks] = useState(false);

//   useEffect(() => {
//     setTasks(initialTasks || []);
//   }, [initialTasks]);

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     }),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   );

//   const getTasksByStatus = (status) => {
//     // Filter out closed tasks from regular columns
//     return tasks.filter((task) => task.status === status && task.status !== "Closed");
//   };

//   const getClosedTasks = () => {
//     return tasks.filter((task) => task.status === "Closed");
//   };

//   const handleDragStart = (event) => {
//     const { active } = event;
//     const task = tasks.find((t) => t._id === active.id);
    
//     // If not owner, check if task is assigned to current user
//     if (!isOwner && user) {
//       const isAssignedToUser = task.assignee_id && String(task.assignee_id) === String(user.id);
//       if (!isAssignedToUser) {
//         // Prevent dragging tasks not assigned to this user
//         return;
//       }
//     }
    
//     setActiveTask(task);
//   };

//   const handleDragOver = (event) => {
//     const { active, over } = event;
//     if (!over) return;

//     const activeId = active.id;
//     const overId = over.id;
//     if (activeId === overId) return;

//     const activeTask = tasks.find((t) => t._id === activeId);
//     if (!activeTask) return;

//     // RULE: Cannot move tasks OUT of "Done" or "Closed" column
//     if (activeTask.status === "Done" || activeTask.status === "Closed") {
//       return; // Block any movement from Done or Closed
//     }

//     const overColumn = COLUMNS.find((col) => col.id === overId);
//     const overTask = tasks.find((t) => t._id === overId);

//     let targetStatus;
//     if (overColumn) {
//       targetStatus = overColumn.id;
//     } else if (overTask) {
//       targetStatus = overTask.status;
//     } else {
//       return;
//     }

//     // Optimistic UI update
//     if (activeTask.status !== targetStatus) {
//       setTasks((prev) =>
//         prev.map((t) =>
//           t._id === activeId ? { ...t, status: targetStatus } : t
//         )
//       );
//     }
//   };

//   const handleDragEnd = async (event) => {
//     const { active, over } = event;
//     setActiveTask(null);

//     if (!over) return;

//     const activeId = active.id;
//     const overId = over.id;

//     const activeTask = tasks.find((t) => t._id === activeId);
//     if (!activeTask) return;

//     const originalStatus = initialTasks.find((t) => t._id === activeId)?.status;

//     // RULE: Cannot move tasks OUT of "Done" column
//     if (originalStatus === "Done") {
//       alert("Tasks cannot be moved out of 'Done' column. Once done, always done!");
//       setTasks(initialTasks); // Revert to original state
//       return;
//     }

//     const overColumn = COLUMNS.find((col) => col.id === overId);
//     const overTask = tasks.find((t) => t._id === overId);

//     const finalStatus = overColumn
//       ? overColumn.id
//       : overTask
//       ? overTask.status
//       : activeTask.status;

//     // No status change needed
//     if (originalStatus === finalStatus) {
//       return;
//     }

//     try {
//       setLoading(true);

//       // Update backend
//       await taskAPI.update(activeId, { status: finalStatus });

//       // Refresh parent component's state immediately
//       if (onTaskUpdate) {
//         await onTaskUpdate();
//       }

//       console.log(`✅ Task status updated: ${activeId} → ${finalStatus}`);
//     } catch (error) {
//       console.error("❌ Failed to update task status:", error);
//       alert(`Failed to update task status: ${error.message || "Unknown error"}`);
      
//       // Revert to original state on error
//       setTasks(initialTasks || []);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="kanban-board">
//       {getClosedTasks().length > 0 && (
//         <div className="closed-tasks-header">
//           <button
//             className="btn-closed-tasks"
//             onClick={() => setShowClosedTasks(!showClosedTasks)}
//           >
//             📦 Completed/Closed Tickets ({getClosedTasks().length})
//           </button>
//         </div>
//       )}

//       <DndContext
//         sensors={sensors}
//         collisionDetection={closestCorners}
//         onDragStart={handleDragStart}
//         onDragOver={handleDragOver}
//         onDragEnd={handleDragEnd}
//       >
//         <div className="kanban-columns">
//           {COLUMNS.map((column) => (
//             <KanbanColumn
//               key={column.id}
//               column={column}
//               tasks={getTasksByStatus(column.id)}
//               user={user}
//               isOwner={isOwner}
//             />
//           ))}
//         </div>

//         <DragOverlay>
//           {activeTask && (
//             <div className="drag-overlay">
//               <KanbanTaskCard 
//                 task={activeTask} 
//                 isDragging 
//                 user={user}
//                 isOwner={isOwner}
//               />
//             </div>
//           )}
//         </DragOverlay>
//       </DndContext>

//       {loading && (
//         <div className="kanban-loading-overlay">
//           <div className="spinner">Saving...</div>
//         </div>
//       )}

//       {/* Closed Tasks Modal */}
//       {showClosedTasks && (
//         <div className="modal-overlay" onClick={() => setShowClosedTasks(false)}>
//           <div className="modal-content closed-tasks-modal" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header">
//               <h2>📦 Completed/Closed Tickets</h2>
//               <button onClick={() => setShowClosedTasks(false)} className="btn-close">
//                 ×
//               </button>
//             </div>
//             <div className="closed-tasks-list">
//               {getClosedTasks().map((task) => (
//                 <div key={task._id} className="closed-task-item">
//                   <div className="closed-task-header">
//                     <span className="task-ticket-id">{task.ticket_id}</span>
//                     <h4>{task.title}</h4>
//                   </div>
//                   <p className="closed-task-description">{task.description}</p>
//                   {task.approved_by_name && (
//                     <div className="approval-info">
//                       <span className="approved-badge">✓ Approved by {task.approved_by_name}</span>
//                       {task.approved_at && (
//                         <span className="approved-date">
//                           {new Date(task.approved_at).toLocaleDateString()}
//                         </span>
//                       )}
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default KanbanBoard;
import React, { useState, useEffect } from "react";
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
  { id: "Incomplete", title: "INCOMPLETE", color: "#ff5630" },
  { id: "Done", title: "DONE", color: "#36b37e" },
];

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

    // Optimistic UI update
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

    // Cannot move tasks OUT of "Done"
    if (originalStatus === "Done") {
      alert(
        "Tasks cannot be moved out of 'Done' column. Once done, always done!"
      );
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

    try {
      setLoading(true);
      await taskAPI.update(activeId, { status: finalStatus });

      if (onTaskUpdate) {
        await onTaskUpdate();
      }

      console.log(`✅ Task status updated: ${activeId} → ${finalStatus}`);
    } catch (error) {
      console.error("❌ Failed to update task status:", error);
      alert(`Failed to update task status: ${error.message || "Unknown error"}`);
      setTasks(initialTasks || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kanban-board">
      {/* Board Header */}
      <div className="kanban-board-header">
        <h2 className="board-title">Project Board</h2>
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

      {/* Loading Overlay */}
      {loading && (
        <div className="kanban-loading-overlay">
          <div className="spinner">Updating task...</div>
        </div>
      )}

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
