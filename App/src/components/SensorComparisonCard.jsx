import React from 'react';
import { FaArrowUp, FaArrowDown, FaEquals } from 'react-icons/fa';

const SensorComparisonCard = ({ sensorId, currentAvg, previousAvg, unit = '°C' }) => {
  // Check if either value is N/A or null
  const hasValidValues = currentAvg !== null &&
    currentAvg !== 'N/A' &&
    previousAvg !== null &&
    previousAvg !== 'N/A';

  const difference = hasValidValues
    ? (parseFloat(currentAvg) - parseFloat(previousAvg)).toFixed(1)
    : null;

  const getTrendIcon = () => {
    if (difference === null) return null;
    if (difference > 0) return <FaArrowUp className="text-[#ff0000] text-[6px] 2xl:text-[12px]" />;
    if (difference < 0) return <FaArrowDown className="text-[#00d500] text-[6px] 2xl:text-[12px]" />;
    return <FaEquals className="text-gray-400 text-[6px] 2xl:text-[12px]" />;
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
    <div className="flex flex-col justify-between items-center p-1 rounded  bg-[#e9eefb]/20 shadow-sm">
      <span className="text-[8px] 2xl:text-[12px] font-medium text-white leading-tight">{sensorId}</span>
      <div className="w-full leading-tight">
        <div className="flex items-baseline justify-between w-full px-1">
          <div className="flex flex-col items-center">
            <span className="text-[5px] 2xl:text-[10px] text-white mb-0.5">LDA</span>
            <span className="text-[7px] 2xl:text-[12px] text-white">{displayValue(previousAvg)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[5px] 2xl:text-[10px] text-white mb-0.5">CT</span>
            <div className="flex items-center">
              <span className={`text-[7px] 2xl:text-[12px] font-medium 2xl:font-semibold ${
                hasValidValues
                  ? difference > 0
                    ? 'text-[#ff0000]'
                    : difference < 0
                      ? 'text-[#00d500]'
                      : 'text-gray-400'
                  : 'text-gray-400'
              }`}>
                {displayValue(currentAvg)}
              </span>
              {hasValidValues && getTrendIcon()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorComparisonCard;




