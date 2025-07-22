import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from 'chart.js/auto';
import zoomPlugin from 'chartjs-plugin-zoom';

// Register the zoom plugin
ChartJS.register(zoomPlugin);

const Chartline = forwardRef(({ chartData, options }, ref) => {
  const chartRef = useRef(null);
  
  useImperativeHandle(ref, () => ({
    get chartInstance() {
      return chartRef.current;
    },
    resetZoom: () => {
      if (chartRef.current) {
        chartRef.current.resetZoom();
      }
    }
  }));

  return (
    <Line ref={chartRef} data={chartData} options={options} />
  );
});

export default Chartline;
