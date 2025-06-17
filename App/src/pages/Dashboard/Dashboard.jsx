import React, { useState, useEffect, lazy, Suspense } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import '../../Assets/Navbar/Sidebar.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Lazy load the ModelViewer component with error boundary
const ModelViewer = lazy(() =>
  import('../../components/ModelViewer')
    .catch(() => ({ 'default': () => <div>Error loading 3D viewer</div> }))
);

// Simple loading component
const Loader = () => (
  <div className="w-full h-full flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);
// Sample data generation function
const generateSensorData = () => {
  const sensors = [];
  for (let i = 1; i <= 76; i++) {
    const value = (Math.random() * 100).toFixed(2);
    const previousValue = (Math.random() * 100).toFixed(2);
    const difference = (value - previousValue).toFixed(2);
    const isPositive = difference >= 0;

    sensors.push({
      id: i,
      name: `Sensor ${i}`,
      value,
      difference: Math.abs(difference),
      isPositive,
      // unit: '°C'
    });
  }
  return sensors;
};

const SensorCard = ({ sensor }) => (
  <div className="bg-[rgba(234,237,249,1)] p-3 rounded-lg shadow-md border border-gray-200 hover:shadow transition-shadow 2xl:w-40 relative">
    <div className={`absolute bottom-4 right-1  bg-white rounded-full p-1 pl-2 pr-2 flex items-center text-xs ${sensor.isPositive ? 'text-green-500' : 'text-red-500'}`}>
      {sensor.isPositive ? <FaArrowUp className="mr-0.5 mb-1 mt-0.5" /> : <FaArrowDown className="mr-0.5 mb-1 mt-0.5" />}
      <span className="font-medium">
        {sensor.difference}
      </span>
    </div>
    <div className="flex flex-col">
      <h3 className="text-sm font-bold text-[#1e2c74] truncate flex left-0">{sensor.name}</h3>
      <div className="flex items-baseline">
        <span className="text-lg font-bold text-[#3047c0]">
          {sensor.value}
          <span className="text-lg font-bold text-[#3047c0]">°C</span>
        </span>
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const [sensors, setSensors] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    setSensors(generateSensorData());

    // Update data every 5 seconds
    const interval = setInterval(() => {
      setSensors(generateSensorData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);
  return (
    <div className="h-full w-full">
      <div className="flex flex-col h-full w-full text-2xl font-bold text-black xl:grid xl:grid-cols-2 xl:grid-rows-2 gap-4 p-1">
        <div className="order-2 rounded-lg overflow-hidden xl:order-1">
          <div className="grid h-full grid-col gap-2">
            <div className="bg-white/30 backdrop-blur-sm border-2 border-gray-100 rounded-2xl shadow-md overflow-hidden h-full w-full p-4">
              <div className="flex-1 overflow-x-auto scrollbar-custom xl:overflow-y-hidden">
                <div className="flex space-x-2 2xl:space-x-12 p-1">
                  {Array(Math.ceil(sensors.length / 3)).fill().map((_, colIndex) => (
                    <div key={colIndex} className="flex-none w-40 space-y-2 2xl:space-y-3">
                      {sensors.slice(
                        colIndex * 3,
                        colIndex * 3 + (window.innerWidth >= 1920 ? 4 : 3)
                      ).map((sensor) => (
                        <div key={sensor.id} className="h-20">
                          <SensorCard sensor={sensor} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* <div className="order-1 flex items-center justify-center rounded-2xl  xl:order-2 shadow-md overflow-hidden bg-white/30 backdrop-blur-sm border-2 border-gray-100"> */}
        <div className="order-1 flex items-center justify-center rounded-2xl  xl:order-2 overflow-hidde">

          <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading 3D model...</div>}>
            <ModelViewer modelPath="/side_shell.glb" />
          </Suspense>
        </div>
        <div className="order-3 flex flex-col xl:flex-row items-stretch rounded-2xl xl:order-3 shadow-md p-4 gap-4 bg-white/30 backdrop-blur-sm border border-gray-100 overflow-hidden">
          <div className="w-full  rounded-xl overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Hourly Temperature Averages</h3>
            <div className="overflow-x-auto max-h-96 overflow-y-auto scrollbar-custom">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50 sticky top-0">
                  <tr>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Temp (°C)</th>
                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200">
                  {Array.from({ length: 24 }).map((_, index) => {
                    const temp = (Math.random() * 20 + 20).toFixed(1);
                    const time = new Date();
                    time.setHours(index, 0, 0, 0);
                    const timeString = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{timeString}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">{temp}°C</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            temp > 35 ? 'bg-red-100 text-red-800' : 
                            temp > 30 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-green-100 text-green-800'
                          }`}>
                            {temp > 35 ? 'High' : temp > 30 ? 'Moderate' : 'Normal'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
          <div className="w-full border-2 border-white rounded-2xl p-4 bg-white/50">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Temperature Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/80 p-3 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600">Max Temp</p>
                <p className="text-xl font-bold text-red-600">38.2°C</p>
              </div>
              <div className="bg-white/80 p-3 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600">Min Temp</p>
                <p className="text-xl font-bold text-blue-600">22.5°C</p>
              </div>
              <div className="bg-white/80 p-3 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600">Avg Temp</p>
                <p className="text-xl font-bold text-gray-800">29.8°C</p>
              </div>
              <div className="bg-white/80 p-3 rounded-lg border border-gray-100">
                <p className="text-sm text-gray-600">Alerts</p>
                <p className="text-xl font-bold text-red-600">3</p>
              </div>
            </div>
           
          </div>
        </div>
        <div className="order-4 p-4 border-2 rounded-2xl xl:order-4 shadow-md bg-white/30 backdrop-blur-sm">
          <div className="w-full h-full">
            <Line
              data={{
                labels: Array.from({ length: 24 }, (_, i) => {
                  const date = new Date();
                  date.setHours(i, 0, 0, 0);
                  return date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
                }),
                datasets: [{
                  label: 'Temperature (°C)',
                  data: Array.from({ length: 24 }, () => (Math.random() * 20 + 20).toFixed(1)),
                  borderColor: 'rgb(79, 70, 229)',
                  backgroundColor: 'rgba(79, 70, 229, 0.2)',
                  tension: 0.4,
                  fill: true,
                  pointBackgroundColor: 'white',
                  pointBorderColor: 'rgb(79, 70, 229)',
                  pointHoverRadius: 6,
                  pointHoverBackgroundColor: 'white',
                  pointHoverBorderColor: 'rgb(99, 102, 241)',
                  pointHoverBorderWidth: 2,
                  pointHitRadius: 10,
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      color: '#4B5563',
                      font: {
                        size: 12
                      }
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    titleColor: '#111827',
                    bodyColor: '#4B5563',
                    borderColor: '#E5E7EB',
                    borderWidth: 1,
                    padding: 12,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    callbacks: {
                      label: function(context) {
                        return ` ${context.parsed.y}°C`;
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                    },
                    ticks: {
                      color: '#6B7280',
                      maxRotation: 0,
                      autoSkip: true,
                      maxTicksLimit: 8
                    }
                  },
                  y: {
                    grid: {
                      color: 'rgba(229, 231, 235, 0.5)',
                      drawBorder: false
                    },
                    ticks: {
                      color: '#6B7280',
                      callback: function(value) {
                        return value + '°C';
                      }
                    },
                    min: 15,
                    max: 45
                  }
                },
                elements: {
                  line: {
                    borderWidth: 2
                  },
                  point: {
                    radius: 3,
                    hoverRadius: 5
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index'
                },
                layout: {
                  padding: {
                    top: 10,
                    right: 15,
                    bottom: 10,
                    left: 10
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>

  );
};

export default Dashboard;
