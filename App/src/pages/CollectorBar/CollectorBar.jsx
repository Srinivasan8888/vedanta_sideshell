import React, { useEffect, useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Chart } from "chart.js";
import Dropdown from "../../Assets/components/CollectorBar/Dropdown.jsx";
import DropdownSides from "../../Assets/components/CollectorBar/Dropdown-sides.jsx";
// import Chartbar from "../../Assets/components/Dashboard/miscellaneous/chartbar";
import Chartline from "../../Assets/components/Dashboard/miscellaneous/chartline";
import CollectorBarTable from "../../Assets/components/CollectorBar/CollectorBarTable";
import API from "../../Assets/components/Axios/AxiosInterceptor.jsx";

const CollectorBar = () => {
  const [activeButton, setActiveButton] = useState("30Min");
  const [selectedButton, setSelectedButton] = useState(null);
  const [dropdown, setSelectedDropdown] = useState("sensor1");
  const [collectorbar, setCollectorbar] = useState();
  const [searchParams] = useSearchParams();
  const [selectedside, setSelectedside] = useState("Aside");
  const [selected, setSelected] = useState("");
  const chartRef = useRef(null);

  // Get URL parameters and update state
  useEffect(() => {
    const sensorId = searchParams.get("sensorId");
    const side = searchParams.get("side");

    console.log("URL Params - sensorId:", sensorId, "side:", side);

    if (sensorId) {
      // Clean up sensor ID (remove any non-numeric characters and add 'sensor' prefix)
      const cleanSensorId = `sensor${sensorId.replace(/[^0-9]/g, "")}`;
      console.log("Setting sensor dropdown to:", cleanSensorId);
      setSelectedDropdown(cleanSensorId);
    }

    if (side) {
      console.log("Setting side to:", side);
      setSelectedside(side);
    }
  }, [searchParams]);
  const [userData, setUserData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: "rgba(255, 255, 255, 1)",
        backgroundColor: "rgba(233, 238, 251, 0.24)",
        tension: 0.4,
        fill: true,
        borderWidth: 4,
      },
    ],
  });

  const [unitPreference, setUnitPreference] = useState("C");

  const handleButtonClick = (buttonId) => {
    setActiveButton(buttonId);
  };

  const handleButtonSelect = (buttonId) => {
    setSelectedButton(buttonId);
  };

  useEffect(() => {
    // Get part from URL or localStorage
    const partFromURL = searchParams.get("part");
    const storedPart = localStorage.getItem("selectedDropdown");

    if (partFromURL) {
      setSelectedDropdown(partFromURL);
      localStorage.setItem("selectedDropdown", partFromURL); // Store in local storage
    } else if (storedPart) {
      setSelectedDropdown(storedPart);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchCollectorBarData = async () => {
      try {
        const response = await API.get(
          `${process.env.REACT_APP_SERVER_URL}api/v2/getcollectorbar`,
          {
            params: {
              sensorId: dropdown,
              time: activeButton,
            },
          },
        );
        handleCollectorbarData(response.data);
      } catch (error) {
        console.error("Error fetching collector bar data:", error);
      }
    };

    fetchCollectorBarData();
  }, [dropdown, activeButton]);

  const handleCollectorbarData = (data) => {
    console.log("Received Collector Bar Data:", data);
    setCollectorbar(data);

    // Get sensor ID from dropdown
    const sensorId = dropdown;

    // Create array of {timestamp, value} objects
    const tableData = data[sensorId].map((value, index) => ({
      [sensorId]: value,
      createdAt: data.createdAt[index],
    }));

    // Transform the data for the chart
    const labels = tableData.map((item) =>
      new Date(item.createdAt).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }),
    );
    const temperatures = tableData.map((item) => parseFloat(item[sensorId]));

    setUserData((prevData) => ({
      ...prevData,
      labels: labels,
      datasets: [
        {
          ...prevData.datasets[0],
          data: temperatures,
        },
      ],
    }));

    // Update min/max/avg display directly from API values
    setMinValue(data.minValue);
    setMaxValue(data.maxValue);
    setAvgValue(data.averageValue.toFixed(2));
  };

  const options = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: function (context) {
            const index = context[0].dataIndex;
            const timestamp = userData.labels[index];
            return `Timestamp: ${timestamp}`;
          },
          label: function (context) {
            return `Temperature: ${context.parsed.y}°C`;
          },
        },
      },
      zoom: {
        zoom: {
          wheel: {
            enabled: true,
            speed: 0.1,
          },
          pinch: {
            enabled: true,
          },
          mode: "xy",
          onZoomComplete: function (context) {
            // Optional callback for when zoom is completed
            console.log("Zoom completed");
          },
        },
        pan: {
          enabled: true,
          mode: "xy",
          threshold: 10,
        },
        limits: {
          y: { min: "original", max: "original" },
          x: { min: "original", max: "original" },
        },
      },
    },
    scales: {
      y: {
        position: "right",
        title: {
          display: true,
          text: "Temperature (°C)",
          color: "white",
          font: {
            size: 12,
          },
        },
        ticks: {
          color: "white",
          font: {
            size: 12, // Default size (matches text-[12px])
          },
          callback: function (value) {
            return value.toFixed(2) + " °C";
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Timestamp",
          color: "white",
          font: {
            size: 12, // Default size (matches text-[12px])
          },
        },
        ticks: {
          color: "white",
          font: {
            size: 12, // Default size (matches text-[12px])
          },
        },
      },
    },
    // Add responsive behavior for font sizes
    responsive: true,
    onResize: function (chart, size) {
      // This is a simple approach to match the Tailwind responsive classes
      // text-[12px] xl:text-[8px] 2xl:text-[15px]
      let fontSize = 12; // Default (text-[12px])

      if (size.width >= 1536) {
        // 2xl breakpoint
        fontSize = 15;
      } else if (size.width >= 1280) {
        // xl breakpoint
        fontSize = 8;
      }

      // Update all font sizes
      chart.options.scales.y.title.font.size = fontSize;
      chart.options.scales.y.ticks.font.size = fontSize;
      chart.options.scales.x.title.font.size = fontSize;
      chart.options.scales.x.ticks.font.size = fontSize;
    },
  };

  // State for table data
  const [tableData, setTableData] = useState({
    createdAt: [],
    sensor1: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the current sensor ID from the dropdown
        const sensorId = dropdown || "sensor1";
        // Get the current side (default to 'Aside' if not selected)
        const side = selectedside || "Aside";
        // Get the current interval (default to '30Min' if not selected)
        const interval = activeButton || "30Min";

        const response = await API.get(
          `${process.env.REACT_APP_SERVER_URL}api/v2/getCollectorbar`,
          {
            params: {
              sensorId,
              sides: side,
              interval,
            },
          },
        );

        // Process the response data
        if (response.data && response.data.data) {
          const labels = response.data.data.map((item) =>
            new Date(item.timestamp).toLocaleTimeString(),
          );
          const data = response.data.data.map((item) => item.value);

          setUserData((prevData) => ({
            ...prevData,
            labels,
            datasets: [
              {
                ...prevData.datasets[0],
                data,
                label: `${sensorId} (${side})`,
              },
            ],
          }));

          // Prepare data for the table
          const timestamps = response.data.data.map((item) => item.timestamp);
          const sensorValues = response.data.data.map((item) => item.value);

          setTableData({
            createdAt: timestamps,
            [sensorId]: sensorValues,
            minValue: Math.min(...sensorValues.filter((val) => val !== null)),
            maxValue: Math.max(...sensorValues.filter((val) => val !== null)),
            averageValue:
              sensorValues.reduce((a, b) => a + b, 0) / sensorValues.length,
          });

          // Update min, max, avg values if needed
          if (data.length > 0) {
            const values = data.filter((val) => val !== null);
            if (values.length > 0) {
              setMinValue(Math.min(...values).toFixed(2));
              setMaxValue(Math.max(...values).toFixed(2));
              setAvgValue(
                (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2),
              );
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
    // Add dependencies that should trigger a refetch
  }, [dropdown, selectedside, activeButton]);

  // Add state for values
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const [avgValue, setAvgValue] = useState(0);

  return (
    <div className="m-4 flex h-[1260px] flex-col rounded-lg border border-white bg-gradient-to-br from-white/20 via-white/5 to-white/20 backdrop-blur-[5px] md:h-[93%] 2xl:h-[95]">
      <div className="flex flex-col gap-x-2 rounded-tl-lg rounded-tr-lg border border-white bg-[#e9eefb]/25 p-2 md:h-[10] md:w-full md:flex-row">
        {/* <select
          className="ml-5 border-b border-white bg-transparent font-['Inter'] text-3xl font-bold text-white focus:outline-none"
          value={dropdown} // Set selected value
          onChange={(e) => {
            const selectedValue = e.target.value;
            setSelectedDropdown(selectedValue);
            localStorage.setItem("selectedDropdown", selectedValue); // Store in local storage
          }}
        >
          {fetchedOptions.map((option, index) => (
            <option
              key={index}
              value={option}
              className="text-white bg-black"
            >
              {option}
            </option>
          ))}
        </select> */}
        <Dropdown
          selected={dropdown}
          setSelected={setSelectedDropdown}
          selectedSide={selectedside}
        />
        <DropdownSides
          selectedside={selectedside}
          setSelectedside={setSelectedside}
        />
      </div>

      <div className="flex flex-col md:h-full xl:flex-row">
        <div className="p-4 md:h-[50%] md:w-[100%] xl:h-[100%] xl:w-[80%] 2xl:w-[80%]">
          <div className="flex flex-col justify-between rounded-lg bg-gradient-to-br from-white/20 via-white/5 to-white/20 shadow-[0px_8px_21.5px_0px_rgba(0,0,0,0.33)] md:h-[8%] md:w-[100%] md:flex-row">
            <div className="mx-auto flex items-center">
              <div className="text-normal mr-10 flex justify-between font-['Inter'] text-[12px] font-bold text-white 2xl:text-[20px]">
                Max Value
              </div>
              <div className="text-normal ml-4 font-['Inter'] text-[12px] font-bold text-white 2xl:text-[20px]">
                {maxValue}°C
              </div>
            </div>

            <div className="mx-auto flex items-center">
              <div className="text-normal mr-10 flex justify-between font-['Inter'] text-[12px] font-bold text-white 2xl:text-[20px]">
                Min Value
              </div>
              <div className="text-normal ml-4 font-['Inter'] text-[12px] font-bold text-white 2xl:text-[20px]">
                {minValue}°C
              </div>
            </div>

            <div className="mx-auto flex items-center">
              <div className="text-normal mr-10 flex justify-between font-['Inter'] text-[12px] font-bold text-white 2xl:text-[20px]">
                Avg Value
              </div>
              <div className="text-normal ml-4 font-['Inter'] text-[12px] font-bold text-white 2xl:text-[20px]">
                {tableData.averageValue
                  ? tableData.averageValue.toFixed(2)
                  : "0.00"}
                °C
              </div>
            </div>
          </div>

          <div className="backdrop-blur-blur mt-4 h-[600px] rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-white/20 backdrop:blur-[5px] md:h-[80%] xl:h-[88%] xl:w-[100%] 2xl:h-[88%]">
            <div className="flex flex-col rounded-tl-2xl rounded-tr-2xl bg-[#e9eefb]/10 md:h-[10%] md:w-full md:flex-row">
              <div className="flex items-center justify-around text-white md:w-[10%]">
                <div className="text-normal font-['Inter'] text-[12px] font-bold text-white 2xl:text-[15px]">
                  TI
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-around md:w-[50%] md:flex-row">
                <button
                  className={`${
                    activeButton === "30Min"
                       ? "bg-[rgba(233,238,251,0.67)] text-white"
                      : "bg-[rgba(233,238,251,0.24)] text-white"
                  } text-normal mb-2 me-2 rounded-lg px-2 py-1.5 text-center text-[12px] font-medium hover:bg-[#4a4878] focus:outline-none focus:ring-4 2xl:px-5 2xl:py-2.5 2xl:text-[15px]`}
                  onClick={() => handleButtonClick("30Min")}
                >
                  30Min
                </button>
                <button
                  className={`${
                    activeButton === "1H"
                      ? "bg-[rgba(233,238,251,0.67)] text-white"
                      : "bg-[rgba(233,238,251,0.24)] text-white"
                  } text-normal mb-2 me-2 rounded-lg px-2 py-1.5 text-center text-[12px] font-medium hover:bg-[#4a4878] focus:outline-none focus:ring-4 2xl:px-5 2xl:py-2.5 2xl:text-[15px]`}
                  onClick={() => handleButtonClick("1H")}
                >
                  1H
                </button>
                <button
                  className={`${
                    activeButton === "12H"
                      ? "bg-[rgba(233,238,251,0.67)] text-white"
                      : "bg-[rgba(233,238,251,0.24)] text-white"
                  } text-normal mb-2 me-2 rounded-lg px-2 py-1.5 text-center text-[12px] font-medium hover:bg-[#4a4878] focus:outline-none focus:ring-4 2xl:px-5 2xl:py-2.5 2xl:text-[15px]`}
                  onClick={() => handleButtonClick("12H")}
                >
                  12H
                </button>
                <button
                  className={`${
                    activeButton === "1D"
                    ? "bg-[rgba(233,238,251,0.67)] text-white"
                      : "bg-[rgba(233,238,251,0.24)] text-white"
                  } text-normal mb-2 me-2 rounded-lg px-2 py-1.5 text-center text-[12px] font-medium hover:bg-[#4a4878] focus:outline-none focus:ring-4 2xl:px-5 2xl:py-2.5 2xl:text-[15px]`}
                  onClick={() => handleButtonClick("1D")}
                >
                  1D
                </button>
                <button
                  className={`${
                    activeButton === "1W"
                      ? "bg-[rgba(233,238,251,0.67)] text-white"
                      : "bg-[rgba(233,238,251,0.24)] text-white"
                  } text-normal mb-2 me-2 rounded-lg px-2 py-1.5 text-center text-[12px] font-medium hover:bg-[#4a4878] focus:outline-none focus:ring-4 2xl:px-5 2xl:py-2.5 2xl:text-[15px]`}
                  onClick={() => handleButtonClick("1W")}
                >
                  1W
                </button>
                <button
                  className={`${
                    activeButton === "1M"
                      ? "bg-[rgba(233,238,251,0.67)] text-white"
                      : "bg-[rgba(233,238,251,0.24)] text-white"
                  } text-normal mb-2 me-2 rounded-lg px-2 py-1.5 text-center text-[12px] font-medium hover:bg-[#4a4878] focus:outline-none focus:ring-4 2xl:px-5 2xl:py-2.5 2xl:text-[15px]`}
                  onClick={() => handleButtonClick("1M")}
                >
                  1M
                </button>
                <button
                  className={`${
                    activeButton === "6M"
                       ? "bg-[rgba(233,238,251,0.67)] text-white"
                      : "bg-[rgba(233,238,251,0.24)] text-white"
                  } text-normal mb-2 me-2 rounded-lg px-2 py-1.5 text-center text-[12px] font-medium hover:bg-[#4a4878] focus:outline-none focus:ring-4 2xl:px-5 2xl:py-2.5 2xl:text-[15px]`}
                  onClick={() => handleButtonClick("6M")}
                >
                  6M
                </button>
                <button
                  className="mb-2 me-2 flex items-center rounded-lg bg-[rgba(233,238,251,0.24)] px-2 py-1.5 text-[12px] text-white hover:bg-[#4a4878] focus:outline-none focus:ring-2 2xl:px-5 2xl:py-2.5 2xl:text-[15px]"
                  onClick={() => {
                    if (chartRef.current) {
                      chartRef.current.resetZoom();
                    }
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="mr-1 size-4"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  Reset Zoom
                </button>
              </div>

              <div className="flex items-center justify-evenly md:w-[10%]" />
            </div>
            <div className="2xl:[85%] h-[420px] md:h-[85%]">
              <div className="relative h-full w-full text-[12px] font-normal xl:text-[8px] 2xl:text-[14px]">
                <Chartline
                  chartData={userData}
                  width={"100%"}
                  options={options}
                  ref={chartRef}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-blur mt-2 space-y-2 rounded-2xl bg-gradient-to-br from-white/20 via-white/5 to-white/20 p-2 text-white md:h-[80%] md:w-[96%] xl:h-[98%] xl:w-[25%] 2xl:h-[96%] 2xl:w-[25%]">
          <div className="scrollbar-custom overflow-x-scroll rounded-lg border border-white bg-[#e9eefb]/10 md:h-[88%]">
            <CollectorBarTable data={tableData} />
          </div>

          <div className="flex h-[60px] items-center justify-evenly rounded-lg border border-white bg-[#e9eefb]/10 md:mt-0 md:h-[6%] xl:h-[8%]">
            <div className="font-normalfont-semibold font-['Poppins'] text-[12px] text-white 2xl:text-[15px]">
              Last Update
            </div>
            <div className="font-normalm font-['Poppins'] text-[12px] text-white 2xl:text-[15px]">
              {tableData.createdAt.length > 0
                ? new Date(
                    Math.max(
                      ...tableData.createdAt.map((date) => new Date(date)),
                    ),
                  )
                    .toLocaleString("en-US", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: true,
                    })
                    .replace(/(\d+)\/(\d+)\/(\d+), (.*)/, "$2/$1/$3, $4")
                : "No data available"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorBar;
