import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Helper function to get sensor name based on waveguide and sensor number
const getSensorName = (waveguide, sensorNumber) => {
  const sensorNum = parseInt(sensorNumber.replace('sensor', ''), 10);
  if (waveguide === 'ASide' || waveguide === 'Aside') {
    return `ES${sensorNum}`; // East Side sensors: ES1, ES2, etc.
  } else if (waveguide === 'BSide' || waveguide === 'Bside') {
    return `WS${sensorNum + 12}`; // West Side sensors: WS13, WS14, etc.
  }
  return sensorNumber; // Fallback to original if waveguide is not recognized
};

const AnalyticsChart = ({ data }) => {
  // Transform the data if it's in the new format (array of readings with timestamps)
  const transformData = (apiData) => {
    if (!apiData || !Array.isArray(apiData)) {
      console.error("Expected an array of data points, but received:", apiData);
      return { labels: [], datasets: [] };
    }

    // Extract timestamps for x-axis labels
    const labels = apiData.map(item => {
      // Handle both 'timestamp' and 'TIME' fields
      const dateValue = item.timestamp || item.TIME;
      if (!dateValue) return '';
      
      // If it's already a formatted string, return as is
      if (typeof dateValue === 'string' && dateValue.includes('-') && dateValue.includes(':')) {
        return dateValue;
      }
      
      // Otherwise, try to parse as Date
      const date = new Date(dateValue);
      return isNaN(date) ? String(dateValue) : date.toLocaleString();
    });

    // Get waveguide from first data point (assuming all points in the dataset are from the same side)
    const waveguide = apiData[0]?.waveguide || '';
    
    // Get all sensor keys (exclude non-sensor, timestamp, and waveguide fields)
    const sensorKeys = Object.keys(apiData[0] || {})
      .filter(key => key.startsWith('sensor') && 
                    !isNaN(key.replace('sensor', '')) && 
                    key !== 'waveguide')
      // Filter out sensors that have all 'N/A' values
      .filter(sensorKey => {
        const hasValidData = apiData.some(item => {
          const value = item[sensorKey];
          return value && value !== 'N/A' && value !== 'n/a' && value !== 'null' && value !== 'undefined';
        });
        // console.log(`Sensor ${sensorKey} has valid data:`, hasValidData);
        return hasValidData;
      });
    
    // console.log('Filtered sensor keys:', sensorKeys);

    // Create a dataset for each sensor
    const datasets = sensorKeys.map((sensorKey, index) => {
      const sensorNumber = sensorKey.replace('sensor', '');
      const sensorName = getSensorName(waveguide, sensorKey);
      return {
        label: sensorName,
        data: apiData.map(item => ({
          x: item.timestamp || item.TIME,
          y: parseFloat(item[sensorKey]) || null,
          timestamp: item.timestamp || item.TIME,
          sensorName: sensorName,
          value: item[sensorKey]
        })),
        borderColor: `hsl(${(index * 137.508) % 360}, 70%, 60%)`,
        backgroundColor: `hsla(${(index * 137.508) % 360}, 70%, 60%, 0.1)`,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        tension: 0.3,
      };
    });

    return { labels, datasets };
  };

  // Transform the incoming data
  const chartData = transformData(Array.isArray(data) ? data : (data?.data || []));
  const dataPointsCount = chartData.labels.length;

  if (dataPointsCount === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xl text-center text-gray-400">
        No data available to display. Please adjust your filters.
      </div>
    );
  }

  // console.log("chartDate", chartData);
  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Ensure the chart does not maintain aspect ratio
    elements: {
      line: {
        tension: 0,
        borderWidth: 2,
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "white",
          font: {
            size: 12,
          },
          // Only show legend items that have data
          filter: function(legendItem, chartData) {
            const dataset = chartData.datasets[legendItem.datasetIndex];
            return dataset.data.some(point => point.y !== null);
          }
        }
      },
      tooltip: {
        callbacks: {
          title: function(context) {
            // Show timestamp in tooltip title
            return context[0].raw.timestamp || context[0].label;
          },
          label: function(context) {
            // Show sensor name and value in tooltip
            const label = context.dataset.label || '';
            const value = context.raw.value;
            return `${label}: ${value}°C`;
          }
        }
      },
    },
    scales: {
      x: {
        ticks: {
          color: "white",
          autoSkip: true,
          maxTicksLimit: 10,
        },
        grid: {
          display: false,
        },
      },
      y: {
        position: 'right',
        ticks: {
          color: "white",
          callback: function (value) {
            if (typeof value === 'number' && !isNaN(value)) {
              return `${value.toFixed(2)}°C`;
            }
            return String(value);
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.5)",
          drawOnChartArea: false,
        },
      },
    },
  };

  // Responsive options
  const responsiveOptions = {
    ...options,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      ...options.plugins,
      legend: {
        ...options.plugins.legend,
        position: window.innerWidth < 768 ? 'bottom' : 'top',
        labels: {
          ...options.plugins.legend.labels,
          boxWidth: 12,
          padding: 10,
          font: {
            size: window.innerWidth < 768 ? 10 : 12
          }
        }
      },
      tooltip: {
        ...options.plugins.tooltip,
        titleFont: {
          size: window.innerWidth < 768 ? 10 : 12
        },
        bodyFont: {
          size: window.innerWidth < 768 ? 10 : 12
        },
        padding: window.innerWidth < 768 ? 6 : 10
      }
    },
    scales: {
      ...options.scales,
      x: {
        ...options.scales.x,
        ticks: {
          ...options.scales.x.ticks,
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          font: {
            size: window.innerWidth < 768 ? 8 : 10
          }
        }
      },
      y: {
        ...options.scales.y,
        ticks: {
          ...options.scales.y.ticks,
          font: {
            size: window.innerWidth < 768 ? 8 : 10
          }
        }
      }
    }
  };

  return (
    <div className="bg-[rgba(16,16,16,0.7)] rounded-xl relative h-full w-full flex flex-col">
      <div className="px-2 py-1 text-xs sm:text-sm text-white bg-black bg-opacity-50 rounded-tl-xl w-fit">
        Data Points: {dataPointsCount}
      </div>
      <div className="flex-1 p-1 sm:p-2 w-full h-full min-h-[300px] md:min-h-[400px]">
        <Line 
          data={chartData} 
          options={responsiveOptions} 
          style={{ 
            width: '100%',
            height: '100%',
            minHeight: '300px'
          }} 
        />
      </div>
    </div>
  );
};

export default AnalyticsChart;
