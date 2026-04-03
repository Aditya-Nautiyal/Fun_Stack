import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progressPercentage }) => {
  return (
    <div className="progress-container">
      <div className="progress-text">Progress: {Math.round(progressPercentage)}%</div>
      <div className="progress-bar-bg">
        <div className="progress-bar-fill" style={{ width: `${progressPercentage}%` }}></div>
      </div>
    </div>
  );
};

export default ProgressBar;
