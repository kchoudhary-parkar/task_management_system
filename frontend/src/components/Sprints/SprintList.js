import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./SprintList.css";

const SprintList = ({ sprints, projectId, isOwner, onStart, onComplete, onDelete, onRefresh, onAddTask, backlogTasks = [] }) => {
  const [showTaskSelector, setShowTaskSelector] = useState(null); // sprintId or null
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      planned: 'status-badge-planned',
      active: 'status-badge-active',
      completed: 'status-badge-completed'
    };
    
    const statusLabels = {
      planned: 'Planned',
      active: 'Active',
      completed: 'Completed'
    };
    
    return (
      <span className={`status-badge ${statusClasses[status]}`}>
        {statusLabels[status]}
      </span>
    );
  };

  const getProgressPercentage = (completedTasks, totalTasks) => {
    if (totalTasks === 0) return 0;
    return Math.round((completedTasks / totalTasks) * 100);
  };

  if (sprints.length === 0) {
    return <div className="no-sprints">No sprints yet</div>;
  }

  return (
    <div className="sprint-list">
      {sprints.map((sprint) => {
        const progress = getProgressPercentage(sprint.completed_tasks, sprint.total_tasks);
        
        return (
          <div key={sprint._id} className={`sprint-card sprint-${sprint.status}`}>
            <div className="sprint-card-header">
              <div className="sprint-info">
                <h3 className="sprint-name">
                  <Link to={`/projects/${projectId}/sprints/${sprint._id}`} className="sprint-link">
                    {sprint.name}
                  </Link>
                </h3>
                {getStatusBadge(sprint.status)}
              </div>
              
              <div className="sprint-actions">
                {/* Add Task button for Active and Planned sprints */}
                {(sprint.status === "active" || sprint.status === "planned") && (
                  <button 
                    className="sprint-btn add-task-btn"
                    onClick={() => setShowTaskSelector(showTaskSelector === sprint._id ? null : sprint._id)}
                    disabled={backlogTasks.length === 0}
                    title={backlogTasks.length === 0 ? "No tasks in backlog" : "Add tasks from backlog"}
                  >
                    + Add Task
                  </button>
                )}
                
                {isOwner && (
                  <>
                    {sprint.status === "planned" && (
                      <>
                        <button 
                          className="sprint-btn start-btn"
                          onClick={() => onStart(sprint._id)}
                        >
                          Start Sprint
                        </button>
                        <button 
                          className="sprint-btn delete-btn"
                          onClick={() => onDelete(sprint._id)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    
                    {sprint.status === "active" && (
                      <button 
                        className="sprint-btn complete-btn"
                        onClick={() => onComplete(sprint._id)}
                      >
                        Complete Sprint
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
            
            {sprint.goal && (
              <div className="sprint-goal">
                <strong>Goal:</strong> {sprint.goal}
              </div>
            )}
            
            <div className="sprint-dates">
              <span className="sprint-date">
                📅 {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
              </span>
            </div>
            
            <div className="sprint-progress">
              <div className="progress-info">
                <span className="progress-text">
                  {sprint.completed_tasks} / {sprint.total_tasks} tasks completed
                </span>
                <span className="progress-percentage">{progress}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            {/* Task Selector Dropdown */}
            {showTaskSelector === sprint._id && backlogTasks.length > 0 && (
              <div className="task-selector-dropdown">
                <div className="task-selector-header">
                  <h4>Add Tasks from Backlog</h4>
                  <button 
                    className="close-selector-btn"
                    onClick={() => setShowTaskSelector(null)}
                  >
                    ✕
                  </button>
                </div>
                <div className="task-selector-list">
                  {backlogTasks.map(task => (
                    <div key={task._id} className="task-selector-item">
                      <div className="task-selector-info">
                        <span className="task-selector-title">{task.title}</span>
                        <span className={`task-selector-priority priority-${task.priority.toLowerCase()}`}>
                          {task.priority}
                        </span>
                      </div>
                      <button
                        className="add-to-sprint-btn"
                        onClick={async () => {
                          await onAddTask(sprint._id, task._id);
                          setShowTaskSelector(null);
                        }}
                      >
                        Add
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SprintList;
