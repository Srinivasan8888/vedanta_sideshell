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

const AnalyticsChart = ({ data }) => {
  // console.log("Fetched Data:", data);
  // Check if data is an object with labels and datasets
  if (!data || typeof data !== 'object' || !Array.isArray(data.labels) || !Array.isArray(data.datasets)) {
    console.error("Expected data to be an object with labels and datasets, but received:", data);
    return <div className="flex items-center justify-center h-full text-5xl text-center text-white text-semibold">No data available to display.</div>; // Handle non-array data
  }

  // Get the number of data points
  const dataPointsCount = data.labels.length;

  // Prepare the chart data based on the fetched data
  const chartData = {
    labels: data.labels, // Use the labels directly from the data
    datasets: data.datasets, // Use the datasets directly from the data
  };

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
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `${context.raw.toFixed(2)}°C`; // Customize tooltip label with fixed 2 decimal places
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
        position: 'right',
        ticks: {
          color: "white",
          callback: function (value) {
            return `${value.toFixed(2)}°C`; // Customize y-axis labels with fixed 2 decimal places
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.5)",
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="bg-[rgba(16,16,16,0.7)] rounded-xl relative h-full">
      {/* Display the number of data points in the top-right corner */}
      <div className="absolute top-0 left-0 px-2 py-1 text-sm text-white bg-black bg-opacity-50 rounded rounded-tl-xl">
        Data Points: {dataPointsCount}
      </div>
      <Line data={chartData} options={options} style={{ height: "100%" }} />
    </div>
  );
};

export default AnalyticsChart;