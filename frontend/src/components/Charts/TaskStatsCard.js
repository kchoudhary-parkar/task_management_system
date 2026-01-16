import React from 'react';
import './Charts.css';

const TaskStatsCard = ({ stats }) => {
  const cards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: '📋',
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: '⏳',
      color: '#f59e0b',
      bgColor: '#fef3c7'
    },
    {
      label: 'In Progress',
      value: stats.in_progress,
      icon: '🔄',
      color: '#3b82f6',
      bgColor: '#dbeafe'
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: '🚨',
      color: '#ef4444',
      bgColor: '#fee2e2'
    }
  ];

  return (
    <div className="stats-grid">
      {cards.map((card, index) => (
        <div 
          key={index} 
          className="stat-card"
          style={{ borderLeftColor: card.color }}
        >
          <div 
            className="stat-icon"
            style={{ backgroundColor: card.bgColor, color: card.color }}
          >
            {card.icon}
          </div>
          <div className="stat-content">
            <div className="stat-value" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="stat-label">{card.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskStatsCard;
