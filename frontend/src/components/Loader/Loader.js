import React from 'react';
import './Loader.css';

export default function Loader() {
  return (
    <div className="kanban-loading-overlay">
      <div className="loader-container">
        <div className="cube">
          <div className="face">D</div>
          <div className="face">O</div>
          <div className="face">I</div>
          <div className="face">T</div>
          <div className="face">D</div>
          <div className="face">O</div>
          <div className="face">I</div>
          <div className="face">T</div>
        </div>
        <div className="particles">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  );
}