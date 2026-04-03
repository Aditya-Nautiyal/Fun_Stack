import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progressPercentage, showBar = true }) => {
  return (
    <div className="progress-container">
      <div className="progress-text">Progress: {Math.round(progressPercentage)}%</div>
      {showBar && (
        <div className="progress-bar-bg">
          <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;
