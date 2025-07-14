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
  <div className="flex h-full w-full items-center justify-center">
    <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-blue-500"></div>
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
    <div className="group relative rounded-lg border border-gray-200 bg-[rgba(234,237,249,1)] p-3 shadow-md transition-shadow hover:shadow 2xl:w-36">
      <button
        onClick={handleNavigate}
        className="absolute right-4 top-1 rounded p-1 opacity-0 transition-opacity duration-200 hover:bg-blue-50 group-hover:opacity-100"
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
        className={`absolute bottom-3 right-1 flex items-center rounded-full bg-white p-1 pl-2 pr-2 text-xs ${sensor.isPositive ? "text-green-500" : "text-red-500"}`}
      >
        {sensor.isPositive ? (
          <FaArrowUp className="mb-1 mr-0.5 mt-0.5" />
        ) : (
          <FaArrowDown className="mb-1 mr-0.5 mt-0.5" />
        )}
        <span className="font-medium">{sensor.difference}</span>
      </div>
      <div className="flex flex-col">
        <h3 className="left-0 flex truncate text-sm font-semibold text-[#1e2c74]">
          {sensor.name.includes("A")
            ? `ES${sensor.name.replace(/[^0-9]/g, "")}`
            : `WS${Number(sensor.name.replace(/[^0-9]/g, "")) + 12}`}
        </h3>
        <div className="flex items-baseline">
          <span className="text-sm font-bold text-[#3047c0]">
            {sensor.value}
            <span className="text-sm font-bold text-[#3047c0]">°C</span>
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
        const response = await API.get("/api/v2/getThresholds");
        if (response.data) {
          setThresholds(response.data);
        }
      } catch (error) {
        console.error("Error fetching thresholds:", error);
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
      const defaultSensorNumber =
        sensors.length > 0 ? sensors[0].name.replace(/[^0-9]/g, "") : "1";
      const sensorId = `sensor${defaultSensorNumber}`;

      // Get the user ID from local storage or use a default
      const userId = localStorage.getItem("userId") || "default-user";

      // Prepare the request payload with all required parameters
      const payload = {
        sensorId,
        side: selectedSide,
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

  return (
    <div className="h-full w-full">
      <div className="flex h-full w-full flex-col gap-4 p-1 text-2xl font-bold text-black xl:grid xl:grid-cols-2 xl:grid-rows-2">
        <div className="order-2 overflow-hidden rounded-lg xl:order-1">
          <div className="grid-col grid h-full gap-2">
            <div className="h-full w-full overflow-hidden rounded-2xl border-2 border-gray-100 bg-white/30 p-4 shadow-md backdrop-blur-sm">
              <div className="relative">
                {/* <button
                  onClick={scrollLeft}
                  className="absolute left-0 top-1/2 z-10 flex items-center justify-center w-10 h-10 bg-white/50 backdrop-blur-sm rounded-full shadow-md transform -translate-y-1/2 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
                  style={{ marginLeft: '8px' }}
                  aria-label="Scroll Left"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                  </svg>
                </button> */}

                <div
                  ref={scrollContainerRef}
                  className="scrollbar-custom relative flex-1 overflow-x-auto xl:overflow-y-hidden"
                  style={{ scrollBehavior: "smooth" }}
                  onScroll={handleScroll}
                >
                  <div className="inline-flex w-full min-w-max space-x-2 px-1">
                    {/* wg1Sensors */}
                    {Array(Math.ceil(wg1Sensors.length / 2))
                      .fill()
                      .map((_, rowIndex) => (
                        <div key={`wg1-${rowIndex}`} className="flex flex-col">
                          {wg1Sensors
                            .slice(rowIndex * 2, rowIndex * 2 + 2)
                            .map((sensor) => (
                              <div key={sensor.id} className="h-24 w-36">
                                <SensorCard sensor={sensor} />
                              </div>
                            ))}
                        </div>
                      ))}
                  </div>
                  {/* wg2Sensors */}
                  <div className="inline-flex w-full min-w-max space-x-2 px-1">
                    {Array(Math.ceil(wg2Sensors.length / 2))
                      .fill()
                      .map((_, rowIndex) => (
                        <div key={`wg2-${rowIndex}`} className="flex flex-col">
                          {wg2Sensors
                            .slice(rowIndex * 2, rowIndex * 2 + 2)
                            .map((sensor) => (
                              <div key={sensor.id} className="h-24 w-36">
                                <SensorCard sensor={sensor} />
                              </div>
                            ))}
                        </div>
                      ))}
                  </div>
                </div>

                {/* <button
                  onClick={scrollRight}
                  className="absolute right-0 top-1/2 z-10 flex items-center justify-center w-10 h-10 bg-white/50 backdrop-blur-sm rounded-full shadow-md transform -translate-y-1/2 hover:bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-300 ease-in-out"
                  style={{ marginRight: '8px' }}
                  aria-label="Scroll Right"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-700">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                </button> */}
              </div>
            </div>
          </div>
        </div>
        {/* <div className="flex overflow-hidden order-1 justify-center items-center rounded-2xl border-2 border-gray-100 shadow-md backdrop-blur-sm xl:order-2 bg-white/30"> */}
        {/* <div className="flex order-1 justify-center items-center rounded-2xl xl:order-2 overflow-hidde">

          <Suspense fallback={<div className="flex justify-center items-center w-full h-full">Loading 3D model...</div>}>
            <ModelViewer modelPath="/side_shell.glb" />
          </Suspense>
        </div> */}
        <div className="order-3 flex flex-col items-stretch gap-4 overflow-hidden rounded-2xl border border-gray-100 bg-white/30 p-4 shadow-md backdrop-blur-sm xl:order-3 xl:flex-row">
          <div className="w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="scrollbar-custom h-96 overflow-x-auto overflow-y-auto md:h-full">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50">
                  <tr className="text-left">
                    <th
                      rowSpan="2"
                      className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-600"
                    >
                      #
                    </th>
                    <th
                      rowSpan="2"
                      className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-gray-600"
                    >
                      Time
                    </th>
                    <th
                      colSpan="3"
                      className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600"
                    >
                      Temperature Data
                    </th>
                  </tr>
                  <tr className="text-left">
                    <th className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-600">
                      Side
                    </th>
                    <th className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-600">
                      Temp (°C)
                    </th>
                    <th className="px-4 py-2 text-xs font-medium uppercase tracking-wider text-gray-600">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {hourlyAverages
                    ?.filter((hourData) => hourData?.entries?.length > 0)
                    .map((hourData, index) => {
                      const getStatusClass = (temp) => {
                        if (temp > 35) return "bg-red-400/20 text-red-700";
                        if (temp < 25) return "bg-blue-400/20 text-blue-700";
                        return "bg-green-400/20 text-green-700";
                      };

                      const getStatusText = (temp) => {
                        if (temp > 35) return "High";
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
                              class: "bg-gray-100/30 text-gray-600",
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
                          <tr className="group transition-colors duration-150 hover:bg-white/20">
                            <td
                              rowSpan="2"
                              className="border-r border-gray-100 px-4 py-3 text-sm font-medium text-gray-800"
                            >
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-gray-700">
                                {index + 1}
                              </span>
                            </td>
                            <td
                              rowSpan="2"
                              className="border-r border-gray-100 px-4 py-3 text-sm font-medium text-gray-700"
                            >
                              <div className="flex flex-col">
                                <span className="font-semibold text-gray-900">
                                  {hourData.time?.split(" ")[0] || "--"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {hourData.time?.split(" ")[1] || ""}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-700">
                              <span className="inline-flex items-center">
                                <span className="mr-2 h-2 w-2 rounded-full bg-blue-500"></span>
                                East Side
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-700">
                              {aSide.temp}°C
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${aSide.status.class} backdrop-blur-sm`}
                              >
                                {aSide.status.text}
                              </span>
                            </td>
                          </tr>
                          <tr className="group border-b border-gray-100 transition-colors duration-150 hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm font-medium text-gray-700">
                              <span className="inline-flex items-center">
                                <span className="mr-2 h-2 w-2 rounded-full bg-amber-500"></span>
                                West Side
                              </span>
                            </td>
                            <td className="px-4 py-2 text-sm font-medium text-gray-700">
                              {bSide.temp}°C
                            </td>
                            <td className="px-4 py-2">
                              <span
                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${bSide.status.class} backdrop-blur-sm`}
                              >
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

          <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
            <div className="flex-shrink-0 border-b border-gray-100 p-2">
              <div className="flex items-center justify-between">
                <h5 className="text-sm font-medium text-gray-700">
                  Temperature Statistics
                </h5>
                {liveStatus.timestamp && (
                  <h3 className="text-sm font-medium text-gray-700">
                    {" "}
                    updatedAt: {liveStatus.timestamp || "N/A"}
                  </h3>
                )}
                <div
                  className={`flex items-center space-x-2 rounded-full px-2.5 py-1 text-xs font-medium ${liveStatus.isLive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}
                >
                  {liveStatus.isLive ? (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-green-500"></span>
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-gray-400"></span>
                  )}
                  <div className="flex flex-col items-end">
                    <span>{liveStatus.isLive ? "Live" : "Inactive"}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid flex-grow grid-cols-2 gap-3 p-3 lg:grid-cols-4 2xl:grid-cols-2">
              {/* Max Temperature Card */}
              <div className="flex h-full flex-col rounded-lg border border-red-100 bg-gradient-to-br from-red-50 to-white p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-red-600">
                    Max Temp
                  </span>
                  <div className="hidden rounded-lg bg-red-100 p-1.5 2xl:flex">
                    <svg
                      className="h-4 w-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                      />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-gray-800 lg:font-regular lg:text-xs 2xl:text-xl 2xl:font-bold">
                      {temperatureStats?.ASide?.maxTemp ?? "--"}
                    </p>
                    <p className="text-xs text-gray-500">East Side</p>
                  </div>
                  <div className="border-l border-gray-200 pl-4 text-center">
                    <p className="text-gray-800 lg:font-regular lg:text-xs 2xl:text-xl 2xl:font-bold">
                      {temperatureStats?.BSide?.maxTemp ?? "--"}
                    </p>
                    <p className="text-xs text-gray-500">West Side</p>
                  </div>
                </div>
              </div>

              {/* Min Temperature Card */}
              <div className="flex h-full flex-col rounded-lg border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">
                    Min Temp
                  </span>
                  <div className="hidden rounded-lg bg-blue-100 p-1.5 2xl:flex">
                    <svg
                      className="h-4 w-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-gray-800 lg:font-regular lg:text-xs 2xl:text-xl 2xl:font-bold">
                      {temperatureStats?.ASide?.minTemp ?? "--"}
                    </p>
                    <p className="text-xs text-gray-500">East Side</p>
                  </div>
                  <div className="border-l border-gray-200 pl-4 text-center">
                    <p className="text-gray-800 lg:font-regular lg:text-xs 2xl:text-xl 2xl:font-bold">
                      {temperatureStats?.BSide?.minTemp ?? "--"}
                    </p>
                    <p className="text-xs text-gray-500">West Side</p>
                  </div>
                </div>
              </div>

              {/* Average Temperature Card */}
              <div className="flex h-full flex-col rounded-lg border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Avg Temp
                  </span>
                  <div className="hidden rounded-lg bg-gray-100 p-1.5 2xl:flex">
                    <svg
                      className="h-4 w-4 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                      />
                    </svg>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-gray-800 lg:font-regular lg:text-xs 2xl:text-xl 2xl:font-bold">
                      {temperatureStats?.ASide?.avgTemp ?? "--"}
                    </p>
                    <p className="text-xs text-gray-500">East Side</p>
                  </div>
                  <div className="border-l border-gray-200 pl-4 text-center">
                    <p className="text-gray-800 lg:font-regular lg:text-xs 2xl:text-xl 2xl:font-bold">
                      {temperatureStats?.BSide?.avgTemp ?? "--"}
                    </p>
                    <p className="text-xs text-gray-500">West Side</p>
                  </div>
                </div>
              </div>

              <div className="flex h-full flex-col rounded-lg border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-600">
                    Alerts
                  </span>
                  <div className="hidden rounded-lg bg-amber-100 p-1.5 2xl:flex">
                    <svg
                      className="h-4 w-4 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-800 lg:font-regular lg:text-xs 2xl:text-2xl 2xl:font-bold">
                  N/A
                </p>
                <p className="mt-auto text-xs font-medium text-amber-600">
                  Requires attention
                </p>
              </div>
            </div>

            <div className="mt-auto border-t border-gray-100 bg-gray-50 p-3">
              <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-5">
                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Min Threshold
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="min"
                      value={thresholds.min}
                      onChange={handleThresholdChange}
                      className="w-full rounded-md border border-gray-200 py-1.5 pl-3 pr-8 text-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Min value"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 transform text-sm text-gray-500">
                      °C
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Max Threshold
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="max"
                      value={thresholds.max}
                      onChange={handleThresholdChange}
                      className="w-full rounded-md border border-gray-200 py-1.5 pl-3 pr-8 text-sm transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="Max value"
                    />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 transform text-sm text-gray-500">
                      °C
                    </span>
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <button
                    onClick={handleSaveThresholds}
                    className="w-full whitespace-nowrap rounded-md bg-gradient-to-r from-blue-600 to-blue-700 py-[7px] text-white shadow-sm transition-all duration-150 hover:from-blue-700 hover:to-blue-800 hover:shadow lg:text-xs lg:font-thin 2xl:text-sm 2xl:font-medium"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-4 rounded-2xl border-2 bg-white/30 p-4 shadow-md backdrop-blur-sm xl:order-4">
          <div className="relative w-full md:h-full">
            <div className="mb-4 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  Temperature Trend
                </h3>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="side"
                      value="ASide"
                      checked={selectedSide === "ASide"}
                      onChange={() => handleSideChange("ASide")}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      East Side
                    </span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="side"
                      value="BSide"
                      checked={selectedSide === "BSide"}
                      onChange={() => handleSideChange("BSide")}
                      className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      West Side
                    </span>
                  </label>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() => setShowLegendPopup(!showLegendPopup)}
                  className="flex items-center gap-1 rounded-md border border-blue-100 bg-blue-50 px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-100"
                >
                  <span>Legend</span>
                  <svg
                    className="h-3 w-3"
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
                  <div className="absolute right-0 top-8 z-10 w-[28rem] overflow-visible rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="border-b border-gray-100 p-3">
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
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-baseline justify-between">
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
                                      className={`inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-medium ${
                                        sensor.isPositive
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
                    <div className="border-t border-gray-100 bg-gray-50 p-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLegendPopup(false);
                        }}
                        className="rounded px-2 py-1 text-xs text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-800"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                {["Live", "1h", "2h", "5h", "7h", "12h"].map((interval) => (
                  <button
                    key={interval}
                    className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                      timeInterval === interval
                        ? "scale-[1.02] border-blue-300 bg-blue-100 text-blue-700 shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1`}
                    onClick={() => handleTimeIntervalChange(interval)}
                  >
                    {interval}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative h-[300px] rounded-lg border border-gray-100 bg-white/50 p-3 md:h-[400px] xl:h-[calc(100%-50px)]">
              <div className="absolute right-4 top-2 z-10 text-xs text-gray-500">
                {selectedSide === "ASide" ? "East Side" : "West Side"} -{" "}
                {chartData.datasets?.length || 0} sensors
              </div>
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

        <div className="order-5 flex w-[100%] flex-col gap-2 rounded-2xl border-2 bg-white/30 p-4 shadow-md backdrop-blur-sm md:flex-row xl:order-5">
          <div className="flex w-full items-center justify-center rounded-2xl border-2 border-white font-medium md:w-[30%]">
            left side
          </div>

          <div className="flex w-full items-center rounded-2xl border-2 border-white md:w-[70%]">
            <div className="relative">
              <img src={potShell} alt="potShell" />
              {/* east side sensors */}
              {leftValues.map((data, i) => (
                <div
                  key={i}
                  className="xs:leading-normal xs:text-[10px] absolute top-[17%] flex flex-col gap-2 text-[8px] font-semibold leading-tight 2xl:text-sm"
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
              {leftValues.map((data, i) => (
                <div
                  key={i}
                  className="xs:text-[9px] absolute top-[68%] flex flex-col gap-2 text-[8px] font-semibold leading-tight 2xl:text-xs 2xl:leading-normal"
                  style={{ left: `${data}%` }}
                >
                  <div
                    className="relative cursor-pointer py-2 hover:scale-110 hover:text-[#3047C0]"
                    onMouseEnter={() => setHoveredIndex2(i)}
                    onMouseLeave={() => setHoveredIndex2(null)}
                  >
                    <div className="hover:text-[#3048C0]">WS{i + 1}</div>
                    <div
                      className={`absolute -bottom-[80%] left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white p-1 transition-all duration-300 ${hoveredIndex2 === i ? "opacity-100" : "pointer-events-none opacity-0"}`}
                    >
                      {wg2Sensors[i]?.value} °C
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
