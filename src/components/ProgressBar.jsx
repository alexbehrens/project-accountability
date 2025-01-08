import React from 'react';

const ProgressBar = ({ label, percentage, secondaryPercentage, color }) => {
  return (
    <div className="progress-item">
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="text-gray-400">{label}</span>
        <div className="flex gap-3">
          <span className="text-gray-400">
            <span className="opacity-60">Timeline:</span> {percentage.toFixed(1)}%
          </span>
          <span className="text-gray-400">
            <span className="opacity-60">Completed:</span> {secondaryPercentage.toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="progress-bar-container relative h-2 bg-gray-800 rounded-full">
        {/* Completion progress bar (brighter, shorter) */}
        <div 
          className="absolute top-0 left-0 h-full rounded-full" 
          style={{ 
            width: `${secondaryPercentage}%`,
            backgroundColor: color // Full opacity
          }} 
          title={`${secondaryPercentage.toFixed(1)}% of goals completed`}
        />
        {/* Timeline progress bar (lighter, longer) */}
        <div 
          className="absolute top-0 left-0 h-full rounded-full" 
          style={{ 
            width: `${percentage}%`,
            backgroundColor: `${color}33` // 20% opacity
          }} 
          title={`${percentage.toFixed(1)}% through the time period`}
        />
      </div>
    </div>
  );
};

export default ProgressBar; 