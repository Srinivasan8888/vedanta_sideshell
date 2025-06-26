import React, { useState } from "react";
import '../miscellaneous/Scrollbar.css';
import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const HeatmapTable = ({ data = [] }) => {
  // Extract all unique sensor names from the data
  const sensorNames = React.useMemo(() => {
    const names = new Set();
    data.forEach(day => {
      day.sensors?.forEach(sensor => {
        names.add(sensor.sensorName);
      });
    });
    return Array.from(names).sort((a, b) => 
      parseInt(a.replace('sensor', '')) - parseInt(b.replace('sensor', ''))
    );
  }, [data]);

  // Create a map of date to sensor values for quick lookup
  const dateToSensorsMap = React.useMemo(() => {
    const map = new Map();
    data.forEach(day => {
      const sensorMap = new Map();
      day.sensors?.forEach(sensor => {
        sensorMap.set(sensor.sensorName, sensor.value);
      });
      map.set(day.date, sensorMap);
    });
    return map;
  }, [data]);

  const noDataAvailable = !data || data.length === 0;

  // Function to get value for a sensor on a specific date
  const getSensorValue = (date, sensorName) => {
    const sensorMap = dateToSensorsMap.get(date);
    return sensorMap?.get(sensorName);
  };

  // Function to determine cell color based on value
  const getValueColor = (value) => {
    if (value === undefined || value === null) return 'bg-gray-800 text-gray-500';
    
    if (value < 60) return 'bg-blue-900/30 text-blue-300';
    if (value < 70) return 'bg-green-900/30 text-green-400';
    if (value < 80) return 'bg-yellow-900/30 text-yellow-400';
    if (value < 90) return 'bg-orange-900/30 text-orange-400';
    return 'bg-red-900/30 text-red-400';
  };

  // Function to get color intensity based on value
  const getIntensity = (value) => {
    if (value === undefined || value === null) return 'bg-opacity-20';
    const normalized = Math.min(100, value) / 100;
    return `bg-opacity-${Math.max(30, Math.floor(normalized * 70) + 30)}`;
  };

  // State for tooltip
  const [tooltipContent, setTooltipContent] = useState('');

  return (
    <div className="relative w-full overflow-x-auto rounded-xl shadow-lg scrollbar-custom">
      <Tooltip id="sensor-tooltip" place="top" effect="solid" className="z-50" />
      <table className="w-full text-sm font-normal text-white font-poppins">
        <thead className="sticky top-0 bg-gradient-to-r from-gray-900 to-gray-800 z-10 rounded-t-lg shadow-md">
          <tr>
            <th className="px-3 py-3 border-b border-gray-700 text-left text-sm font-semibold text-gray-200 bg-gray-900/80 backdrop-blur-sm">
              <div className="flex items-center">
                <span>Date</span>
              </div>
            </th>
            {sensorNames.map((sensorName, index) => (
              <th 
                key={sensorName}
                className={`px-2 py-3 border-b border-gray-700 text-center text-xs font-medium text-gray-200 ${
                  index % 2 === 0 ? 'bg-gray-900/80' : 'bg-gray-900/70'
                } hover:bg-gray-800/80 transition-colors duration-200`}
                data-tooltip-id="sensor-tooltip"
                data-tooltip-content={`${sensorName}`}
              >
                <div className="transform transition-transform hover:scale-110">
                  {sensorName.replace('sensor', 'S')}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {noDataAvailable ? (
            <tr className="bg-gray-900/50">
              <td 
                colSpan={sensorNames.length + 1}
                className="px-6 py-12 text-center text-gray-400 text-sm"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <svg className="w-10 h-10 text-gray-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>No data available for the selected date range</span>
                </div>
              </td>
            </tr>
          ) : (
            data.map((day, rowIndex) => {
              const date = new Date(day.date);
              const isToday = new Date().toDateString() === date.toDateString();
              
              return (
                <tr 
                  key={day.date} 
                  className={`group transition-all duration-200 ${
                    isToday 
                      ? 'bg-blue-900/10 hover:bg-blue-900/20' 
                      : 'bg-gray-900/50 hover:bg-gray-800/60'
                  }`}
                >
                  <td className={`px-3 py-3 whitespace-nowrap text-sm font-medium ${
                    isToday ? 'text-blue-300' : 'text-gray-300'
                  } border-b border-gray-800`}>
                    <div className="flex items-center">
                      {isToday && (
                        <span className="flex h-2 w-2 mr-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                      )}
                      {date.toLocaleDateString('en-GB', {
                        weekday: 'short',
                        day: '2-digit',
                        month: 'short',
                      })}
                    </div>
                  </td>
                  {sensorNames.map((sensorName, colIndex) => {
                    const value = getSensorValue(day.date, sensorName);
                    const tooltipId = `tooltip-${day.date}-${sensorName}`;
                    
                    return (
                      <td
                        key={`${day.date}-${sensorName}`}
                        className={`px-3 py-2 text-center text-sm border-b border-gray-800 transition-all duration-200 ${
                          colIndex % 2 === 0 ? 'bg-gray-900/30' : 'bg-gray-900/40'
                        } ${getValueColor(value)} ${getIntensity(value)}`}
                        data-tooltip-id={tooltipId}
                        onMouseEnter={() => {
                          setTooltipContent(`${sensorName}: ${value !== undefined && value !== null ? value.toFixed(2) : 'N/A'}`);
                        }}
                      >
                        <div className={`px-2 py-1 rounded-md transition-all duration-200 transform hover:scale-110 ${
                          value !== null && value !== undefined ? 'hover:bg-white/5' : ''
                        }`}>
                          {value !== undefined && value !== null ? value.toFixed(1) : '-'}
                        </div>
                        <Tooltip id={tooltipId} place="top" effect="solid" className="z-50">
                          {`${sensorName}: ${value !== undefined && value !== null ? value.toFixed(2) : 'N/A'}`}
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HeatmapTable;
