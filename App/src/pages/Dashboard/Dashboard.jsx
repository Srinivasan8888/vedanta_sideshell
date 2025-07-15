import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import SensorComparisonCard from "../../components/SensorComparisonCard";
import { useNavigate } from "react-router-dom";
import "../../Assets/Navbar/Sidebar.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import API from "../../Assets/components/Axios/AxiosInterceptor";
import potShell from "../../Assets/images/pot_top1.png";
import '../../Assets/components/miscellaneous/Scrollbar.css'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

// Lazy load the ModelViewer component with error boundary
const ModelViewer = lazy(() =>
  import("../../Assets/components/Dashboard/ModelViewer").catch(() => ({
    default: () => <div>Error loading 3D viewer</div>,
  })),
);

// Simple loading component
const Loader = () => (
  <div className="flex justify-center items-center w-full h-full">
    <div className="w-12 h-12 rounded-full border-t-2 border-b-2 border-blue-500 animate-spin"></div>
  </div>
);

const SensorCard = React.memo(function SensorCard({ sensor }) {
  const navigate = useNavigate();

  const handleNavigate = () => {
    // Extract sensor ID - get just the number from the sensor name (e.g., 'WG2 38' -> '38')
    const sensorNumber = sensor.name.replace(/[^0-9]/g, "");
    const sensorId = sensorNumber ? `sensor${sensorNumber}` : "sensor1";
    const side = sensor.name.includes("A") ? "Aside" : "Bside";

    // Navigate to CollectorBar with sensorId and side as query parameters
    navigate(`/CollectorBar?sensorId=${sensorNumber}&side=${side}`);
  };

  return (
    <div className="group relative rounded-lg border border-gray-200 bg-[rgba(234,237,249,1)] shadow-md transition-shadow hover:shadow h-full p-1">
      <button
        onClick={handleNavigate}
        className="absolute top-1 right-4 p-1 rounded opacity-0 transition-opacity duration-200 hover:bg-blue-50 group-hover:opacity-100"
        aria-label="View sensor details"
      >
        <svg
          width="10"
          height="16"
          viewBox="0 0 10 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M2.005 0L10.005 8L2.005 16L0 14L6.005 8L0 2L2.005 0Z"
            fill="#3047C0"
          />
        </svg>
      </button>

      <div
        className={`absolute bottom-1 right-1 flex items-center rounded-full bg-white p-1 text-[8px] 2xl:text-base leading-tight ${sensor.isPositive ? "text-green-500" : "text-red-500"}`}
      >
        {sensor.isPositive ? (
          <FaArrowUp className="mb-1 mr-0.5 mt-0.5 text-[8px] 2xl:text-base" />
        ) : (
          <FaArrowDown className="mb-1 mr-0.5 mt-0.5 text-[8px] 2xl:text-base" />
        )}
        <span className="">{sensor.difference}</span>
      </div>

      <div className="flex flex-col gap-0 2xl:gap-4">
        <h3 className="flex truncate text-[8px] leading-tight 2xl:text-lg 2xl:font-semibold text-[#1e2c74]">
          {sensor.name.includes("A")
            ? `ES${sensor.name.replace(/[^0-9]/g, "")}`
            : `WS${Number(sensor.name.replace(/[^0-9]/g, "")) + 12}`}
        </h3>

        <div className="flex xl:bottom-1 xl:absolute  items-baseline">
          <span className="text-[10px] 2xl:text-base 2xl:font-bold text-[#3047c0]">
            {sensor.value}
            <span className="text-[10px] 2xl:text-base 2xl:font-bold text-[#3047c0]">°C</span>
          </span>
        </div>
      </div>
    </div>
  );
});

const Dashboard = () => {
  const [showLegendPopup, setShowLegendPopup] = useState(false);
  const [hiddenSensors, setHiddenSensors] = useState({}); // Track hidden sensors by ID
  const [timeInterval, setTimeInterval] = useState("Live");
  const [selectedSide, setSelectedSide] = useState("ASide");
  const [chartHistoricalData, setChartHistoricalData] = useState({
    ASide: [],
    BSide: [],
  });
  const [accumulatedData, setAccumulatedData] = useState({
    ASide: [],
    BSide: [],
  });
  const [temperatureStats, setTemperatureStats] = useState({
    ASide: { maxTemp: "--", minTemp: "--", avgTemp: "--" },
    BSide: { maxTemp: "--", minTemp: "--", avgTemp: "--" },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previousSensorData, setPreviousSensorData] = useState({});
  const intervalRef = useRef();
  const [thresholds, setThresholds] = useState({ min: "", max: "" });
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const [liveStatus, setLiveStatus] = useState({
    isLive: false,
    timestamp: "",
  });

  const handleTimeIntervalChange = async (interval) => {
    if (interval === timeInterval) return;

    // Clear chart data before fetching new data
    setAccumulatedData({ ASide: [], BSide: [] });
    setChartHistoricalData({ ASide: [], BSide: [] });

    setTimeInterval(interval);

    // Force chart remount by updating the key
    setChartUpdateKey((prev) => prev + 1);

    try {
      await fetchSensorData();
    } catch (error) {
      console.error("Error fetching data for interval:", interval, error);
    }
  };

  const handleSideChange = (side) => {
    setSelectedSide(side);
    // Force chart update by toggling the state
    setChartUpdateKey((prev) => prev + 1);
  };

  // Process historical data for the chart to show all sensor series
  const chartData = useMemo(() => {
    console.log("Processing chart data for side:", selectedSide);

    const sideData = chartHistoricalData[selectedSide] || [];
    console.log("Raw side data:", sideData);

    // Get all unique sensor IDs from the first data point
    const sensorIds = sideData[0]?.sensors
      ? Object.keys(sideData[0].sensors)
      : [];
    console.log("Sensor IDs:", sensorIds);

    // Extract timestamps
    const timestamps = sideData
      .filter((entry) => entry?.timestamp)
      .map((entry) => new Date(entry.timestamp));

    // Create a dataset for each sensor
    const datasets = sensorIds.map((sensorId, index) => {
      // Generate a consistent color for each sensor
      const hue = (index * 137.5) % 360; // Golden angle for color distribution
      const color = `hsl(${hue}, 70%, 50%)`;

      // Get values for this sensor across all timestamps
      const data = sideData.map((entry) => {
        const value = entry?.sensors?.[sensorId];
        return typeof value === "number" ? parseFloat(value.toFixed(2)) : null;
      });

      return {
        label: sensorId,
        data,
        borderColor: color,
        backgroundColor: `hsla(${hue}, 70%, 50%, 0.1)`,
        borderWidth: 1,
        pointRadius: 1.5,
        tension: 0.2,
        fill: false,
      };
    });

    // Format labels for display
    const labels = timestamps.map((date) =>
      date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }),
    );

    console.log("Processed datasets:", datasets);

    return {
      labels,
      datasets,
      // Store raw data for reference
      rawData: sideData,
    };
  }, [chartHistoricalData, selectedSide]);

  const maxDataValue = useMemo(() => {
    if (!chartData.datasets || chartData.datasets.length === 0) {
      return 100; // Default max if no data
    }

    const allData = chartData.datasets.flatMap((dataset) =>
      dataset.data.filter((v) => v !== null && isFinite(v)),
    );

    if (allData.length === 0) {
      return 100; // Default max if all data is null/invalid
    }

    const maxVal = Math.max(...allData);

    return maxVal;
  }, [chartData.datasets]);
  const [sensors, setSensors] = useState([]);
  const [hourlyAverages, setHourlyAverages] = useState(
    Array(24)
      .fill()
      .map((_, i) => ({
        index: i + 1,
        time: new Date(0, 0, 0, i).toLocaleTimeString("en-US", {
          hour: "2-digit",
          hour12: true,
        }),
        entries: [],
      })),
  );
  const [scrollPosition, setScrollPosition] = useState(0);
  const [chartUpdateKey, setChartUpdateKey] = useState(0); // Add this line
  const scrollContainerRef = React.useRef(null);
  const scrollAmount = 200; // Adjust this value to control scroll distance

  // Memoize filtered sensor arrays
  const wg1Sensors = React.useMemo(
    () => sensors.filter((sensor) => sensor.waveguide === "WG1"),
    [sensors],
  );

  const wg2Sensors = React.useMemo(
    () => sensors.filter((sensor) => sensor.waveguide === "WG2"),
    [sensors],
  );

  // Throttle scroll position updates
  const handleScroll = React.useCallback((e) => {
    setScrollPosition(e.target.scrollLeft);
  }, []);

  const scrollLeft = useCallback(() => {
    if (scrollContainerRef.current) {
      const current = scrollContainerRef.current.scrollLeft;
      const newPosition = Math.max(0, current - scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });
    }
  }, [scrollAmount]);

  const scrollRight = useCallback(() => {
    if (scrollContainerRef.current) {
      const current = scrollContainerRef.current.scrollLeft;
      scrollContainerRef.current.scrollTo({
        left: current + scrollAmount,
        behavior: "smooth",
      });
    }
  }, [scrollAmount]);

  useEffect(() => {
    const fetchThresholds = async () => {
      try {
        const response = await API.get('/api/v2/getThresholds');
        if (response.data) {
          setThresholds(response.data);
        }
      } catch (error) {
        console.error('Error fetching thresholds:', error);
      }
    };

    fetchThresholds();
  }, []);

  const handleThresholdChange = (e) => {
    const { name, value } = e.target;
    setThresholds((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const checkStatus = () => {
      if (lastUpdatedAt) {
        const updatedAt = new Date(lastUpdatedAt.replace(" ", "T")); // Ensure ISO format for compatibility
        const now = new Date();
        const diffInMinutes =
          (now.getTime() - updatedAt.getTime()) / (1000 * 60);

        setLiveStatus({
          isLive: diffInMinutes <= 5,
          timestamp: updatedAt.toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }),
        });
      }
    };

    checkStatus();
    const intervalId = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, [lastUpdatedAt]);

  const handleSaveThresholds = async () => {
    try {
      // Get the first sensor ID from the sensors array as a default
      // Extract just the number from the sensor ID (e.g., 'WG1 38' -> '38')
      const defaultSensorNumber = sensors.length > 0 ? sensors[0].name.replace(/[^0-9]/g, '') : '1';
      const sensorId = `sensor${defaultSensorNumber}`;

      // Get the user ID from local storage or use a default
      const userId = localStorage.getItem('userId') || 'default-user';

      // Prepare the request payload with all required parameters
      const payload = {
        minThreshold: Number(thresholds.min),
        maxThreshold: Number(thresholds.max),
      };

      // Make the API request with headers
      await API.post("/api/v2/setThresholds", payload, {
        headers: {
          "X-User-ID": userId,
        },
      });

      alert("Thresholds updated successfully!");
    } catch (error) {
      console.error("Error updating thresholds:", error);
      const errorMessage =
        error.response?.data?.error || "Failed to update thresholds";
      alert(`Error: ${errorMessage}. Please check the console for details.`);
    }
  };

  const fetchSensorData = useCallback(async () => {
    // This function is now only responsible for the API call and data transformation.
    try {
      const response = await API.get(
        `/api/v2/getDashboardAPi?interval=${timeInterval}`,
        {
          timeout: 10000, // 10 second timeout
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        },
      );

      console.log("Received response:", response.data);

      if (!response.data || !response.data.data) {
        throw new Error("Invalid response format from server");
      }

      const { realtime, hourlyAverages, historical } = response.data.data;

      if (realtime && realtime.length > 0 && realtime[0].TIME) {
        setLastUpdatedAt(realtime[0].TIME);
      }

      console.log("Received realtime data:", realtime); // my changes to check

      if (hourlyAverages && Array.isArray(hourlyAverages)) {
        setHourlyAverages(hourlyAverages);
      }
      console.log("Received historical:", historical);
      if (historical) {
        const newData = {
          ASide: Array.isArray(historical.ASide) ? historical.ASide : [],
          BSide: Array.isArray(historical.BSide) ? historical.BSide : [],
        };

        if (timeInterval === "Live") {
          // Use functional form to avoid stale state
          setAccumulatedData((prev) => {
            const existingATimestamps = new Set(
              prev.ASide.map((e) => e.timestamp || e.TIME),
            );
            const existingBTimestamps = new Set(
              prev.BSide.map((e) => e.timestamp || e.TIME),
            );

            const transformEntry = (entry) => {
              const sensors = {};
              Object.keys(entry).forEach((key) => {
                if (key.startsWith("sensor")) {
                  sensors[key] = Number(entry[key]);
                }
              });
              return {
                timestamp: entry.timestamp || entry.TIME,
                sensors,
              };
            };

            const uniqueASide = newData.ASide.filter(
              (e) => !existingATimestamps.has(e.timestamp || e.TIME),
            ).map(transformEntry);
            const uniqueBSide = newData.BSide.filter(
              (e) => !existingBTimestamps.has(e.timestamp || e.TIME),
            ).map(transformEntry);

            const updatedData = {
              ASide: [...prev.ASide, ...uniqueASide],
              BSide: [...prev.BSide, ...uniqueBSide],
            };
            setChartHistoricalData(updatedData);
            return updatedData;
          });
        } else {
          // For other intervals, replace the data
          setChartHistoricalData(newData);
        }
      }

      if (response.data.data.temperatureStats) {
        setTemperatureStats(response.data.data.temperatureStats);
      }

      const formattedSensors = [];
      realtime.forEach((waveguide) => {
        if (!waveguide || !waveguide.sensors) return;

        Object.entries(waveguide.sensors).forEach(([sensorKey, sensorData]) => {
          // Skip if sensorData is invalid or value is 'N/A'
          if (
            !sensorData ||
            sensorData.value === undefined ||
            sensorData.value === "N/A"
          ) {
            console.log(`Skipping ${sensorKey} - Invalid or N/A value`);
            return;
          }

          // Convert value to number and check if it's valid
          const numericValue = parseFloat(sensorData.value);
          if (isNaN(numericValue)) {
            console.log(
              `Skipping ${sensorKey} - Not a number:`,
              sensorData.value,
            );
            return;
          }

          const sensorNumber = sensorKey.replace("sensor", "");
          const sidePrefix = waveguide.waveguide === "WG1" ? "ASide" : "BSide";
          const sensorId = `${waveguide.waveguide}+${sensorNumber}`;

          formattedSensors.push({
            id: sensorId,
            name: `${sidePrefix} Sensor ${sensorNumber}`,
            value: numericValue.toFixed(2),
            difference: sensorData.difference || "0.00",
            isPositive: sensorData.trend === "up",
            waveguide: waveguide.waveguide,
            timestamp: waveguide.TIME || new Date().toISOString(),
            isValid: true,
          });
        });
      });

      if (formattedSensors.length === 0) {
        console.warn(
          "No valid sensor data found in response, but the request was successful.",
        );
      }

      setSensors(formattedSensors);
    } catch (error) {
      // Log the error and re-throw it for the polling logic to handle.
      console.error("Error during sensor data fetch:", error.message);
      throw error;
    }
  }, [timeInterval]);

  // This effect handles the data fetching, retries, and polling logic.
  useEffect(() => {
    let isMounted = true;
    let timeoutId;
    console.log("Polling effect initiated.");

    const poll = async () => {
      if (!isMounted) {
        console.log(
          "Polling stopped: Component unmounted or dependency changed.",
        );
        return;
      }

      console.log("Starting new poll cycle.");
      setIsLoading(true);
      let success = false;

      for (let i = 0; i < 4; i++) {
        // 1 initial attempt + 3 retries
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
            await new Promise((resolve) => setTimeout(resolve, delay));
          } else {
            console.error("All fetch attempts failed. Setting error state.");
            if (isMounted)
              setError(
                error.message || "Failed to fetch data after multiple retries.",
              );
          }
        }
      }

      if (isMounted) {
        console.log("Poll cycle finished.");
        if (success) {
          setError(null);
        }
        setIsLoading(false);
        console.log("Scheduling next poll in 5s.");
        timeoutId = setTimeout(poll, 5000);
      }
    };

    poll();

    return () => {
      console.log("Cleaning up polling effect.");
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

  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [hoveredIndex2, setHoveredIndex2] = useState(null);
  const leftValues = [9.5, 16, 23, 30, 37, 44, 51, 58, 64.5, 71, 78, 85];
  const leftValues2 = [10, 16.5, 23.5, 30.5, 37.5, 44.5, 51.5, 58.5, 65, 71.5, 78.5, 85.5];

  return (
    <div className="w-full h-full">
      <div className="flex flex-col gap-4 p-1 w-full h-full text-2xl font-bold text-black xl:grid xl:grid-cols-2 xl:grid-rows-2">
        <div className="overflow-hidden order-2 rounded-lg xl:order-1">
          <div className="grid gap-2 h-full grid-col">
            <div className="overflow-hidden p-2 2xl:p-4 w-full h-full rounded-2xl border-2 border-gray-100 shadow-md backdrop-blur-sm bg-white/30">
              {/* <div className="relative"> */}
              {/* <button
                    onClick={scrollLeft}
                    className="flex absolute left-0 top-1/2 z-10 justify-center items-center w-10 h-10 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out transform -translate-y-1/2 bg-white/50 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ marginLeft: '8px' }}
                    aria-label="Scroll Left"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                  </button> */}

              <div
                ref={scrollContainerRef}
                // className="overflow-x-auto relative flex-1 scrollbar-custom xl:overflow-y-hidden flex flex-col gap-4"
                className="flex flex-col gap-2 2xl:gap-4 h-full"
                style={{ scrollBehavior: "smooth" }}
                onScroll={handleScroll}
              >
                {/* <div className="inline-flex w-full min-w-max xl:space-x-1 2xl:space-x-2 2xl:px-1">
                    {Array(Math.ceil(wg1Sensors.length / 2))
                      .fill()
                      .map((_, rowIndex) => (
                        <div key={`wg1-${rowIndex}`} className="flex flex-col">
                          {wg1Sensors
                            .slice(rowIndex * 2, rowIndex * 2 + 2)
                            .map((sensor) => (
                              <div key={sensor.id} className="2xl:h-24 2xl:w-36">
                                <SensorCard sensor={sensor} />
                              </div>
                            ))}
                        </div>
                      ))}
                  </div> */}

                <div className="grid grid-cols-6 gap-1 2xl:gap-2 h-1/2 ">
                  {wg1Sensors.map((sensor) => (
                    <div key={sensor.id}
                    // className="2xl:h-24 2xl:w-36"
                    >
                      <SensorCard sensor={sensor} />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-6 gap-1 2xl:gap-2 h-1/2 ">
                  {wg2Sensors.map((sensor) => (
                    <div key={sensor.id}
                    // className="2xl:h-24 2xl:w-36"
                    >
                      <SensorCard sensor={sensor} />
                    </div>
                  ))}
                </div>

                {/* <div className="inline-flex px-1 space-x-2 w-full min-w-max">
                    {Array(Math.ceil(wg2Sensors.length / 2))
                      .fill()
                      .map((_, rowIndex) => (
                        <div key={`wg2-${rowIndex}`} className="flex flex-col">
                          {wg2Sensors
                            .slice(rowIndex * 2, rowIndex * 2 + 2)
                            .map((sensor) => (
                              <div key={sensor.id} className="2xl:h-24 2xl:w-36">
                                <SensorCard sensor={sensor} />
                              </div>
                            ))}
                        </div>
                      ))}
                  </div> */}
              </div>

              {/* <button
                    onClick={scrollRight}
                    className="flex absolute right-0 top-1/2 z-10 justify-center items-center w-10 h-10 rounded-full shadow-md backdrop-blur-sm transition-all duration-300 ease-in-out transform -translate-y-1/2 bg-white/50 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ marginRight: '8px' }}
                    aria-label="Scroll Right"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                  </button> */}
              {/* </div> */}
            </div>
          </div>
        </div>
        {/* <div className="flex overflow-hidden order-1 justify-center items-center rounded-2xl border-2 border-gray-100 shadow-md backdrop-blur-sm xl:order-2 bg-white/30"> */}
        {/* <div className="flex order-1 justify-center items-center rounded-2xl xl:order-2 overflow-hidde">

            <Suspense fallback={<div className="flex justify-center items-center w-full h-full">Loading 3D model...</div>}>
              <ModelViewer modelPath="/side_shell.glb" />
            </Suspense>
          </div> */}
        <div className="flex overflow-hidden flex-col order-3 gap-4 items-stretch rounded-2xl border border-gray-100 shadow-md backdrop-blur-sm bg-white/30 2xl:p-4 xl:order-3 xl:flex-row">

          <div className="overflow-hidden w-full bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto overflow-y-auto h-96 scrollbar-custom md:h-full">
              <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th
                      rowSpan="2"
                      className="2xl:px-4 2xl:py-3 text-[10px] 2xl:text-xs 2xl:font-medium uppercase tracking-wider text-gray-600"
                    >
                      #
                    </th>
                    <th
                      rowSpan="2"
                      className="2xl:px-4 2xl:py-3 text-[10px] 2xl:text-xs 2xl:font-medium uppercase tracking-wider text-gray-600"
                    >
                      Time
                    </th>
                    <th
                      colSpan="3"
                      className="2xl:px-4 2xl:py-3 text-[10px] 2xl:text-xs 2xl:font-medium uppercase tracking-wider text-gray-600"
                    >
                      Temperature Data
                    </th>
                  </tr>
                  <tr className="text-left">
                    <th className="2xl:px-4 2xl:py-3 text-[10px] 2xl:text-xs 2xl:font-medium uppercase tracking-wider text-gray-600">
                      Side
                    </th>
                    <th className="2xl:px-4 2xl:py-3 text-[10px] 2xl:text-xs 2xl:font-medium uppercase tracking-wider text-gray-600">
                      Temp (°C)
                    </th>
                    <th className="2xl:px-4 2xl:py-3 text-[10px]  2xl:text-xs 2xl:font-medium uppercase tracking-wider text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hourlyAverages
                    ?.filter((hourData) => hourData?.entries?.length > 0)
                    .map((hourData, index) => {
                      const getStatusClass = (temp) => {
                        if (temp > 400) return "bg-red-400/20 text-red-700";
                        if (temp < 25) return "bg-blue-400/20 text-blue-700";
                        return "bg-green-400/20 text-green-700";
                      };

                      const getStatusText = (temp) => {
                        if (temp > 400) return "High";
                        if (temp < 25) return "Low";
                        return "Normal";
                      };

                      const getSideData = (side) => {
                        const entry = hourData.entries.find(
                          (e) => e.side === side,
                        );
                        if (!entry)
                          return {
                            temp: "--",
                            status: {
                              class: "bg-gray-100/30 text-gray-600 ",
                              text: "--",
                            },
                          };

                        return {
                          temp:
                            typeof entry.temp === "number"
                              ? entry.temp.toFixed(1)
                              : "--",
                          status: {
                            class: getStatusClass(entry.temp),
                            text: getStatusText(entry.temp),
                          },
                        };
                      };

                      const aSide = getSideData("ASide");
                      const bSide = getSideData("BSide");

                      return (
                        <React.Fragment key={`${hourData.index}-${index}`}>
                          <tr className="transition-colors duration-150 group hover:bg-white/20">
                            <td
                              rowSpan="2"
                              className=" text-[10px] 2xl:px-4 2xl:py-3 2xl:text-sm 2xl:font-medium text-gray-800 border-r border-gray-100"
                            >
                              <span className="inline-flex justify-center items-center w-6 h-6 text-gray-700 rounded-full bg-white/20">
                                {index + 1}
                              </span>
                            </td>
                            <td
                              rowSpan="2"
                              className=" text-[10px] 2xl:px-4 2xl:py-3 2xl:text-sm 2xl:font-medium text-gray-800 border-r border-gray-100"
                            >
                              <div className="flex flex-col">
                                <span className="text-gray-900 font-regular 2xl:font-semibold">
                                  {hourData.time?.split(" ")[0] || "--"}
                                </span>
                                <span className=" text-[10px] 2xl:text-xs text-gray-500">
                                  {hourData.time?.split(" ")[1] || ""}
                                </span>
                              </div>
                            </td>
                            <td className="2xl:px-4 2xl:py-2 text-[10px] 2xl:text-sm 2xl:font-medium text-gray-700">
                              <span className="inline-flex items-center">
                                <span className="mr-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                                East Side
                              </span>
                            </td>
                            <td className="2xl:px-4 2xl:py-2 text-[10px] 2xl:text-sm 2xl:font-medium text-gray-700">
                              {aSide.temp}°C
                            </td>
                            <td className="2xl:px-4 2xl:py-2">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs 2xl:text-sm font-medium ${aSide.status.class} backdrop-blur-sm`}
                              >
                                {aSide.status.text}
                              </span>
                            </td>
                          </tr>
                          <tr className="border-b border-gray-100 transition-colors duration-150 group hover:bg-gray-50">
                            <td className="2xl:px-4 2xl:py-2 text-[10px] 2xl:text-sm 2xl:font-medium text-gray-700">
                              <span className="inline-flex items-center whitespace-nowrap">
                                <span className="mr-2 w-2 h-2 bg-amber-500 rounded-full"></span>
                                West Side
                              </span>
                            </td>
                            <td className="2xl:px-4 2xl:py-2 text-[10px] 2xl:text-sm 2xl:font-medium text-gray-700">
                              {bSide.temp}°C
                            </td>
                            <td className="2xl:px-4 2xl:py-2">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs 2xl:text-sm font-medium ${aSide.status.class} backdrop-blur-sm`}
                              >
                                {aSide.status.text}
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

          <div className="flex flex-col w-full h-full bg-white rounded-xl border border-gray-100 shadow-sm">


            <div className="flex flex-col justify-between 2xl:gap-2 sm:flex-row sm:items-center h-[15%] 2xl:h-[20%] border-b border-gray-100">
              <div className="flex items-center 2xl:space-x-3">
                <h5 className="text-[10px] leading-tight font-normal 2xl:text-base 2xl:font-semibold text-gray-800">
                  Temperature Statistics
                </h5>
              </div>
              <div className="flex items-center">
                {liveStatus.timestamp && (
                  <div className="hidden items-center text-[10px] leading-tight font-normal 2xl:text-sm text-gray-500 sm:flex">
                    <span>Last updated: <span className="font-normal text-gray-700 2xl:font-medium"> {liveStatus.timestamp || "N/A"}</span></span>
                  </div>
                )}

                <div className={`flex items-center space-x-1.5 rounded-full px-3 py-1.5 text-xs font-normal 2xl:text-sm 2xl:font-medium transition-colors duration-200 ${liveStatus.isLive ? "bg-green-50 text-green-700 border border-green-100" : "bg-gray-50 text-gray-600 border border-gray-100"}`}>
                  <span className={`h-2.5 w-2.5 rounded-full ${liveStatus.isLive ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-pulse'}`}></span>
                  <span className="font-normal 2xl:font-medium">{liveStatus.isLive ? "Live" : "Inactive"}</span>
                  {liveStatus.isLive && (
                    <span className="ml-1.5 flex h-1 w-1 2xl:h-2 2xl:w-2">
                      <span className="inline-flex absolute w-1 h-1 bg-green-400 rounded-full opacity-75 animate-ping 2xl:h-2 2xl:w-2"></span>
                      <span className="inline-flex relative w-1 h-1 bg-green-500 rounded-full 2xl:h-2 2xl:w-2"></span>
                    </span>
                  )}
                </div>
              </div>
            </div>



            {/* <div className="flex-1"> */}
            <div className="grid grid-cols-2 gap-3 p-3 md:grid-cols-4 xl:grid-cols-2 h-[70%] 2xl:h-[60%] whitespace-nowrap border">
              {/* Max Temperature Card */}
              <div className="flex flex-col p-1 bg-gradient-to-br from-red-50 to-white rounded-lg border border-red-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] 2xl:text-sm leading-tight font-normal text-red-600">Max Temp</span>
                  <div className="hidden rounded-lg bg-red-100 p-1 2xl:flex">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                </div>

                <div className="grid grid-cols-2 2xl:gap-2">
                  <div className="text-center">
                    <p className="text-xs font-normal text-gray-800 2xl:text-xl 2xl:font-bold">{temperatureStats?.ASide?.maxTemp ?? "--"}</p>
                    <p className="font-normal text-[10px] 2xl:text-sm 2xl:font-medium text-gray-500">East Side</p>
                  </div>
                  <div className="text-center border-l border-gray-200 2xl:pl-4">
                    <p className="text-xs font-normal text-gray-800 2xl:text-xl 2xl:font-bold">{temperatureStats?.BSide?.maxTemp ?? "--"}</p>
                    <p className="font-normal text-[10px] 2xl:text-sm 2xl:font-medium text-gray-500">West Side</p>
                  </div>
                </div>
              </div>

              {/* Min Temperature Card */}
              <div className="flex flex-col p-1 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-normal text-blue-600 2xl:text-sm 2xl:font-medium">Min Temp</span>
                  <div className="hidden rounded-lg bg-blue-100 p-1 2xl:flex">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 mt-auto 2xl:gap-4">
                  <div className="text-center">
                    <p className="text-xs font-normal text-gray-800 2xl:text-xl 2xl:font-bold">{temperatureStats?.ASide?.minTemp ?? "--"}</p>
                    <p className="font-normal text-[10px] 2xl:text-sm 2xl:font-medium text-gray-500">East Side</p>
                  </div>
                  <div className="text-center border-l border-gray-200 2xl:pl-4">
                    <p className="text-xs font-normal text-gray-800 2xl:text-xl 2xl:font-bold">{temperatureStats?.BSide?.minTemp ?? "--"}</p>
                    <p className="font-normal text-[10px] 2xl:text-sm 2xl:font-medium text-gray-500">West Side</p>
                  </div>
                </div>
              </div>
              {/* Average Temperature Card */}
              <div className="flex flex-col p-1 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-100">
                <div className="flex justify-between items-center 2xl:mb-1">
                  <span className="text-xs font-normal text-gray-600 2xl:text-sm 2xl:font-medium">Avg Temp</span>
                  <div className="hidden rounded-lg bg-gray-100 p-1 2xl:flex">
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 2xl:gap-4">
                  <div className="text-center">
                    <p className="text-xs font-normal text-gray-800 2xl:text-xl 2xl:font-bold">{temperatureStats?.ASide?.avgTemp ?? "--"}</p>
                    <p className="font-normal text-[10px] 2xl:text-sm 2xl:font-medium text-gray-500">East Side</p>
                  </div>
                  <div className="text-center border-l border-gray-200 2xl:pl-4">
                    <p className="text-xs font-normal text-gray-800 2xl:text-xl 2xl:font-bold">{temperatureStats?.BSide?.avgTemp ?? "--"}</p>
                    <p className="font-normal text-[10px] 2xl:text-sm 2xl:font-medium text-gray-500">West Side</p>
                  </div>
                </div>
              </div>

              {/* Sensor Alerts Card */}
              <div className="flex flex-col p-1 bg-gradient-to-br from-amber-50 to-white rounded-lg border border-amber-100">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-normal text-gray-600 2xl:text-sm 2xl:font-medium">Sensor Alerts</span>
                  <div className="hidden rounded-lg bg-amber-100 p-1 2xl:flex">
                    <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <p className="mt-2 text-xs font-normal text-gray-800 2xl:text-xl 2xl:font-bold">N/A</p>
                <p className="mt-auto text-xs font-normal text-amber-600 2xl:text-sm 2xl:font-medium">Requires attention</p>
              </div>
            </div>
            {/* </div> */}


            <div className="2xl:p-3 bg-gray-50 border-t border-gray-100 h-[15%] 2xl:h-[20%] rounded-b-3xl">
              <div className="grid grid-cols-1 gap-2 items-end 2xl:gap-3 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <div className="relative">
                    <input type="number" name="min" value={thresholds.min} onChange={handleThresholdChange} className="h-8 2xl:h-full w-full rounded-md border border-gray-200 py-1 pl-3 pr-8 text-[8px] leading-tight 2xl:text-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Min value" />
                    <span className="absolute right-2 top-1/2 text-[8px] 2xl:text-sm text-gray-500 transform -translate-y-1/2">°C</span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <div className="relative">
                    <input type="number" name="max" value={thresholds.max} onChange={handleThresholdChange} className="h-8 2xl:h-full w-full rounded-md border border-gray-200 py-1.5 pl-3 pr-8 text-[8px] leading-tight 2xl:text-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Max value" />
                    <span className="absolute right-2 top-1/2 text-[8px] 2xl:text-sm text-gray-500 transform -translate-y-1/2">°C</span>
                  </div>
                </div>
                <div className="sm:col-span-1">
                  <button onClick={handleSaveThresholds} className="px-2 py-1 w-full h-8 text-xs text-white whitespace-nowrap bg-gradient-to-r from-blue-600 to-blue-700 rounded-md shadow-sm transition-all duration-150 hover:from-blue-700 hover:to-blue-800 hover:shadow 2xl:text-sm font-normal 2xl:font-medium">
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <div className="order-4 p-2 rounded-2xl border-2 shadow-md backdrop-blur-sm bg-white/30 xl:order-4">
          <div className="relative w-full md:h-full">
            <div className="mb-4  h-[15%] flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center h-[100%] gap-2">
                <h3 className="text-gray-800 text-[10px] xl:text-[10px] 2xl:text-[14px]">
                  Temperature Trend
                </h3>
                <div className="inline-flex rounded-lg  bg-gray-50 p-1 shadow-inner h-[90%]">
                  {[
                    { value: 'ASide', label: 'East Side' },
                    { value: 'BSide', label: 'West Side' }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleSideChange(value)}
                      className={`relative flex items-center justify-center  rounded-md px-2 py-1 h-[100%] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${selectedSide === value
                        ? 'bg-white text-blue-600 shadow-sm'
                        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                        }`}
                      aria-pressed={selectedSide === value}
                    >
                      <span className="relative z-10 flex items-center text-[10px]">

                        <div className="">
                          {label}
                        </div>
                      </span>
                      {selectedSide === value && (
                        <span className="absolute inset-0 rounded-md ring-1 ring-gray-200 bg-white/80"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowLegendPopup(!showLegendPopup)}
                  className="flex gap-1 items-center px-2 py-1 text-xs text-blue-600 bg-blue-50 rounded-md border border-blue-100 transition-colors hover:bg-blue-100"
                >
                  <span className="text-[6px] xl:text-[8px] 2xl:text-[14px]" >Legend</span>
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {showLegendPopup && (
                  <div className="absolute right-0 left-1  bottom-10 z-30 w-[28rem] overflow-visible rounded-lg border border-gray-200 bg-white shadow-lg ">
                    <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">
                        {selectedSide} Sensors
                        <span className="ml-1 text-xs font-normal text-gray-500">
                          (
                          {
                            sensors.filter(
                              (s) =>
                                s.waveguide ===
                                (selectedSide === "ASide" ? "WG1" : "WG2"),
                            ).length
                          }{" "}
                          active)
                        </span>
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLegendPopup(false);
                        }}
                        className="px-2 py-1 text-xs text-blue-600 rounded transition-colors hover:bg-blue-50 hover:text-blue-800"
                      >
                        Close
                      </button>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-3">
                        {sensors
                          .filter(
                            (sensor) =>
                              sensor.waveguide ===
                              (selectedSide === "ASide" ? "WG1" : "WG2"),
                          )
                          .map((sensor, index) => {
                            // Get the sensor number from the name (e.g., 'Sensor 1' -> '1')
                            const sensorNumber = sensor.name.replace(/\D/g, "");
                            // Create consistent sensor ID that matches the chart's format
                            const sensorId = `${sensor.waveguide === "WG1" ? "ASide" : "BSide"}${sensorNumber}`;
                            const isHidden = hiddenSensors[sensorId];
                            const displayName =
                              sensor.waveguide === "WG1"
                                ? `ES${sensorNumber}`
                                : `WS${Number(sensorNumber) + 12}`;

                            return (
                              <div
                                key={sensor.id}
                                className={`flex cursor-pointer items-center rounded p-2 text-xs hover:bg-gray-50 ${isHidden ? "opacity-40" : ""}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setHiddenSensors((prev) => ({
                                    ...prev,
                                    [sensorId]: !prev[sensorId],
                                  }));
                                }}
                                title={isHidden ? "Show sensor" : "Hide sensor"}
                              >
                                <div
                                  className="mr-2 h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                  style={{
                                    backgroundColor: `hsl(${(index * 137.5) % 360}, 70%, 50%`,
                                    opacity: isHidden ? 0.5 : 0.9,
                                    transition: "opacity 0.2s",
                                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex justify-between items-baseline">
                                    <span
                                      className={`truncate font-medium ${isHidden ? "text-gray-500" : "text-gray-900"}`}
                                    >
                                      {displayName}
                                    </span>
                                    <span
                                      className={`ml-2 font-medium ${isHidden ? "text-gray-400" : "text-blue-600"}`}
                                    >
                                      {sensor.value}°C
                                    </span>
                                  </div>
                                  <div className="flex justify-end">
                                    <span
                                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${sensor.isPositive
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                      {sensor.isPositive ? "↑" : "↓"}{" "}
                                      {sensor.difference}°C
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-1 justify-end items-center w-full sm:w-auto">
                <div className="inline-flex items-center rounded-lg bg-gray-50 p-0.5 shadow-inner">
                  {[
                    { value: "Live", label: "Live" },
                    { value: "1h", label: "1h" },
                    { value: "2h", label: "2h" },
                    { value: "5h", label: "5h" },
                    { value: "7h", label: "7h" },
                    { value: "12h", label: "12h" }
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => handleTimeIntervalChange(value)}
                      className={`relative flex items-center justify-center rounded-md px-3 py-1.5 text-xs text-[6px] xl:text-[8px] 2xl:text-[14px] transition-all duration-200 ${timeInterval === value
                        ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200'
                        : 'text-gray-600 hover:bg-white/50 hover:text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                      aria-pressed={timeInterval === value}
                    >
                      {value === 'Live' && (
                        <span
                          className={`mr-1.5 h-1.5 w-1.5 rounded-full ${timeInterval === 'Live'
                            ? 'bg-green-500 animate-pulse'
                            : 'bg-gray-400'
                            }`}
                          style={timeInterval === 'Live' ? {
                            animationDuration: '1.5s',
                            animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)'
                          } : {}}
                        ></span>
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative h-[300px] rounded-lg border border-gray-100 bg-white/50 md:h-[400px] xl:h-[calc(100%-50px)] 2xl:h-[calc(100%-80px)]">

              <Line
                key={`${chartUpdateKey}-${selectedSide}`}
                data={{
                  labels: chartData.labels,
                  datasets: (chartData.datasets || []).filter(
                    (dataset, index) => {
                      // Use the same sensor ID format as in the legend (e.g., 'ASide1', 'BSide1')
                      const sensorNumber = index + 1;
                      const sensorId = `${selectedSide}${sensorNumber}`;
                      return !hiddenSensors[sensorId];
                    },
                  ),
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      display: false, // Hide default legend since we're using custom one
                    },
                    tooltip: {
                      filter: (tooltipItem) => {
                        const datasetIndex = tooltipItem.datasetIndex;
                        // Get the sensor ID in the format used in hiddenSensors (e.g., 'ASide1', 'BSide1')
                        const sensorId = `${selectedSide}${datasetIndex + 1}`;
                        return !hiddenSensors[sensorId];
                      },
                      backgroundColor: "#fff",
                      titleColor: "#111827",
                      titleFont: { weight: "600", size: 12 },
                      bodyColor: "#4B5563",
                      bodyFont: { size: 11 },
                      borderColor: "#E5E7EB",
                      borderWidth: 1,
                      padding: 10,
                      cornerRadius: 6,
                      displayColors: true,
                      usePointStyle: true,
                      callbacks: {
                        label: (context) => {
                          // Convert dataset label from 'sensorX' to 'ESX' or 'WSX' format
                          const sensorNum = context.dataset.label.replace(
                            /\D/g,
                            "",
                          );
                          const prefix = selectedSide === "ASide" ? "ES" : "WS";
                          return `${prefix}${sensorNum}: ${context.parsed.y}°C`;
                        },
                        title: (context) => {
                          const date = new Date(
                            chartData.rawData?.[
                              context[0]?.dataIndex
                            ]?.timestamp,
                          );
                          return date.toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          });
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: {
                        color: "#6B7280",
                        font: { size: 10 },
                        maxRotation: 45,
                        minRotation: 45,
                        autoSkip: true,
                        maxTicksLimit: 8,
                        padding: 4,
                      },
                    },
                    y: {
                      grid: {
                        color: "rgba(229, 231, 235, 0.5)",
                        drawBorder: false,
                        drawTicks: false,
                        borderDash: [4, 4],
                      },
                      ticks: {
                        color: "#6B7280",
                        font: { size: 10 },
                        padding: 6,
                        callback: (value) => `${value}°C`,
                      },
                      min: 0,
                      max: maxDataValue + 50,
                    },
                  },
                  interaction: {
                    intersect: false,
                    mode: "index",
                    axis: "x",
                  },
                  elements: {
                    line: {
                      borderWidth: 1.5,
                    },
                    point: {
                      radius: 1.5,
                      hoverRadius: 4,
                      hoverBorderWidth: 2,
                    },
                  },
                  layout: {
                    padding: { top: 10, right: 5, bottom: 10, left: 5 },
                  },
                  animation: {
                    duration: 1000,
                    easing: "easeOutQuart",
                  },
                }}
              />
            </div>
            
          </div>
        </div>

        <div className="order-5 flex w-[100%] flex-col gap-1 rounded-2xl border-2 bg-white/30 p-2 shadow-md backdrop-blur-sm md:flex-row xl:order-5">
          <div className=" w-full h-full p-1 gap-2 z-10 rounded-2xl border-white bg-white/5 backdrop-blur-sm md:w-[40%] grid grid-cols-3 overflow-auto" style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#6B7280 transparent",
          }}>

            {/* ES1-ES12 */}
            {Array.from({ length: 12 }).map((_, i) => {
              const sensorId = `ES${i + 1}`;
              // Mock data - replace with actual data from your API
              const currentAvg = 50 + Math.random() * 50; // Random value between 50-100
              const previousAvg = 45 + Math.random() * 50; // Random value between 45-95

              return (
                <SensorComparisonCard
                  key={sensorId}
                  sensorId={sensorId}
                  currentAvg={currentAvg}
                  previousAvg={previousAvg}
                  unit="°C"
                />
              );
            })}

            {/* WS13-WS24 */}
            {Array.from({ length: 12 }).map((_, i) => {
              const sensorId = `WS${i + 13}`;
              // Mock data - replace with actual data from your API
              const currentAvg = 50 + Math.random() * 50; // Random value between 50-100
              const previousAvg = 45 + Math.random() * 50; // Random value between 45-95

              return (
                <SensorComparisonCard
                  key={sensorId}
                  sensorId={sensorId}
                  currentAvg={currentAvg}
                  previousAvg={previousAvg}
                  unit="°C"
                />
              );
            })}

          </div>

          <div className="flex w-full items-center rounded-2xl border-2 border-white md:w-[60%]">
            <div className="relative">
              <img src={potShell} alt="potShell" />
              {/* east side sensors */}
              {leftValues.map((data, i) => (
                <div
                  key={i}
                  className="xs:leading-normal xs:text-[8px] absolute top-[17%] flex flex-col gap-2 text-[8px] font-semibold leading-tight 2xl:text-sm"
                  style={{ left: `${data}%` }}
                >
                  <div
                    className="relative cursor-pointer py-2 hover:scale-110 hover:text-[#3047C0]"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    <div className="hover:text-[#3048C0]">ES{i + 1}</div>
                    <div
                      className={`absolute -top-[70%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white p-1 transition-all duration-300 ${hoveredIndex === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
                    >
                      {wg1Sensors[i]?.value} °C
                    </div>
                  </div>
                </div>
              ))}

              {/* west side sensors */}
              {leftValues2.slice().map((data, i) => {
                const sensorIndex = 24 - i;

                return (
                  <div
                    key={i}
                    className="xs:text-[8px] absolute top-[68%] flex flex-col gap-2 text-[8px] font-semibold leading-tight 2xl:text-xs 2xl:leading-normal"
                    style={{ left: `${data}%` }}
                  >
                    <div
                      className="relative cursor-pointer py-2 hover:scale-110 hover:text-[#3047C0]"
                      onMouseEnter={() => setHoveredIndex2(i)}
                      onMouseLeave={() => setHoveredIndex2(null)}
                    >
                      <div className="hover:text-[#3048C0]">WS{sensorIndex}</div>
                      <div
                        className={`absolute -bottom-[80%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white p-1 transition-all duration-300 ${hoveredIndex2 === i ? "opacity-100" : "pointer-events-none opacity-0"
                          }`}
                      >
                        {wg2Sensors[11 - i]?.value} °C
                      </div>
                    </div>
                  </div>
                );
              })}


            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
