import React from 'react';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

const SensorComparisonCard = ({ sensorId, currentAvg, previousAvg, unit = '°C' }) => {
  const difference = currentAvg !== null && previousAvg !== null 
    ? (currentAvg - previousAvg).toFixed(1)
    : null;
  
  const getTrendIcon = () => {
    if (difference === null) return null;
    if (difference > 0) return <FaArrowUp className="text-red-500 text-[6px] 2xl:text-[12px]" />;
    if (difference < 0) return <FaArrowDown className="text-green-500 text-[6px] 2xl:text-[12px]" />;
    return <FaEquals className="text-gray-500 text-[6px] 2xl:text-[12px]" />;
  };

  const getDifferenceText = () => {
    if (difference === null) return 'N/A';
    const absDiff = Math.abs(difference);
    return `${absDiff}${unit}`;
  };

  // Helper to check for N/A or null
  const displayValue = (val) => {
    if (val === null || val === undefined || val === 'N/A') return 'N/A';
    if (typeof val === 'string' && val.trim().toUpperCase() === 'N/A') return 'N/A';
    return Number(val).toFixed(1) + unit;
  };

  return (
    <div className="flex flex-col justify-between items-center p-1 rounded border border-gray-200 shadow-sm bg-white/90">
      <span className="text-[8px] 2xl:text-[12px] font-medium text-gray-700 leading-tight">{sensorId}</span>
      <div className="flex gap-1 items-center leading-tight 2xl:gap-0">
        <span className="text-[7px] 2xl:text-[12px] text-gray-500">{displayValue(previousAvg)}</span>
        <span className="text-[7px] 2xl:text-[12px] text-gray-500">/</span>
        <div className="flex items-center">
          <span className={`text-[7px] 2xl:text-[12px] font-medium 2xl:font-semibold ${
            difference > 0 ? 'text-red-500' : difference < 0 ? 'text-green-500' : 'text-gray-500'
          }`}>
           {displayValue(currentAvg)}
          </span>
          {getTrendIcon()}
        </div>
      </div>
    </div>
  );
};

export default SensorComparisonCard;




