import React, { useState, useEffect, lazy, Suspense, useRef, useCallback } from 'react';
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
import API from '../../Assets/components/Axios/AxiosInterceptor';

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

const SensorRow = ({ sensors, waveguide, rowType }) => {
  const filteredSensors = sensors
    .filter(sensor => sensor.waveguide === waveguide)
    .filter((_, index) => rowType === 'even' ? index % 2 === 0 : index % 2 !== 0);

  if (filteredSensors.length === 0) return null;

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-flow-col auto-cols-max gap-2 w-max">
        {filteredSensors.map(sensor => (
          <div key={sensor.id} className="w-40">
            <SensorCard sensor={sensor} />
          </div>
        ))}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [timeInterval, setTimeInterval] = useState('Live');

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
  
  // Memoize filtered sensor arrays
  const wg1Sensors = React.useMemo(() => 
    sensors.filter(sensor => sensor.waveguide === 'WG1'), 
    [sensors]
  );
  
  const wg2Sensors = React.useMemo(() => 
    sensors.filter(sensor => sensor.waveguide === 'WG2'), 
    [sensors]
  );
  
  // Throttle scroll position updates
  const handleScroll = React.useCallback((e) => {
    setScrollPosition(e.target.scrollLeft);
  }, []);

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      const newPosition = Math.max(0, scrollPosition - scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newPosition,
      });
    }
  }, [scrollAmount]);

  const scrollRight = React.useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [scrollAmount]);

  const [previousSensorData, setPreviousSensorData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef();

  const fetchSensorData = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Fetching sensor data...');
      const response = await API.get(`api/v2/getallsensor`);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      // Handle different response types
      let apiData;
      if (typeof response.data === 'string') {
        try {
          apiData = JSON.parse(response.data);
        } catch (e) {
          console.error('Failed to parse response data as JSON:', response.data);
          throw new Error('Invalid JSON response from server');
        }
      } else {
        apiData = response.data;
      }

      console.log('API Response data:', apiData); // Log the parsed API response

      // Transform API data to match the expected sensor format
      const formattedSensors = [];
      const newPreviousData = {};

      // Check if apiData is an array or object and handle accordingly
      const dataArray = Array.isArray(apiData) ? apiData : [apiData];

      let hasValidSensors = false;

      dataArray.forEach((waveguide) => {
        if (!waveguide || typeof waveguide !== 'object') return;

        // Extract sensor values from the waveguide data
        Object.entries(waveguide).forEach(([key, value]) => {
          // Check if the key is a sensor field (starts with 'sensor' or any other pattern in your data)
          if ((key.startsWith('sensor') || key.startsWith('temp') || key.startsWith('value'))
            && value !== null && value !== undefined) {

            const sensorNumber = key.replace(/[^0-9]/g, '') || '1'; // Extract numbers or default to '1'
            const sensorId = waveguide.waveguide ?
              `${waveguide.waveguide}+${sensorNumber}` :
              `sensor-${sensorNumber}`;

            const currentValue = parseFloat(value);

            if (isNaN(currentValue)) return; // Skip invalid numbers

            hasValidSensors = true;

            // Store current value for next comparison
            newPreviousData[sensorId] = {
              value: currentValue,
              timestamp: waveguide.TIME || waveguide.timestamp || new Date().toISOString()
            };

            // Calculate difference from previous reading using functional update
            setPreviousSensorData(prevData => {
              const prevValue = prevData[sensorId]?.value || currentValue;
              const difference = currentValue - prevValue;
              const isPositive = difference >= 0;

              const sidePrefix = waveguide.waveguide === 'WG1' ? 'ASide' : 'BSide';
              formattedSensors.push({
                id: sensorId,
                name: `${sidePrefix} Sensor ${sensorNumber}`,
                value: currentValue.toFixed(2),
                difference: Math.abs(difference).toFixed(2),
                isPositive,
                waveguide: waveguide.waveguide || 'WG',
                timestamp: waveguide.TIME || waveguide.timestamp || new Date().toISOString()
              });

              return prevData;
            });
          }
        });
      });

      if (!hasValidSensors) {
        console.error('No valid sensor data found in response. Full response:', apiData);
        throw new Error('No valid sensor data found in the response');
      }

      // Update previous sensor data for next comparison
      setPreviousSensorData(prev => ({
        ...prev,
        ...newPreviousData
      }));

      setSensors(formattedSensors);
      setError(null);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []); // Removed previousSensorData from dependencies

  useEffect(() => {
    // Initial fetch
    fetchSensorData();

    // Set up polling every 5 seconds
    intervalRef.current = setInterval(fetchSensorData, 5000);

    // Clean up interval on component unmount or when fetchSensorData changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchSensorData]);

  // Add a cleanup effect for when component unmounts
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
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
                  onScroll={handleScroll}
                >



                  <div className="flex space-x-2 p-1">
                    {isLoading ? (
                      <div className="flex items-center justify-center w-full p-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                      </div>
                    ) : error ? (
                      <div className="w-full p-4 text-red-500 text-center">
                        Error loading sensor data: {error}
                      </div>
                    ) : sensors.length > 0 ? (
                      <div className="w-full ">
                       
                        <WaveguideSection 
                          sensors={wg1Sensors}
                          className="wg1-section"                         
                          scrollLeft={scrollLeft}
                          scrollRight={scrollRight}
                          scrollPosition={scrollPosition}
                          scrollAmount={scrollAmount}
                        />
                        {/* WG2 Section */}
                        <WaveguideSection 
                          sensors={wg2Sensors}
                          className="wg2-section"
                          scrollLeft={scrollLeft}
                          scrollRight={scrollRight}
                          scrollPosition={scrollPosition}
                          scrollAmount={scrollAmount}
                        />
                      </div>
                    ) : (
                      <div className="w-full p-4 text-gray-500 text-center">
                        No sensor data available
                      </div>
                    )}
                  </div>
                  {/* Mobile */}
                  {/* <div className="flex space-x-2 md:hidden p-1">
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
                  </div> */}

                  {/* ipad mini and ipad air */}
                  {/* <div className="md:flex space-x-2 hidden lg:hidden  p-1">
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

                <div className="hidden 2xl:flex space-x-4 mt-5  p-1">
                    {Array(Math.ceil(sensors.length / 4)).fill().map((_, colIndex) => (
                      <div key={colIndex} className="flex-none w-40 space-y-2">
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
                    <th rowSpan="2" className="lg:px-2 2xl:px-4 py-2 text-left text-xs lg:font-regular 2xl:font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th rowSpan="2" className="lg:px-2 2xl:px-4 py-2 text-left text-xs lg:font-regular 2xl:font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th colSpan="3" className="text-center text-xs lg:font-regular 2xl:font-medium text-gray-500 uppercase tracking-wider">Temperature Data</th>
                  </tr>
                  <tr>
                    <th className="lg:px-2 2xl:px-4 py-2 text-left text-xs lg:font-regular 2xl:font-medium text-gray-500 uppercase tracking-wider">Side</th>
                    <th className="lg:px-2 2xl:px-4 py-2 text-left text-xs lg:font-regular 2xl:font-medium text-gray-500 uppercase tracking-wider">Temp (°C)</th>
                    <th className="lg:px-2 2xl:px-4 py-2 text-left text-xs lg:font-regular 2xl:font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200">
                  {Array.from({ length: 24 }).map((_, index) => {
                    const time = new Date();
                    time.setHours(index, 0, 0, 0);
                    const timeString = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                    
                    // Static temperature values
                    const aSideTemp = '--';
                    const bSideTemp = '--';

                    // Status for placeholder
                    const placeholderStatus = { class: 'bg-gray-100 text-gray-800', text: '--' };

                    return (
                      <React.Fragment key={index}>
                        {/* A Side Row */}
                        <tr className="hover:bg-gray-50/50 transition-colors">
                          {index === 0 || index % 1 === 0 ? (
                            <>
                              <td rowSpan="2" className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                                {index + 1}
                              </td>
                              <td rowSpan="2" className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap text-sm text-gray-900 border-r border-gray-200">
                                {timeString}
                              </td>
                            </>
                          ) : null}
                          <td className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap text-sm text-gray-400">ASide</td>
                          <td className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap text-sm text-gray-400">{aSideTemp}°C</td>
                          <td className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${placeholderStatus.class}`}>
                              {placeholderStatus.text}
                            </span>
                          </td>
                        </tr>
                        
                        {/* B Side Row */}
                        <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-200">
                          <td className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap text-sm text-gray-400">BSide</td>
                          <td className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap text-sm text-gray-400">{bSideTemp}°C</td>
                          <td className="lg:px-2 2xl:px-4 py-2 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${placeholderStatus.class}`}>
                              {placeholderStatus.text}
                            </span>
                          </td>
                        </tr>
                      </React.Fragment>
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
              {/* Max Temperature Card */}
              <div className="bg-gradient-to-br from-red-50 to-white p-3 rounded-lg border border-red-100 h-full flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-red-600">Max Temp</span>
                  <div className="p-1.5 bg-red-100 rounded-lg hidden 2xl:flex">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">38.2°C</p>
                    <p className="text-xs text-gray-500">ASide</p>
                  </div>
                  <div className="text-center border-l border-gray-200 pl-4">
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">39.2°C</p>
                    <p className="text-xs text-gray-500">BSide</p>
                  </div>
                </div>
              </div>

              {/* Min Temperature Card */}
              <div className="bg-gradient-to-br from-blue-50 to-white p-3 rounded-lg border border-blue-100 h-full flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-blue-600">Min Temp</span>
                  <div className="p-1.5 bg-blue-100 rounded-lg hidden 2xl:flex">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">22.5°C</p>
                    <p className="text-xs text-gray-500">ASide</p>
                  </div>
                  <div className="text-center border-l border-gray-200 pl-4">
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">21.3°C</p>
                    <p className="text-xs text-gray-500">BSide</p>
                  </div>
                </div>
              </div>

              {/* Average Temperature Card */}
              <div className="bg-gradient-to-br from-gray-50 to-white p-3 rounded-lg border border-gray-100 h-full flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-600">Avg Temp</span>
                  <div className="p-1.5 bg-gray-100 rounded-lg hidden 2xl:flex">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">29.8°C</p>
                    <p className="text-xs text-gray-500">ASide (24h avg)</p>
                  </div>
                  <div className="text-center border-l border-gray-200 pl-4">
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">30.2°C</p>
                    <p className="text-xs text-gray-500">BSide (24h avg)</p>
                  </div>
                </div>
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
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">Temperature Trend</h3>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="side"
                      value="ASide"
                      checked={true}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">A Side</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="side"
                      value="BSide"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">B Side</span>
                  </label>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
                {['Live', '1H', '2H', '5H', '7H', '12H'].map((interval) => (
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
                    data: Array(24).fill(0),
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
                        label: function (context) {
                          return `  ${context.parsed.y}°C`;
                        },
                        title: function (context) {
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
                        callback: function (value) {
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
                <div className="flex items-center text-sm font-medium text-gray-400">
                  <span className="w-2 h-2 rounded-full bg-gray-400 mr-2"></span>
                  Current: --°C
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div >

  );
};

// Helper component for waveguide sections
const WaveguideSection = React.memo(({ sensors, className = "", title }) => {
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);
  const scrollAmount = 200;

  const handleScroll = useCallback((e) => {
    setScrollPosition(e.target.scrollLeft);
  }, []);

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [scrollAmount]);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [scrollAmount]);

  if (!sensors || sensors.length === 0) return null;

  return (
    <section className={` relative ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-[#1e2c74]">{title}</h3>
      <div className="relative">
        <button
          onClick={scrollLeft}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 ${scrollPosition <= 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          aria-label={`Scroll ${title} left`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto scrollbar-custom"
          onScroll={handleScroll}
          style={{ scrollBehavior: 'smooth' }}
        >
          <div className="grid auto-rows-auto grid-flow-col auto-cols-max gap-2 w-max">
            {sensors.map((sensor, i) => (
              <div 
                key={sensor.id} 
                className="w-40"
                style={{ gridRow: i % 2 === 0 ? 1 : 2 }}
              >
                <SensorCard sensor={sensor} />
              </div>
            ))}
          </div>
        </div>
        
        <button
          onClick={scrollRight}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 ${scrollContainerRef.current && scrollPosition >= (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 10) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
          aria-label={`Scroll ${title} right`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </section>
  );
}, (prevProps, nextProps) => {
  // Only re-render if sensors array reference changes
  return prevProps.sensors === nextProps.sensors && 
         prevProps.className === nextProps.className;
});

// Memoize the sensor card to prevent unnecessary re-renders
const MemoizedSensorCard = React.memo(SensorCard);

export default Dashboard;
