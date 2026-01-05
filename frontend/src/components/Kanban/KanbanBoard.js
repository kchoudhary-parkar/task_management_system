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
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   verticalListSortingStrategy,
// } from "@dnd-kit/sortable";
// import KanbanColumn from "./KanbanColumn";
// import KanbanTaskCard from "./KanbanTaskCard";
// import { taskAPI } from "../../services/api";
// import "./KanbanBoard.css";

// const COLUMNS = [
//   { id: "To Do", title: "To Do", color: "#94a3b8" },
//   { id: "In Progress", title: "In Progress", color: "#3b82f6" },
//   { id: "Done", title: "Done", color: "#22c55e" },
// ];

// function KanbanBoard({ projectId, initialTasks, onTaskUpdate }) {
//   const [tasks, setTasks] = useState(initialTasks || []);
//   const [activeTask, setActiveTask] = useState(null);
//   const [loading, setLoading] = useState(false);

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
//     return tasks.filter((task) => task.status === status);
//   };

//   const handleDragStart = (event) => {
//     const { active } = event;
//     const task = tasks.find((t) => t._id === active.id);
//     setActiveTask(task);
//   };

//   const handleDragOver = (event) => {
//     const { active, over } = event;

//     if (!over) return;

//     const activeId = active.id;
//     const overId = over.id;

//     if (activeId === overId) return;

//     const activeTask = tasks.find((t) => t._id === activeId);
//     const overTask = tasks.find((t) => t._id === overId);

//     if (!activeTask) return;

//     // Check if we're hovering over a column
//     const overColumn = COLUMNS.find((col) => col.id === overId);

//     if (overColumn) {
//       // Moving to a different column
//       if (activeTask.status !== overColumn.id) {
//         setTasks((tasks) => {
//           return tasks.map((task) => {
//             if (task._id === activeId) {
//               return { ...task, status: overColumn.id };
//             }
//             return task;
//           });
//         });
//       }
//     } else if (overTask) {
//       // Hovering over another task
//       if (activeTask.status !== overTask.status) {
//         setTasks((tasks) => {
//           return tasks.map((task) => {
//             if (task._id === activeId) {
//               return { ...task, status: overTask.status };
//             }
//             return task;
//           });
//         });
//       }
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

//     // Check if dropped on a column
//     const overColumn = COLUMNS.find((col) => col.id === overId);
//     const finalStatus = overColumn ? overColumn.id : activeTask.status;

//     // Update task status in backend
//     if (activeTask.status !== finalStatus) {
//       try {
//         setLoading(true);
//         await taskAPI.update(activeId, { status: finalStatus });
        
//         // Update local state
//         setTasks((tasks) => {
//           return tasks.map((task) => {
//             if (task._id === activeId) {
//               return { ...task, status: finalStatus };
//             }
//             return task;
//           });
//         });

//         // Notify parent component
//         if (onTaskUpdate) {
//           onTaskUpdate();
//         }
//       } catch (error) {
//         console.error("Failed to update task status:", error);
//         alert("Failed to update task status. Please try again.");
        
//         // Revert on error
//         setTasks(initialTasks);
//       } finally {
//         setLoading(false);
//       }
//     }

//     // Handle reordering within the same column
//     const activeIndex = tasks.findIndex((t) => t._id === activeId);
//     const overIndex = tasks.findIndex((t) => t._id === overId);

//     if (activeIndex !== overIndex && activeTask.status === finalStatus) {
//       setTasks((tasks) => {
//         return arrayMove(tasks, activeIndex, overIndex);
//       });
//     }
//   };

//   return (
//     <div className="kanban-board">
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
//             />
//           ))}
//         </div>

//         <DragOverlay>
//           {activeTask ? (
//             <div className="drag-overlay">
//               <KanbanTaskCard task={activeTask} isDragging />
//             </div>
//           ) : null}
//         </DragOverlay>
//       </DndContext>

//       {loading && (
//         <div className="kanban-loading-overlay">
//           <div className="spinner">Updating...</div>
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
import {
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable"; // Removed arrayMove and others not used

import KanbanColumn from "./KanbanColumn";
import KanbanTaskCard from "./KanbanTaskCard";
import { taskAPI } from "../../services/api";
import "./KanbanBoard.css";

const COLUMNS = [
  { id: "To Do", title: "To Do", color: "#94a3b8" },
  { id: "In Progress", title: "In Progress", color: "#3b82f6" },
  { id: "Done", title: "Done", color: "#22c55e" },
];

function KanbanBoard({ projectId, initialTasks, onTaskUpdate, user, isOwner }) {
  const [tasks, setTasks] = useState(initialTasks || []);
  const [activeTask, setActiveTask] = useState(null);
  const [loading, setLoading] = useState(false);

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
    return tasks.filter((task) => task.status === status);
  };

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    
    // If not owner, check if task is assigned to current user
    if (!isOwner && user) {
      const isAssignedToUser = task.assignee_id && String(task.assignee_id) === String(user.id);
      if (!isAssignedToUser) {
        // Prevent dragging tasks not assigned to this user
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

    // RULE: Cannot move tasks OUT of "Done" column
    if (activeTask.status === "Done") {
      return; // Block any movement from Done
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

    // RULE: Cannot move tasks OUT of "Done" column
    if (originalStatus === "Done") {
      alert("Tasks cannot be moved out of 'Done' column. Once done, always done!");
      setTasks(initialTasks); // Revert to original state
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

      // Update backend
      await taskAPI.update(activeId, { status: finalStatus });

      // Refresh parent component's state immediately
      if (onTaskUpdate) {
        await onTaskUpdate();
      }

      console.log(`✅ Task status updated: ${activeId} → ${finalStatus}`);
    } catch (error) {
      console.error("❌ Failed to update task status:", error);
      alert(`Failed to update task status: ${error.message || "Unknown error"}`);
      
      // Revert to original state on error
      setTasks(initialTasks || []);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="kanban-board">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
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

        <DragOverlay>
          {activeTask && (
            <div className="drag-overlay">
              <KanbanTaskCard task={activeTask} isDragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {loading && (
        <div className="kanban-loading-overlay">
          <div className="spinner">Saving...</div>
        </div>
      )}
    </div>
  );
}

export default KanbanBoard;