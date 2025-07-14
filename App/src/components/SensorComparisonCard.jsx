import React from 'react';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

const SensorComparisonCard = ({ sensorId, currentAvg, previousAvg, unit = '°C' }) => {
  const difference = currentAvg !== null && previousAvg !== null 
    ? (currentAvg - previousAvg).toFixed(1)
    : null;
  
  const getTrendIcon = () => {
    if (difference === null) return null;
    if (difference > 0) return <FaArrowUp className="text-red-500 text-[10px]" />;
    if (difference < 0) return <FaArrowDown className="text-green-500 text-[10px]" />;
    return <FaEquals className="text-gray-500 text-[10px]" />;
  };

  const getDifferenceText = () => {
    if (difference === null) return 'N/A';
    const absDiff = Math.abs(difference);
    return `${absDiff}${unit}`;
  };

  return (
    <div className="bg-white/90 rounded p-1 shadow-sm border border-gray-200 flex items-center justify-between">
      <span className="text-xs font-medium text-gray-700">{sensorId}</span>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-gray-500">{currentAvg?.toFixed(1) || '-'}</span>
        <div className="flex items-center">
          {getTrendIcon()}
          <span className={`text-[9px] font-medium ${
            difference > 0 ? 'text-red-500' : difference < 0 ? 'text-green-500' : 'text-gray-500'
          }`}>
            {getDifferenceText()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SensorComparisonCard;
