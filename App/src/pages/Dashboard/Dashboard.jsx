import React, { useState, useEffect, lazy, Suspense, useCallback } from 'react';
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
  <div className="bg-[rgba(234,237,249,1)] p-3 rounded-lg shadow-md border border-gray-200 hover:shadow transition-shadow 2xl:w-40 relative group">
    <button className="absolute right-4 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-blue-50 rounded">
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M2.005 0L10.005 8L2.005 16L0 14L6.005 8L0 2L2.005 0Z" fill="#3047C0" />
      </svg>
    </button>

    <div className={`absolute bottom-3 right-1 bg-white rounded-full p-1 pl-2 pr-2 flex items-center text-xs ${sensor.isPositive ? 'text-green-500' : 'text-red-500'}`}>
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
  const [timeInterval, setTimeInterval] = useState('1H');

  const handleTimeIntervalChange = (interval) => {
    setTimeInterval(interval);
    // Here you would typically fetch new data based on the selected interval
    console.log(`Time interval changed to: ${interval}`);
    // Update your chart data based on the selected interval
  };
  const [sensors, setSensors] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = React.useRef(null);
  const scrollAmount = 200; // Adjust this value to control scroll distance

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      const newPosition = Math.max(0, scrollPosition - scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  }, [scrollPosition, scrollAmount]);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      const maxScroll = scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;
      const newPosition = Math.min(maxScroll, scrollPosition + scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: 'smooth'
      });
      setScrollPosition(newPosition);
    }
  }, [scrollPosition, scrollAmount]);

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
              <div className="relative">
                <button
                  onClick={scrollLeft}
                  className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 ${scrollPosition <= 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                  aria-label="Scroll left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <div
                  ref={scrollContainerRef}
                  className="flex-1 overflow-x-auto scrollbar-custom xl:overflow-y-hidden px-4"
                  style={{ scrollBehavior: 'smooth' }}
                  onScroll={(e) => setScrollPosition(e.target.scrollLeft)}
                >

                

                {/* Mobile */}
                <div className="flex space-x-2 md:hidden p-1">
                    {Array(Math.ceil(sensors.length / 3)).fill().map((_, colIndex) => (
                      <div key={colIndex} className="flex-none w-40 space-y-2 2xl:space-y-3">
                        {sensors.slice(
                          colIndex * 4,
                          colIndex * 4 + (window.innerWidth >= 1920 ? 3 : 4)
                        ).map((sensor) => (
                          <div key={sensor.id} className="h-20">
                            <SensorCard sensor={sensor} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                {/* ipad mini and ipad air */}
                <div className="md:flex space-x-2 hidden lg:hidden  p-1">
                    {Array(Math.ceil(sensors.length / 3)).fill().map((_, colIndex) => (
                      <div key={colIndex} className="flex-none w-40 space-y-2 2xl:space-y-3">
                        {sensors.slice(
                          colIndex * 5,
                          colIndex * 5 + 5
                        ).map((sensor) => (
                          <div key={sensor.id} className="h-20">
                            <SensorCard sensor={sensor} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="xl:flex space-x-2 hidden md:hidden lg:hidden 2xl:hidden p-1">
                    {Array(Math.ceil(sensors.length / 3)).fill().map((_, colIndex) => (
                      <div key={colIndex} className="flex-none w-40 space-y-2 2xl:space-y-3">
                        {sensors.slice(
                          colIndex * 3,
                          colIndex * 3 + 3
                        ).map((sensor) => (
                          <div key={sensor.id} className="h-20">
                            <SensorCard sensor={sensor} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="hidden 2xl:flex space-x-2 p-1">
                    {Array(Math.ceil(sensors.length / 4)).fill().map((_, colIndex) => (
                      <div key={colIndex} className="flex-none w-40 space-y-3">
                        {sensors.slice(
                          colIndex * 4,
                          colIndex * 4 + 4
                        ).map((sensor) => (
                          <div key={sensor.id} className="h-20">
                            <SensorCard sensor={sensor} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>

                {/* <div className="hidden 3xl-custom:flex space-x-12 p-1">
                   {Array(Math.ceil(sensors.length / 5)).fill().map((_, colIndex) => (
                      <div key={colIndex} className="flex-none w-40 space-y-3">
                        {sensors.slice(
                          colIndex * 5,
                          colIndex * 5 + 5
                        ).map((sensor) => (
                          <div key={sensor.id} className="h-20">
                            <SensorCard sensor={sensor} />
                          </div>
                        ))}
                      </div>
                    ))}
                  </div> */}


              </div>
              <button
                onClick={scrollRight}
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 ${scrollContainerRef.current && scrollPosition >= (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 10) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                aria-label="Scroll right"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
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
        <div className="w-full   rounded-xl overflow-hidden">
          <div className="overflow-x-auto h-96 md:h-full overflow-y-auto scrollbar-custom">
            <table className="min-w-full  divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th scope="col" className="lg:px-2 2xl:px-4 py-2 text-left text-xs lg:font-regular 2xl:font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th scope="col" className="lg:px-2 2xl:px-4 py-2 text-left text-xs lg:font-regular 2xl:font-medium text-gray-500 uppercase tracking-wider">Time</th>
                  <th scope="col" className="lg:px-2 2xl:px-4 py-2 text-left text-xs lg:font-regular 2xl:font-medium text-gray-500 uppercase tracking-wider">Temp (°C)</th>
                  <th scope="col" className="lg:px-2 2xl:px-4 py-2 text-left text-xs lg:font-regular 2xl:font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                      <td className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>
                      <td className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap text-sm text-gray-900">{timeString}</td>
                      <td className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap text-sm text-gray-900">{temp}°C</td>
                      <td className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${temp > 35 ? 'bg-red-100 text-red-800' :
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

        <div className="w-full h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-2 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-700">Temperature Statistics</h3>
              <div className="flex items-center space-x-1 bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                <span>Live</span>
              </div>
            </div>
          </div>

          <div className="p-3 grid grid-cols-2 lg:grid-cols-4 2xl:grid-cols-2 gap-3 flex-grow">
            <div className="bg-gradient-to-br from-red-50 to-white p-3 rounded-lg border border-red-100 h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-red-600">Max Temp</span>
                <div className="p-1.5 bg-red-100 rounded-lg hidden 2xl:flex">
                  <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                  </svg>
                </div>
              </div>
              <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">38.2°C</p>
              <p className="text-xs text-gray-500 mt-auto">+2.4° from avg</p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-white p-3 rounded-lg border border-blue-100 h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-blue-600">Min Temp</span>
                <div className="p-1.5 bg-blue-100 rounded-lg hidden 2xl:flex">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="lg:text-xs lg:font-regular 2xl:text-2xl 2xl:font-bold text-gray-800">22.5°C</p>
              <p className="text-xs text-gray-500 mt-auto">-1.8° from avg</p>
            </div>

            <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-100 h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-600">Avg Temp</span>
                <div className="p-1.5 bg-gray-100 rounded-lg hidden 2xl:flex">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
              </div>
              <p className="lg:text-xs lg:font-regular 2xl:text-2xl 2xl:font-bold text-gray-800">29.8°C</p>
              <p className="text-xs text-gray-500 mt-auto">Last 24h average</p>
            </div>

            <div className="bg-gradient-to-br from-amber-50 to-white p-3 rounded-lg border border-amber-100 h-full flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-amber-600">Alerts</span>
                <div className="p-1.5 bg-amber-100 rounded-lg hidden 2xl:flex">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <p className="lg:text-xs lg:font-regular 2xl:text-2xl 2xl:font-bold text-gray-800">3</p>
              <p className="text-xs text-amber-600 font-medium mt-auto">Requires attention</p>
            </div>
          </div>

          <div className="mt-auto p-3 bg-gray-50 border-t border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 items-end">
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Min Threshold</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Min value"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">°C</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Max Threshold</label>
                <div className="relative">
                  <input
                    type="number"
                    className="w-full pl-3 pr-8 py-1.5 text-sm border border-gray-200 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Max value"
                  />
                  <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-gray-500">°C</span>
                </div>
              </div>

              <div className="sm:col-span-1">
                <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white lg:text-xs lg:font-thin 2xl:text-sm 2xl:font-medium py-[7px]  rounded-md shadow-sm hover:shadow transition-all duration-150 whitespace-nowrap">
                  Save
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
      <div className="order-4 p-4 border-2 rounded-2xl xl:order-4 shadow-md bg-white/30 backdrop-blur-sm">
        <div className="relative w-full  md:h-full">
          {/* Chart Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Temperature Trend</h3>
              <p className="text-sm text-gray-500">Last 24 hours temperature data</p>
            </div>
            <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
              {['1H', '2H', '5H', '7H', '12H', '24H'].map((interval) => (
                <button
                  key={interval}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all duration-200 border
                      ${timeInterval === interval
                      ? 'bg-blue-100 border-blue-300 text-blue-700 shadow-sm scale-[1.02]'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'}
                      focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500`}
                  onClick={() => handleTimeIntervalChange(interval)}
                >
                  {interval}
                </button>
              ))}
            </div>
          </div>
          
          {/* Chart Container */}
          <div className="relative h-[calc(100%-50px)] bg-white/50 rounded-lg p-3 border border-gray-100">
            <Line
              data={{
                labels: Array.from({ length: 24 }, (_, i) => {
                  const date = new Date();
                  date.setHours(i, 0, 0, 0);
                  return date.toLocaleTimeString('en-US', { hour: '2-digit', hour12: true });
                }),
                datasets: [{
                  label: 'Temperature',
                  data: Array.from({ length: 24 }, () => (Math.random() * 20 + 20).toFixed(1)),
                  borderColor: 'rgb(79, 70, 229)',
                  backgroundColor: 'rgba(79, 70, 229, 0.1)',
                  tension: 0.3,
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
                    display: true,
                    position: 'top',
                    align: 'center',
                    labels: {
                      color: '#4B5563',
                      font: {
                        size: 13,
                        weight: 500
                      },
                      boxWidth: 12,
                      padding: 15,
                      usePointStyle: true,
                    }
                  },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    titleColor: '#1F2937',
                    titleFont: { weight: '600' },
                    bodyColor: '#4B5563',
                    borderColor: '#E5E7EB',
                    borderWidth: 1,
                    padding: 12,
                    boxShadow: '0 4px 20px -5px rgba(0, 0, 0, 0.1)',
                    cornerRadius: 8,
                    displayColors: false,
                    callbacks: {
                      label: function(context) {
                        return `  ${context.parsed.y}°C`;
                      },
                      title: function(context) {
                        const date = new Date();
                        date.setHours(context[0].dataIndex, 0, 0, 0);
                        return date.toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit',
                          hour12: true 
                        });
                      }
                    }
                  }
                },
                scales: {
                  x: {
                    grid: {
                      display: false,
                      drawTicks: false
                    },
                    border: {
                      display: false
                    },
                    ticks: {
                      color: '#6B7280',
                      font: {
                        size: 11
                      },
                      maxRotation: 0,
                      autoSkip: true,
                      maxTicksLimit: 8,
                      padding: 8
                    }
                  },
                  y: {
                    grid: {
                      color: 'rgba(229, 231, 235, 0.5)',
                      drawBorder: false,
                      drawTicks: false,
                      borderDash: [4, 4]
                    },
                    border: {
                      display: false
                    },
                    ticks: {
                      color: '#6B7280',
                      font: {
                        size: 11
                      },
                      padding: 8,
                      callback: function(value) {
                        return value + '°C';
                      }
                    },
                    min: 15,
                    max: 45,
                    beginAtZero: false
                  }
                },
                elements: {
                  line: {
                    borderWidth: 2.5,
                    borderJoinStyle: 'round',
                    tension: 0.3
                  },
                  point: {
                    radius: 0,
                    hoverRadius: 6,
                    hitRadius: 10
                  }
                },
                interaction: {
                  intersect: false,
                  mode: 'index',
                  axis: 'x'
                },
                layout: {
                  padding: {
                    top: 10,
                    right: 15,
                    bottom: 10,
                    left: 5
                  }
                },
                animation: {
                  duration: 1000,
                  easing: 'easeOutQuart'
                }
              }}
            />
            
            {/* Current Value Indicator - Moved to top left to avoid legend overlap */}
            <div className="absolute top-2 left-4 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-gray-100 shadow-sm">
              <div className="flex items-center text-sm font-medium text-gray-700">
                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                Current: {Array.from({ length: 24 }, () => (Math.random() * 20 + 20).toFixed(1)).pop()}°C
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div >

  );
};

export default Dashboard;
