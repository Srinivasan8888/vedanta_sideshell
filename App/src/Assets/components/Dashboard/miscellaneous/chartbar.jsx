import React from 'react'
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS } from 'chart.js/auto'

const Chartbar = ({ chartData, options }) => {
  return (
    <Bar data={chartData} options={options} />
  )
}

export default Chartbar