import React from 'react';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS } from 'chart.js/auto';

const Chartline = ({ chartData, options }) => {
  return (
    <Line data={chartData} options={options} />
  );
};

export default Chartline;
