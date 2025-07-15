import React from 'react';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

const SensorComparisonCard = ({ sensorId, currentAvg, previousAvg, unit = '°C' }) => {
  const difference = currentAvg !== null && previousAvg !== null 
    ? (currentAvg - previousAvg).toFixed(1)
    : null;
  
  const getTrendIcon = () => {
    if (difference === null) return null;
    if (difference > 0) return <FaArrowUp className="text-red-500 text-[8px] 2xl:text-[12px]" />;
    if (difference < 0) return <FaArrowDown className="text-green-500 text-[8px] 2xl:text-[12px]" />;
    return <FaEquals className="text-gray-500 text-[8px] 2xl:text-[12px]" />;
  };

  const getDifferenceText = () => {
    if (difference === null) return 'N/A';
    const absDiff = Math.abs(difference);
    return `${absDiff}${unit}`;
  };

  return (
    <div className="bg-white/90 rounded p-1 shadow-sm border border-gray-200 flex flex-col items-center justify-between">
      <span className="text-[8px] 2xl:text-[12px] font-medium text-gray-700 leading-tight">{sensorId}</span>
      <div className="flex items-center gap-1 leading-tight">
        <span className="text-[8px] 2xl:text-[12px] text-gray-500">{currentAvg?.toFixed(1) + '°C' || '-'}</span>
        <span className="text-[8px] 2xl:text-[12px] text-gray-500">/</span>
        <div className="flex items-center">
          <span className={`text-[8px] 2xl:text-[12px] font-medium 2xl:font-semibold ${
            difference > 0 ? 'text-red-500' : difference < 0 ? 'text-green-500' : 'text-gray-500'
          }`}>
            {getDifferenceText()}
          </span>
          {getTrendIcon()}
        </div>
      </div>
    </div>
  );
};

export default SensorComparisonCard;
