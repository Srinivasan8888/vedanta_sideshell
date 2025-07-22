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
  Legend,
);

// Helper function to get sensor name based on waveguide and sensor number
const getSensorName = (waveguide, sensorNumber) => {
  const sensorNum = parseInt(sensorNumber.replace("sensor", ""), 10);
  if (waveguide === "ASide" || waveguide === "Aside") {
    return `ES${sensorNum}`; // East Side sensors: ES1, ES2, etc.
  } else if (waveguide === "BSide" || waveguide === "Bside") {
    return `WS${sensorNum + 12}`; // West Side sensors: WS13, WS14, etc.
  }
  return sensorNumber; // Fallback to original if waveguide is not recognized
};

const AnalyticsChart = ({ data }) => {
  // Transform the data if it's in the new format (array of readings with timestamps)
  const transformData = (apiData, metadata = {}) => {
    if (!apiData || !Array.isArray(apiData)) {
      console.error("Expected an array of data points, but received:", apiData);
      return { labels: [], datasets: [] };
    }

    // Extract timestamps for x-axis labels
    const labels = apiData.map((item) => {
      // Handle both 'timestamp' and 'TIME' fields
      const dateValue = item.timestamp || item.TIME;
      if (!dateValue) return "";

      // If it's already a formatted string, return as is
      if (
        typeof dateValue === "string" &&
        dateValue.includes("-") &&
        dateValue.includes(":")
      ) {
        return dateValue;
      }

      // Otherwise, try to parse as Date
      const date = new Date(dateValue);
      return isNaN(date) ? String(dateValue) : date.toLocaleString();
    });

    // Get waveguide from metadata first, then fallback to first data point
    const waveguide = metadata.side || apiData[0]?.waveguide || "";

    // Get all sensor keys (exclude non-sensor, timestamp, and waveguide fields)
    const sensorKeys = Object.keys(apiData[0] || {})
      .filter(
        (key) =>
          key.startsWith("sensor") &&
          !isNaN(key.replace("sensor", "")) &&
          key !== "waveguide",
      )
      // Filter out sensors that have all 'N/A' values
      .filter((sensorKey) => {
        const hasValidData = apiData.some((item) => {
          const value = item[sensorKey];
          return (
            value &&
            value !== "N/A" &&
            value !== "n/a" &&
            value !== "null" &&
            value !== "undefined"
          );
        });
        // console.log(`Sensor ${sensorKey} has valid data:`, hasValidData);
        return hasValidData;
      });

    // console.log('Filtered sensor keys:', sensorKeys);

    // Create a dataset for each sensor
    const datasets = sensorKeys.map((sensorKey, index) => {
      const sensorNumber = sensorKey.replace("sensor", "");
      const sensorName = getSensorName(waveguide, sensorKey);
      return {
        label: sensorName,
        data: apiData.map((item) => ({
          x: item.timestamp || item.TIME,
          y: parseFloat(item[sensorKey]) || null,
          timestamp: item.timestamp || item.TIME,
          sensorName: sensorName,
          value: item[sensorKey],
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
  const chartData = transformData(
    Array.isArray(data) ? data : data?.data || [],
    data?.metadata || {},
  );
  const dataPointsCount = chartData.labels.length;

  if (dataPointsCount === 0) {
    return (
      <div className="flex h-full items-center justify-center text-center text-[12px] font-normal text-gray-400 xl:text-[8px] 2xl:text-[15px]">
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
          filter: function (legendItem, chartData) {
            const dataset = chartData.datasets[legendItem.datasetIndex];
            return dataset.data.some((point) => point.y !== null);
          },
        },
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            // Show timestamp in tooltip title
            return context[0].raw.timestamp || context[0].label;
          },
          label: function (context) {
            // Show sensor name and value in tooltip
            const label = context.dataset.label || "";
            const value = context.raw.value;
            return `${label}: ${value}°C`;
          },
        },
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
        position: "right",
        ticks: {
          color: "white",
          callback: function (value) {
            if (typeof value === "number" && !isNaN(value)) {
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
        position: window.innerWidth < 768 ? "bottom" : "top",
        labels: {
          ...options.plugins.legend.labels,
          boxWidth: 12,
          padding: 10,
          font: {
            size: window.innerWidth < 768 ? 10 : 12,
          },
        },
      },
      tooltip: {
        ...options.plugins.tooltip,
        titleFont: {
          size: window.innerWidth < 768 ? 10 : 12,
        },
        bodyFont: {
          size: window.innerWidth < 768 ? 10 : 12,
        },
        padding: window.innerWidth < 768 ? 6 : 10,
      },
    },
    scales: {
      ...options.scales,
      x: {
        ...options.scales.x,
        ticks: {
          ...options.scales.x.ticks,
          maxRotation: window.innerWidth < 768 ? 45 : 0,
          font: {
            size: window.innerWidth < 768 ? 8 : 10,
          },
        },
      },
      y: {
        ...options.scales.y,
        ticks: {
          ...options.scales.y.ticks,
          font: {
            size: window.innerWidth < 768 ? 8 : 10,
          },
        },
      },
    },
  };

  return (
    <div className="relative flex h-full w-full flex-col rounded-xl bg-gradient-to-br from-white/20 via-white/5 to-white/20">
      <div className="ext-xs w-fit rounded-tl-xl bg-black bg-opacity-50 text-white sm:text-sm">
        Data Points: {dataPointsCount}
      </div>
      <div className="h-full w-full flex-1 p-4">
        <Line
          data={chartData}
          options={responsiveOptions}
          style={{
            width: "100%",
            height: "100%",
          }}
        />
      </div>
    </div>
  );
};

export default AnalyticsChart;
