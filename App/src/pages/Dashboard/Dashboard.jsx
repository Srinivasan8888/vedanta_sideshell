import React, { useState, useEffect, lazy, Suspense, useRef, useCallback, useMemo } from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
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

const SensorCard = React.memo(
  function SensorCard({ sensor }) {
    const navigate = useNavigate();

    const handleNavigate = () => {
      // Extract sensor ID - get just the number from the sensor name (e.g., 'WG2 38' -> '38')
      const sensorNumber = sensor.name.replace(/[^0-9]/g, '');
      const sensorId = sensorNumber ? `sensor${sensorNumber}` : 'sensor1';
      const side = sensor.name.includes('A') ? 'Aside' : 'Bside';

      // Navigate to CollectorBar with sensorId and side as query parameters
      navigate(`/CollectorBar?sensorId=${sensorNumber}&side=${side}`);
    };

    return (
      <div className="bg-[rgba(234,237,249,1)] p-3 rounded-lg shadow-md border border-gray-200 hover:shadow transition-shadow 2xl:w-40 relative group">
        <button
          onClick={handleNavigate}
          className="absolute right-4 top-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-blue-50 rounded"
          aria-label="View sensor details"
        >
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
  },
  (prevProps, nextProps) => {
    // Only re-render if sensor data changes
    return prevProps.sensor.value === nextProps.sensor.value &&
      prevProps.sensor.isPositive === nextProps.sensor.isPositive &&
      prevProps.sensor.difference === nextProps.sensor.difference &&
      prevProps.sensor.name === nextProps.sensor.name;
  }
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
  const [showLegendPopup, setShowLegendPopup] = useState(false);
  const [hiddenSensors, setHiddenSensors] = useState({}); // Track hidden sensors by ID
  const [timeInterval, setTimeInterval] = useState('Live');
  const [selectedSide, setSelectedSide] = useState('ASide');
  const [chartHistoricalData, setChartHistoricalData] = useState({ ASide: [], BSide: [] });
  const [temperatureStats, setTemperatureStats] = useState({
    ASide: { maxTemp: '--', minTemp: '--', avgTemp: '--' },
    BSide: { maxTemp: '--', minTemp: '--', avgTemp: '--' }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousSensorData, setPreviousSensorData] = useState({});
  const intervalRef = useRef();


  const handleTimeIntervalChange = async (interval) => {
    if (interval === timeInterval) return; // Don't do anything if the interval hasn't changed

    setTimeInterval(interval);

    try {
      // Fetch new data with the updated interval
      await fetchSensorData();
    } catch (error) {
      console.error('Error fetching data for interval:', interval, error);
      // Error is already handled in fetchSensorData
    }
  };

  const handleSideChange = (side) => {
    setSelectedSide(side);
    // Force chart update by toggling the state
    setChartUpdateKey(prev => prev + 1);
  };

  // Process historical data for the chart to show all sensor series
  const chartData = useMemo(() => {
    console.log('Processing chart data for side:', selectedSide);
    
    const sideData = chartHistoricalData[selectedSide] || [];
    console.log('Raw side data:', sideData);

    // Get all unique sensor IDs from the first data point
    const sensorIds = sideData[0]?.sensors ? Object.keys(sideData[0].sensors) : [];
    console.log('Sensor IDs:', sensorIds);

    // Extract timestamps
    const timestamps = sideData
      .filter(entry => entry?.timestamp)
      .map(entry => new Date(entry.timestamp));

    // Create a dataset for each sensor
    const datasets = sensorIds.map((sensorId, index) => {
      // Generate a consistent color for each sensor
      const hue = (index * 137.5) % 360; // Golden angle for color distribution
      const color = `hsl(${hue}, 70%, 50%)`;
      
      // Get values for this sensor across all timestamps
      const data = sideData.map(entry => {
        const value = entry?.sensors?.[sensorId];
        return typeof value === 'number' ? parseFloat(value.toFixed(2)) : null;
      });

      return {
        label: sensorId,
        data,
        borderColor: color,
        backgroundColor: `hsla(${hue}, 70%, 50%, 0.1)`,
        borderWidth: 1,
        pointRadius: 1.5,
        tension: 0.2,
        fill: false
      };
    });

    // Format labels for display
    const labels = timestamps.map(date => 
      date.toLocaleString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    );

    console.log('Processed datasets:', datasets);

    return {
      labels,
      datasets,
      // Store raw data for reference
      rawData: sideData
    };
  }, [chartHistoricalData, selectedSide]);
  const [sensors, setSensors] = useState([]);
  const [hourlyAverages, setHourlyAverages] = useState(Array(24).fill().map((_, i) => ({
    index: i + 1,
    time: new Date(0, 0, 0, i).toLocaleTimeString('en-US', { hour: '2-digit', hour12: true }),
    entries: []
  })));
  const [scrollPosition, setScrollPosition] = useState(0);
  const [chartUpdateKey, setChartUpdateKey] = useState(0); // Add this line
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



  const fetchSensorData = useCallback(async () => {
    // This function is now only responsible for the API call and data transformation.
    try {
      const response = await API.get(`/api/v2/getDashboardAPi?interval=${timeInterval}`, {
        timeout: 10000, // 10 second timeout
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });

      console.log('Received response:', response.data);
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response format from server');
      }

      const { realtime, hourlyAverages, historical } = response.data.data;
      console.log('Received realtime data:', realtime);

      if (hourlyAverages && Array.isArray(hourlyAverages)) {
        setHourlyAverages(hourlyAverages);
      }
      console.log('Received historical:', historical);
      if (historical) {
        console.log('Setting chart historical data:', {
          ASide: Array.isArray(historical.ASide) ? historical.ASide : [],
          BSide: Array.isArray(historical.BSide) ? historical.BSide : []
        });
        
        setChartHistoricalData({
          ASide: Array.isArray(historical.ASide) ? historical.ASide : [],
          BSide: Array.isArray(historical.BSide) ? historical.BSide : []
        });
      }

      if (response.data.data.temperatureStats) {
        setTemperatureStats(response.data.data.temperatureStats);
      }

      const formattedSensors = [];
      realtime.forEach(waveguide => {
        if (!waveguide || !waveguide.sensors) return;
        Object.entries(waveguide.sensors).forEach(([sensorKey, sensorData]) => {
          if (!sensorData || sensorData.value === undefined) return;
          const sensorNumber = sensorKey.replace('sensor', '');
          const sidePrefix = waveguide.waveguide === 'WG1' ? 'ASide' : 'BSide';
          const sensorId = `${waveguide.waveguide}+${sensorNumber}`;
          formattedSensors.push({
            id: sensorId,
            name: `${sidePrefix} Sensor ${sensorNumber}`,
            value: parseFloat(sensorData.value).toFixed(2),
            difference: sensorData.difference || '0.00',
            isPositive: sensorData.trend === 'up',
            waveguide: waveguide.waveguide,
            timestamp: waveguide.TIME || new Date().toISOString()
          });
        });
      });

      if (formattedSensors.length === 0) {
        console.warn('No valid sensor data found in response, but the request was successful.');
      }

      setSensors(formattedSensors);

    } catch (error) {
      // Log the error and re-throw it for the polling logic to handle.
      console.error('Error during sensor data fetch:', error.message);
      throw error;
    }
  }, [timeInterval]);

  // This effect handles the data fetching, retries, and polling logic.
  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    console.log('Polling effect initiated.');

    const poll = async () => {
      if (!isMounted) {
        console.log('Polling stopped: Component unmounted or dependency changed.');
        return;
      }

      console.log('Starting new poll cycle.');
      setIsLoading(true);
      let success = false;

      for (let i = 0; i < 4; i++) { // 1 initial attempt + 3 retries
        if (!isMounted) break;
        try {
          console.log(`Fetch attempt #${i + 1}...`);
          await fetchSensorData();
          console.log(`Fetch attempt #${i + 1} was successful.`);
          success = true;
          break;
        } catch (error) {
          console.error(`Fetch attempt #${i + 1} failed.`);
          if (i < 3) {
            const delay = 1000 * Math.pow(2, i);
            console.log(`Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          } else {
            console.error('All fetch attempts failed. Setting error state.');
            if (isMounted) setError(error.message || 'Failed to fetch data after multiple retries.');
          }
        }
      }

      if (isMounted) {
        console.log('Poll cycle finished.');
        if (success) {
          setError(null);
        }
        setIsLoading(false);
        console.log('Scheduling next poll in 5s.');
        timeoutId = setTimeout(poll, 5000);
      }
    };

    poll();

    return () => {
      console.log('Cleaning up polling effect.');
      isMounted = false;
      clearTimeout(timeoutId);
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
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th rowSpan="2" className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">#</th>
                    <th rowSpan="2" className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Time</th>
                    <th colSpan="3" className="text-center text-sm font-medium text-gray-500 uppercase">Temperature Data</th>
                  </tr>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Side</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Temp (°C)</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white/30 divide-y divide-gray-200">
                  {hourlyAverages?.filter(hourData =>
                    hourData?.entries?.length > 0
                  ).map((hourData, index) => {
                    const getStatusClass = (temp) => {
                      if (temp > 35) return 'bg-red-100 text-red-800';
                      if (temp < 25) return 'bg-blue-100 text-blue-800';
                      return 'bg-green-100 text-green-800';
                    };

                    const getStatusText = (temp) => {
                      if (temp > 35) return 'High';
                      if (temp < 25) return 'Low';
                      return 'Normal';
                    };

                    const getSideData = (side) => {
                      const entry = hourData.entries.find(e => e.side === side);
                      if (!entry) return { temp: '--', status: { class: 'bg-gray-100 text-gray-800', text: '--' } };

                      return {
                        temp: typeof entry.temp === 'number' ? entry.temp.toFixed(1) : '--',
                        status: {
                          class: getStatusClass(entry.temp),
                          text: getStatusText(entry.temp)
                        }
                      };
                    };

                    const aSide = getSideData('ASide');
                    const bSide = getSideData('BSide');

                    return (
                      <React.Fragment key={`${hourData.index}-${index}`}>
                        <tr className="hover:bg-gray-50/50">
                          <td rowSpan="2" className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                            {index + 1}
                          </td>
                          <td rowSpan="2" className="px-4 py-2 text-sm text-gray-900 border-r border-gray-200">
                            {hourData.time || '--'}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-700">ASide</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{aSide.temp}°C</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${aSide.status.class}`}>
                              {aSide.status.text}
                            </span>
                          </td>
                        </tr>
                        <tr className="hover:bg-gray-50/50 border-b border-gray-200">
                          <td className="px-4 py-2 text-sm text-gray-700">BSide</td>
                          <td className="px-4 py-2 text-sm text-gray-700">{bSide.temp}°C</td>
                          <td className="px-4 py-2">
                            <span className={`px-2 inline-flex text-xs font-semibold rounded-full ${bSide.status.class}`}>
                              {bSide.status.text}
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
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">{temperatureStats.ASide.maxTemp}</p>
                    <p className="text-xs text-gray-500">ASide</p>
                  </div>
                  <div className="text-center border-l border-gray-200 pl-4">
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">{temperatureStats.BSide.maxTemp}</p>
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
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">{temperatureStats.ASide.minTemp}</p>
                    <p className="text-xs text-gray-500">ASide</p>
                  </div>
                  <div className="text-center border-l border-gray-200 pl-4">
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">{temperatureStats.BSide.minTemp}</p>
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
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">{temperatureStats.ASide.avgTemp}</p>
                    <p className="text-xs text-gray-500">ASide</p>
                  </div>
                  <div className="text-center border-l border-gray-200 pl-4">
                    <p className="lg:text-xs lg:font-regular 2xl:text-xl 2xl:font-bold text-gray-800">{temperatureStats.BSide.avgTemp}</p>
                    <p className="text-xs text-gray-500">BSide</p>
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
                      checked={selectedSide === 'ASide'}
                      onChange={() => handleSideChange('ASide')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">A Side</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="side"
                      value="BSide"
                      checked={selectedSide === 'BSide'}
                      onChange={() => handleSideChange('BSide')}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">B Side</span>
                  </label>
                </div>
              </div>
              <button
                onClick={() => setShowLegendPopup(!showLegendPopup)}
                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors border border-blue-100"
              >
                {showLegendPopup ? 'Hide Legend' : 'Show Legend'}
              </button>
              {showLegendPopup && (
                <div className="absolute top-12 right-3 bg-white p-3 rounded-lg shadow-lg border border-gray-200 z-10 max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {sensors
                      .filter(sensor => sensor.waveguide === (selectedSide === 'ASide' ? 'WG1' : 'WG2'))
                      .map((sensor, index) => {
                        const sensorId = `Sensor${index + 1}`;
                        const isHidden = hiddenSensors[sensorId];
                        return (
                          <div
                            key={index}
                            className={`flex items-center text-xs cursor-pointer p-1 rounded ${isHidden ? 'opacity-40' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setHiddenSensors(prev => ({
                                ...prev,
                                [sensorId]: !prev[sensorId]
                              }));
                            }}
                            title={isHidden ? 'Show sensor' : 'Hide sensor'}
                          >
                            <div
                              className="w-3 h-3 rounded-full mr-2"
                              style={{
                                backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                                opacity: isHidden ? 0.5 : 0.9,
                                transition: 'opacity 0.2s'
                              }}
                            />
                            <span className={isHidden ? 'line-through' : ''}>Sensor{index + 1}</span>
                          </div>
                        );
                      }
                      )}
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 justify-end w-full sm:w-auto">
                {['Live', '1h', '2h', '5h', '7h', '12h'].map((interval) => (
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
              <div className="absolute right-4 top-2 z-10 text-xs text-gray-500">
                {selectedSide} - {chartData.datasets?.length || 0} sensors
              </div>
              <Line
                key={`${chartUpdateKey}-${selectedSide}`}
                data={{
                  labels: chartData.labels,
                  datasets: chartData.datasets || []
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: true,
                      position: 'right',
                      labels: {
                        boxWidth: 10,
                        padding: 10,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: {
                          size: 10
                        }
                      }
                    },
                    tooltip: {
                      backgroundColor: '#fff',
                      titleColor: '#111827',
                      titleFont: { weight: '600', size: 12 },
                      bodyColor: '#4B5563',
                      bodyFont: { size: 11 },
                      borderColor: '#E5E7EB',
                      borderWidth: 1,
                      padding: 10,
                      cornerRadius: 6,
                      displayColors: true,
                      usePointStyle: true,
                      callbacks: {
                        label: (context) => `${context.dataset.label}: ${context.parsed.y}°C`,
                        title: (context) => {
                          const date = new Date(chartData.rawData?.[context[0]?.dataIndex]?.timestamp);
                          return date.toLocaleString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          });
                        }
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: {
                        color: '#6B7280',
                        font: { size: 10 },
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 8,
                        padding: 4
                      }
                    },
                    y: {
                      grid: {
                        color: 'rgba(229, 231, 235, 0.5)',
                        drawBorder: false,
                        drawTicks: false,
                        borderDash: [4, 4]
                      },
                      ticks: {
                        color: '#6B7280',
                        font: { size: 10 },
                        padding: 6,
                        callback: value => `${value}°C`
                      },
                      min: 0,
                      max: 100
                    }
                  },
                  interaction: {
                    intersect: false,
                    mode: 'index',
                    axis: 'x'
                  },
                  elements: {
                    line: {
                      borderWidth: 1.5
                    },
                    point: {
                      radius: 1.5,
                      hoverRadius: 4,
                      hoverBorderWidth: 2
                    }
                  },
                  layout: {
                    padding: { top: 10, right: 5, bottom: 10, left: 5 }
                  },
                  animation: {
                    duration: 1000,
                    easing: 'easeOutQuart'
                  }
                }}
              />
            </div>

          </div>
        </div>
      </div>
    </div >

  );
};

// Helper component for waveguide sections
const WaveguideSection = React.memo(({
  sensors = [],
  className = "",
  title = "",
  scrollLeft,
  scrollRight,
  scrollPosition,
  scrollAmount
}) => {
  const [localScrollPosition, setLocalScrollPosition] = useState(0);
  const scrollContainerRef = useRef(null);

  const handleScroll = useCallback((e) => {
    setLocalScrollPosition(e.target.scrollLeft);
  }, []);

  const handleScrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth',
      });
    }
  }, [scrollAmount]);

  const handleScrollRight = useCallback(() => {
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
          onClick={handleScrollLeft}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 ${localScrollPosition <= 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
          onClick={handleScrollRight}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center shadow-md transition-all duration-200 hover:scale-110 ${scrollContainerRef.current && localScrollPosition >= (scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth - 10) ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
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
  // Deep compare sensors array and other props
  const sensorsEqual = prevProps.sensors === nextProps.sensors || (
    Array.isArray(prevProps.sensors) &&
    Array.isArray(nextProps.sensors) &&
    prevProps.sensors.length === nextProps.sensors.length &&
    prevProps.sensors.every((sensor, i) =>
      sensor.id === nextProps.sensors[i]?.id &&
      sensor.value === nextProps.sensors[i]?.value
    )
  );

  return sensorsEqual &&
    prevProps.className === nextProps.className &&
    prevProps.title === nextProps.title &&
    prevProps.scrollPosition === nextProps.scrollPosition &&
    prevProps.scrollAmount === nextProps.scrollAmount;
});

// Memoize the sensor card to prevent unnecessary re-renders
const MemoizedSensorCard = React.memo(SensorCard);

export default Dashboard;