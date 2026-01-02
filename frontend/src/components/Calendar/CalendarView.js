// import React, { useState, useCallback, useMemo } from "react";
// import { Calendar, momentLocalizer } from "react-big-calendar";
// import moment from "moment";
// import "react-big-calendar/lib/css/react-big-calendar.css";
// import { taskAPI } from "../../services/api";
// import "./CalendarView.css";

// const localizer = momentLocalizer(moment);

// function CalendarView({ tasks, onTaskUpdate, onTaskClick, members }) {
//   const [view, setView] = useState("month");
//   const [date, setDate] = useState(new Date());
//   const [showEventDetails, setShowEventDetails] = useState(false);
//   const [selectedEvent, setSelectedEvent] = useState(null);

//   // Convert tasks to calendar events
//   const events = useMemo(() => {
//     return tasks
//       .filter((task) => task.due_date)
//       .map((task) => {
//         const dueDate = new Date(task.due_date);
//         return {
//           id: task._id,
//           title: task.title,
//           start: dueDate,
//           end: dueDate,
//           allDay: true,
//           resource: {
//             ...task,
//             color: getPriorityColor(task.priority),
//             status: task.status,
//           },
//         };
//       });
//   }, [tasks]);

//   // Get priority color
//   const getPriorityColor = (priority) => {
//     switch (priority) {
//       case "High":
//         return "#ef4444";
//       case "Medium":
//         return "#f59e0b";
//       case "Low":
//         return "#10b981";
//       default:
//         return "#6b7280";
//     }
//   };

//   // Get status color
//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Done":
//         return "#22c55e";
//       case "In Progress":
//         return "#3b82f6";
//       case "To Do":
//         return "#94a3b8";
//       default:
//         return "#6b7280";
//     }
//   };

//   // Custom event style getter
//   const eventStyleGetter = (event) => {
//     const backgroundColor = event.resource.color;
//     const statusColor = getStatusColor(event.resource.status);

//     return {
//       style: {
//         backgroundColor,
//         borderRadius: "6px",
//         opacity: event.resource.status === "Done" ? 0.6 : 1,
//         color: "white",
//         border: `2px solid ${statusColor}`,
//         display: "block",
//         fontSize: "13px",
//         fontWeight: "600",
//         padding: "4px 8px",
//       },
//     };
//   };

//   // Handle event selection
//   const handleSelectEvent = useCallback((event) => {
//     setSelectedEvent(event);
//     setShowEventDetails(true);
//     if (onTaskClick) {
//       onTaskClick(event.resource);
//     }
//   }, [onTaskClick]);

//   // Handle event drop (drag to reschedule)
//   const handleEventDrop = async ({ event, start, end }) => {
//     try {
//       // Update task due date
//       const newDueDate = moment(start).format("YYYY-MM-DD");
//       await taskAPI.update(event.id, { due_date: newDueDate });

//       // Notify parent to refresh
//       if (onTaskUpdate) {
//         onTaskUpdate();
//       }
//     } catch (error) {
//       console.error("Failed to update task due date:", error);
//       alert("Failed to reschedule task. Please try again.");
//     }
//   };

//   // Handle event resize
//   const handleEventResize = async ({ event, start, end }) => {
//     await handleEventDrop({ event, start, end });
//   };

//   // Handle slot selection (create new task on date click)
//   const handleSelectSlot = useCallback(({ start }) => {
//     // You can trigger task creation modal here
//     console.log("Selected date:", start);
//     // onCreateTask(start);
//   }, []);

//   // Custom toolbar
//   const CustomToolbar = ({ label, onNavigate, onView, view }) => (
//     <div className="calendar-toolbar">
//       <div className="toolbar-navigation">
//         <button
//           className="btn-nav"
//           onClick={() => onNavigate("TODAY")}
//         >
//           Today
//         </button>
//         <button
//           className="btn-nav"
//           onClick={() => onNavigate("PREV")}
//         >
//           ◄
//         </button>
//         <button
//           className="btn-nav"
//           onClick={() => onNavigate("NEXT")}
//         >
//           ►
//         </button>
//       </div>

//       <div className="toolbar-label">
//         <h2>{label}</h2>
//       </div>

//       <div className="toolbar-views">
//         <button
//           className={`btn-view ${view === "month" ? "active" : ""}`}
//           onClick={() => onView("month")}
//         >
//           Month
//         </button>
//         <button
//           className={`btn-view ${view === "week" ? "active" : ""}`}
//           onClick={() => onView("week")}
//         >
//           Week
//         </button>
//         <button
//           className={`btn-view ${view === "day" ? "active" : ""}`}
//           onClick={() => onView("day")}
//         >
//           Day
//         </button>
//         <button
//           className={`btn-view ${view === "agenda" ? "active" : ""}`}
//           onClick={() => onView("agenda")}
//         >
//           Agenda
//         </button>
//       </div>
//     </div>
//   );

//   // Custom event component
//   const CustomEvent = ({ event }) => {
//     const task = event.resource;
//     return (
//       <div className="custom-event">
//         <div className="event-title">{event.title}</div>
//         <div className="event-meta">
//           <span className="event-priority">{task.priority}</span>
//           {task.assignee_name && task.assignee_name !== "Unassigned" && (
//             <span className="event-assignee">
//               {task.assignee_name.split(" ")[0]}
//             </span>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="calendar-view">
//       <div className="calendar-legend">
//         <div className="legend-item">
//           <span className="legend-color" style={{ backgroundColor: "#ef4444" }}></span>
//           <span>High Priority</span>
//         </div>
//         <div className="legend-item">
//           <span className="legend-color" style={{ backgroundColor: "#f59e0b" }}></span>
//           <span>Medium Priority</span>
//         </div>
//         <div className="legend-item">
//           <span className="legend-color" style={{ backgroundColor: "#10b981" }}></span>
//           <span>Low Priority</span>
//         </div>
//         <div className="legend-divider">|</div>
//         <div className="legend-item">
//           <span className="legend-border" style={{ borderColor: "#94a3b8" }}></span>
//           <span>To Do</span>
//         </div>
//         <div className="legend-item">
//           <span className="legend-border" style={{ borderColor: "#3b82f6" }}></span>
//           <span>In Progress</span>
//         </div>
//         <div className="legend-item">
//           <span className="legend-border" style={{ borderColor: "#22c55e" }}></span>
//           <span>Done</span>
//         </div>
//       </div>

//       <Calendar
//         localizer={localizer}
//         events={events}
//         startAccessor="start"
//         endAccessor="end"
//         style={{ height: "calc(100vh - 300px)", minHeight: "600px" }}
//         view={view}
//         date={date}
//         onView={setView}
//         onNavigate={setDate}
//         onSelectEvent={handleSelectEvent}
//         onSelectSlot={handleSelectSlot}
//         onEventDrop={handleEventDrop}
//         onEventResize={handleEventResize}
//         eventPropGetter={eventStyleGetter}
//         selectable
//         resizable
//         draggableAccessor={() => true}
//         components={{
//           toolbar: CustomToolbar,
//           event: CustomEvent,
//         }}
//         popup
//         tooltipAccessor={(event) => event.resource.description || event.title}
//       />

//       {/* Event Details Modal */}
//       {showEventDetails && selectedEvent && (
//         <div className="event-details-modal" onClick={() => setShowEventDetails(false)}>
//           <div className="event-details-content" onClick={(e) => e.stopPropagation()}>
//             <div className="event-details-header">
//               <h3>{selectedEvent.title}</h3>
//               <button
//                 className="btn-close-modal"
//                 onClick={() => setShowEventDetails(false)}
//               >
//                 ×
//               </button>
//             </div>

//             <div className="event-details-body">
//               {selectedEvent.resource.description && (
//                 <div className="detail-section">
//                   <label>Description:</label>
//                   <p>{selectedEvent.resource.description}</p>
//                 </div>
//               )}

//               <div className="detail-section">
//                 <label>Due Date:</label>
//                 <p>{moment(selectedEvent.start).format("MMMM DD, YYYY")}</p>
//               </div>

//               <div className="detail-row">
//                 <div className="detail-section">
//                   <label>Priority:</label>
//                   <span
//                     className="detail-badge"
//                     style={{ backgroundColor: selectedEvent.resource.color }}
//                   >
//                     {selectedEvent.resource.priority}
//                   </span>
//                 </div>

//                 <div className="detail-section">
//                   <label>Status:</label>
//                   <span
//                     className="detail-badge"
//                     style={{
//                       backgroundColor: getStatusColor(selectedEvent.resource.status),
//                     }}
//                   >
//                     {selectedEvent.resource.status}
//                   </span>
//                 </div>
//               </div>

//               <div className="detail-section">
//                 <label>Assigned To:</label>
//                 <p>
//                   {selectedEvent.resource.assignee_name || "Unassigned"}
//                 </p>
//               </div>

//               {selectedEvent.resource.project_name && (
//                 <div className="detail-section">
//                   <label>Project:</label>
//                   <p>{selectedEvent.resource.project_name}</p>
//                 </div>
//               )}
//             </div>

//             <div className="event-details-footer">
//               <button
//                 className="btn btn-secondary"
//                 onClick={() => setShowEventDetails(false)}
//               >
//                 Close
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default CalendarView;
import React, { useState, useCallback, useMemo } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { taskAPI } from "../../services/api";
import "./CalendarView.css";

const localizer = momentLocalizer(moment);

function CalendarView({ tasks, onTaskUpdate, onTaskClick, members }) {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Move these functions ABOVE useMemo to avoid TDZ
  const getPriorityColor = useCallback((priority) => {
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
  }, []);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case "Done":
        return "#22c55e";
      case "In Progress":
        return "#3b82f6";
      case "To Do":
        return "#94a3b8";
      default:
        return "#6b7280";
    }
  }, []);

  // Now it's safe to use them
  const events = useMemo(() => {
    return tasks
      .filter((task) => task.due_date)
      .map((task) => {
        const dueDate = new Date(task.due_date);
        return {
          id: task._id,
          title: task.title,
          start: dueDate,
          end: dueDate,
          allDay: true,
          resource: {
            ...task,
            color: getPriorityColor(task.priority),
            status: task.status,
          },
        };
      });
  }, [tasks, getPriorityColor]);

  // Custom event style getter
  const eventStyleGetter = useCallback((event) => {
    const backgroundColor = event.resource.color;
    const statusColor = getStatusColor(event.resource.status);
    return {
      style: {
        backgroundColor,
        borderRadius: "6px",
        opacity: event.resource.status === "Done" ? 0.6 : 1,
        color: "white",
        border: `2px solid ${statusColor}`,
        display: "block",
        fontSize: "13px",
        fontWeight: "600",
        padding: "4px 8px",
      },
    };
  }, [getStatusColor]);

  // Handle event selection
  const handleSelectEvent = useCallback((event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
    if (onTaskClick) {
      onTaskClick(event.resource);
    }
  }, [onTaskClick]);

  // Handle event drop (drag to reschedule)
  const handleEventDrop = async ({ event, start }) => {
    try {
      const newDueDate = moment(start).format("YYYY-MM-DD");
      await taskAPI.update(event.id, { due_date: newDueDate });
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error("Failed to update task due date:", error);
      alert("Failed to reschedule task. Please try again.");
    }
  };

  // Handle event resize (same as drop for all-day events)
  const handleEventResize = async ({ event, start }) => {
    await handleEventDrop({ event, start });
  };

  // Handle slot selection
  const handleSelectSlot = useCallback(({ start }) => {
    console.log("Selected date for new task:", start);
    // You can integrate task creation here later
  }, []);

  // Custom toolbar
  const CustomToolbar = (props) => {
    const { label, onNavigate, onView } = props;
    return (
      <div className="calendar-toolbar">
        <div className="toolbar-navigation">
          <button className="btn-nav" onClick={() => onNavigate("TODAY")}>
            Today
          </button>
          <button className="btn-nav" onClick={() => onNavigate("PREV")}>
            ◄
          </button>
          <button className="btn-nav" onClick={() => onNavigate("NEXT")}>
            ►
          </button>
        </div>
        <div className="toolbar-label">
          <h2>{label}</h2>
        </div>
        <div className="toolbar-views">
          {["month", "week", "day", "agenda"].map((v) => (
            <button
              key={v}
              className={`btn-view ${props.view === v ? "active" : ""}`}
              onClick={() => onView(v)}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>
    );
  };

  // Custom event component
  const CustomEvent = ({ event }) => {
    const task = event.resource;
    return (
      <div className="custom-event">
        <div className="event-title">{event.title}</div>
        <div className="event-meta">
          <span className="event-priority">{task.priority || "None"}</span>
          {task.assignee_name && task.assignee_name !== "Unassigned" && (
            <span className="event-assignee">
              {task.assignee_name.split(" ")[0]}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="calendar-view">
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#ef4444" }}></span>
          <span>High Priority</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#f59e0b" }}></span>
          <span>Medium Priority</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: "#10b981" }}></span>
          <span>Low Priority</span>
        </div>
        <div className="legend-divider">|</div>
        <div className="legend-item">
          <span className="legend-border" style={{ borderColor: "#94a3b8" }}></span>
          <span>To Do</span>
        </div>
        <div className="legend-item">
          <span className="legend-border" style={{ borderColor: "#3b82f6" }}></span>
          <span>In Progress</span>
        </div>
        <div className="legend-item">
          <span className="legend-border" style={{ borderColor: "#22c55e" }}></span>
          <span>Done</span>
        </div>
      </div>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100vh - 300px)", minHeight: "600px" }}
        view={view}
        date={date}
        onView={setView}
        onNavigate={setDate}
        onSelectEvent={handleSelectEvent}
        onSelectSlot={handleSelectSlot}
        onEventDrop={handleEventDrop}
        onEventResize={handleEventResize}
        eventPropGetter={eventStyleGetter}
        selectable
        resizable
        draggableAccessor={() => true}
        components={{
          toolbar: CustomToolbar,
          event: CustomEvent,
        }}
        popup
        tooltipAccessor={(event) => event.resource.description || event.title}
      />

      {/* Event Details Modal */}
      {showEventDetails && selectedEvent && (
        <div className="event-details-modal" onClick={() => setShowEventDetails(false)}>
          <div className="event-details-content" onClick={(e) => e.stopPropagation()}>
            <div className="event-details-header">
              <h3>{selectedEvent.title}</h3>
              <button className="btn-close-modal" onClick={() => setShowEventDetails(false)}>
                ×
              </button>
            </div>
            <div className="event-details-body">
              {selectedEvent.resource.description && (
                <div className="detail-section">
                  <label>Description:</label>
                  <p>{selectedEvent.resource.description}</p>
                </div>
              )}
              <div className="detail-section">
                <label>Due Date:</label>
                <p>{moment(selectedEvent.start).format("MMMM DD, YYYY")}</p>
              </div>
              <div className="detail-row">
                <div className="detail-section">
                  <label>Priority:</label>
                  <span className="detail-badge" style={{ backgroundColor: selectedEvent.resource.color }}>
                    {selectedEvent.resource.priority || "None"}
                  </span>
                </div>
                <div className="detail-section">
                  <label>Status:</label>
                  <span
                    className="detail-badge"
                    style={{ backgroundColor: getStatusColor(selectedEvent.resource.status) }}
                  >
                    {selectedEvent.resource.status}
                  </span>
                </div>
              </div>
              <div className="detail-section">
                <label>Assigned To:</label>
                <p>{selectedEvent.resource.assignee_name || "Unassigned"}</p>
              </div>
            </div>
            <div className="event-details-footer">
              <button className="btn btn-secondary" onClick={() => setShowEventDetails(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarView;