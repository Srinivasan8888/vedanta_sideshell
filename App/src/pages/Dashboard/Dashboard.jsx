import React, { useState, useEffect, lazy, Suspense } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import '../../Assets/Navbar/Sidebar.css';

// Lazy load the ModelViewer component with error boundary
const ModelViewer = lazy(() => 
  import('../../components/ModelViewer')
    .catch(() => ({ default: () => <div>Error loading 3D viewer</div> }))
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
  <div className="bg-[rgba(234,237,249,1)] p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow transition-shadow w-40 relative">
    <div className={`absolute bottom-4 right-1 pl-2 bg-white rounded-full p-1 flex items-center text-xs ${sensor.isPositive ? 'text-green-500' : 'text-red-500'}`}>
      {sensor.isPositive ? <FaArrowUp className="mr-0.5 mb-0.9" /> : <FaArrowDown className="mr-0.5 mb-0.9" />}
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
      <div className="flex flex-col h-full w-full text-2xl font-bold text-black lg:grid lg:grid-cols-2 lg:grid-rows-2 gap-4 p-4">
        <div className="order-2 rounded-lg overflow-hidden lg:order-1">
          <div className="grid h-full grid-col gap-2">
            <div className="bg-gray-900 border-2 border-gray-100 rounded-2xl shadow-md overflow-hidden">
              <div className="h-full w-full p-4">
                <div className="flex flex-col h-full w-full">
                  <div className="flex-1 overflow-x-auto scrollbar-custom 2xl:overflow-y-hidden">
                    <div className="flex space-x-2 md:space-x-12 p-1">
                      {Array(Math.ceil(sensors.length / 4)).fill().map((_, colIndex) => (
                        <div key={colIndex} className="flex-none w-40 md:space-y-5">
                          {sensors.slice(colIndex * 4, (colIndex + 1) * 4).map((sensor) => (
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
          </div>
        </div>
        <div className="order-1 flex items-center justify-center rounded-2xl lg:order-2 shadow-md overflow-hidden bg-white/30 backdrop-blur-sm border border-white/20" style={{ minHeight: '400px' }}>
          <Suspense fallback={<div className="w-full h-full flex items-center justify-center">Loading 3D model...</div>}>
            <ModelViewer modelPath="/side_shell.glb" />
          </Suspense>
        </div>
        <div className="order-3 flex items-center justify-center border-2 rounded-2xl lg:order-3 shadow-md">3</div>
        <div className="order-4 flex items-center justify-center border-2 rounded-2xl lg:order-4 shadow-md">4</div>
      </div>
    </div>

  );
};

export default Dashboard;
