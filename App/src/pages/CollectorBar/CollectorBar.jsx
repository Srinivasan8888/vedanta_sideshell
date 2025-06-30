import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  
  // Get URL parameters and update state
  useEffect(() => {
    const sensorId = searchParams.get('sensorId');
    const side = searchParams.get('side');
    
    console.log('URL Params - sensorId:', sensorId, 'side:', side);
    
    if (sensorId) {
      // Clean up sensor ID (remove any non-numeric characters and add 'sensor' prefix)
      const cleanSensorId = `sensor${sensorId.replace(/[^0-9]/g, '')}`;
      console.log('Setting sensor dropdown to:', cleanSensorId);
      setSelectedDropdown(cleanSensorId);
    }
    
    if (side) {
      console.log('Setting side to:', side);
      setSelectedside(side);
    }
  }, [searchParams]);
  const [userData, setUserData] = useState({
    labels: [],
    datasets: [
      {
        data: [],
        borderColor: "rgb(0, 119, 228)",
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) return null;

          const gradient = ctx.createLinearGradient(
            0,
            chartArea.bottom,
            0,
            chartArea.top,
          );
          gradient.addColorStop(0, "rgba(0, 119, 228, 0.1)");
          gradient.addColorStop(0.5, "rgba(0, 119, 228, 0.3)");
          gradient.addColorStop(1, "rgba(0, 119, 228, 0.8)");

          return gradient;
        },
        tension: 0,
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
              time: activeButton
            }
          }
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
      createdAt: data.createdAt[index]
    }));

    // Transform the data for the chart
    const labels = tableData.map(item =>
      new Date(item.createdAt).toLocaleTimeString()
    );
    const temperatures = tableData.map(item => parseFloat(item[sensorId]));

    setUserData(prevData => ({
      ...prevData,
      labels: labels,
      datasets: [{
        ...prevData.datasets[0],
        data: temperatures,
      }]
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
          afterLabel: function (context) {
            return "Hover for details!";
          },
        },
        displayColors: false,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          size: 14,
          weight: "bold",
          color: "#fff",
        },
        bodyFont: {
          size: 12,
          color: "#fff",
        },
        padding: 10,
        borderWidth: 1,
        borderColor: "#00c8ff",
      },
    },
    scales: {
      y: {
        position: "right",
        title: {
          display: true,
          text: "Temperature (°C)",
          color: "white",
        },
        ticks: {
          color: "white",
          callback: function (value) {
            return value + " °C";
          },
        },
      },
      x: {
        title: {
          display: true,
          text: "Timestamp",
          color: "white",
        },
        ticks: {
          color: "white",
        },
      },
    },
  };

  // State for table data
  const [tableData, setTableData] = useState({
    createdAt: [],
    sensor1: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get the current sensor ID from the dropdown
        const sensorId = dropdown || 'sensor1';
        // Get the current side (default to 'Aside' if not selected)
        const side = selectedside || 'Aside';
        // Get the current interval (default to '30Min' if not selected)
        const interval = activeButton || '30Min';

        const response = await API.get(
          `${process.env.REACT_APP_SERVER_URL}api/v2/getCollectorbar`,
          {
            params: {
              sensorId,
              sides: side,
              interval
            }
          }
        );

        // Process the response data
        if (response.data && response.data.data) {
          const labels = response.data.data.map(item => 
            new Date(item.timestamp).toLocaleTimeString()
          );
          const data = response.data.data.map(item => item.value);
          
          setUserData(prevData => ({
            ...prevData,
            labels,
            datasets: [
              {
                ...prevData.datasets[0],
                data,
                label: `${sensorId} (${side})`
              }
            ]
          }));

          // Prepare data for the table
          const timestamps = response.data.data.map(item => item.timestamp);
          const sensorValues = response.data.data.map(item => item.value);
          
          setTableData({
            createdAt: timestamps,
            [sensorId]: sensorValues,
            minValue: Math.min(...sensorValues.filter(val => val !== null)),
            maxValue: Math.max(...sensorValues.filter(val => val !== null)),
            averageValue: sensorValues.reduce((a, b) => a + b, 0) / sensorValues.length
          });

          // Update min, max, avg values if needed
          if (data.length > 0) {
            const values = data.filter(val => val !== null);
            if (values.length > 0) {
              setMinValue(Math.min(...values).toFixed(2));
              setMaxValue(Math.max(...values).toFixed(2));
              setAvgValue((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
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
    <div className="m-4 flex h-[1400px] flex-col rounded-lg border border-white bg-[rgba(16,16,16,0.5)] md:h-[95%]">
      <div className="flex flex-col bg-black rounded-tl-lg rounded-tr-lg md:h-16 md:w-full md:flex-row gap-x-2 pt-2">
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
        <Dropdown selected={dropdown} setSelected={setSelectedDropdown} />
        <DropdownSides selectedside={selectedside} setSelectedside={setSelectedside} />
      </div>

      <div className="flex flex-col md:h-full xl:flex-row">
        <div className="p-4 md:h-[50%] md:w-[100%] xl:h-[100%] xl:w-[80%]">
          <div className="flex flex-col justify-between rounded-lg bg-[#101010]/80 shadow-[0px_8px_21.5px_0px_rgba(0,0,0,0.33)] md:h-[10%] md:w-[100%] md:flex-row">
            <div className="flex items-center mx-auto">
              <div className="mr-10 flex justify-between font-['Inter'] font-semibold text-white md:text-[12px] xl:text-[26px]">
                Max Value
              </div>
              <div className="ml-4 font-['Inter'] font-bold text-[#0084fe] md:text-sm xl:text-3xl">
                {maxValue}°C
              </div>
            </div>

            <div className="flex items-center mx-auto">
              <div className="mr-10 flex justify-between font-['Inter'] font-medium text-white md:text-[12px] xl:text-[26px]">
                Min Value
              </div>
              <div className="ml-4 font-['Inter'] font-bold text-[#0084fe] md:text-sm xl:text-3xl">
                {minValue}°C
              </div>
            </div>

            <div className="flex items-center mx-auto">
              <div className="mr-10 flex justify-between font-['Inter'] font-medium text-white md:text-[12px] xl:text-[26px]">
                Avg Value
              </div>
              <div className="ml-4 font-['Inter'] font-bold text-[#0084fe] md:text-sm xl:text-3xl">
                {tableData.averageValue ? tableData.averageValue.toFixed(2) : '0.00'}°C
              </div>
            </div>
          </div>

          <div className="backdrop-blur-blur mt-4 h-[600px] rounded-2xl bg-[#101010]/80 md:h-[80%] xl:h-[88%] xl:w-[100%] 2xl:h-[88%]">
            <div className="flex flex-col md:h-[10%] md:w-full md:flex-row">
              <div className="flex items-center justify-around text-white md:w-[10%]">
                <div className="font-['Inter'] text-xl font-bold text-white">
                  TI
                </div>
              </div>

              {/* timeseries button */}
              <div className="flex flex-wrap items-center justify-around md:w-[50%] md:flex-row">
                <button
                  className={`text-blue-700 ${activeButton === "30Min" ? "bg-blue-700 text-white" : ""
                    } mb-2 me-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
                  onClick={() => handleButtonClick("30Min")}
                >
                  30Min
                </button>
                <button
                  className={`text-blue-700 ${activeButton === "1H" ? "bg-blue-700 text-white" : ""
                    } mb-2 me-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
                  onClick={() => handleButtonClick("1H")}
                >
                  1H
                </button>
                <button
                  className={`text-blue-700 ${activeButton === "12H" ? "bg-blue-700 text-white" : ""
                    } mb-2 me-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
                  onClick={() => handleButtonClick("12H")}
                >
                  12H
                </button>
                <button
                  className={`text-blue-700 ${activeButton === "1D" ? "bg-blue-700 text-white" : ""
                    } mb-2 me-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
                  onClick={() => handleButtonClick("1D")}
                >
                  1D
                </button>
                <button
                  className={`text-blue-700 ${activeButton === "1W" ? "bg-blue-700 text-white" : ""
                    } mb-2 me-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
                  onClick={() => handleButtonClick("1W")}
                >
                  1W
                </button>
                <button
                  className={`text-blue-700 ${activeButton === "1M" ? "bg-blue-700 text-white" : ""
                    } mb-2 me-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
                  onClick={() => handleButtonClick("1M")}
                >
                  1M
                </button>
                <button
                  className={`text-blue-700 ${activeButton === "6M" ? "bg-blue-700 text-white" : ""
                    } mb-2 me-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
                  onClick={() => handleButtonClick("6M")}
                >
                  6M
                </button>
              </div>

              <div className="flex items-center justify-evenly md:w-[10%]" />
              {/* chart series button yet to be defined */}
              {/* <div className="flex items-center justify-evenly md:w-[30%]">
                <button
                  disabled
                  className={`text-blue-700 ${selectedButton === "I" ? "bg-blue-700 text-white" : ""
                    } mb-2 me-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
                  onClick={() => handleButtonSelect("I")}
                >
                  I
                </button>
                <button
                  disabled
                  className={`text-blue-700 ${selectedButton === "II" ? "bg-blue-700 text-white" : ""
                    } mb-2 me-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
                  onClick={() => handleButtonSelect("II")}
                >
                  II
                </button>
                <button
                  disabled
                  className={`text-blue-700 ${selectedButton === "III" ? "bg-blue-700 text-white" : ""
                    } mb-2 me-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
                  onClick={() => handleButtonSelect("III")}
                >
                  III
                </button>
                <button
                  disabled
                  className={`text-blue-700 ${selectedButton === "IV" ? "bg-blue-700 text-white" : ""
                    } mb-2 me-2 rounded-lg border border-blue-700 px-5 py-2.5 text-center text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800`}
                  onClick={() => handleButtonSelect("IV")}
                >
                  IV
                </button>
              </div> */}
            </div>
            <div className="h-[420px] md:h-[85%]">
              <div className="w-full h-full">
                <Chartline
                  chartData={userData}
                  width={"100%"}
                  options={options}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="backdrop-blur-blur m-4 rounded-2xl bg-[#101010]/75 p-4 text-white md:w-[96%] md:h-[50%] xl:h-[96%] xl:w-[25%]">
          {/* <div className="mb-8 flex h-[60px] items-center justify-evenly rounded-lg border border-white bg-[#101010]/90 md:mb-0 md:h-[8%]">
            <div className="font-['Poppins'] text-lg font-semibold text-white">
              Unit Preference
            </div>
            <div className="my-8 flex items-center justify-evenly rounded-lg bg-[#101010]/90 md:h-[76%] md:w-[40%]">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="radio1"
                  name="unit"
                  value="C"
                  checked={unitPreference === "C"}
                  onChange={() => setUnitPreference("C")}
                />
                <div className="w-[29px] font-['Inter'] text-sm font-medium text-white">
                  (°C)
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="radio2"
                  name="unit"
                  value="F"
                  checked={unitPreference === "F"}
                  onChange={() => setUnitPreference("F")}
                />
                <div className="w-[29px] text-white text-sm font-medium font-['Inter']">
                  (°F)
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="radio3"
                  name="unit"
                  value="K"
                  checked={unitPreference === "K"}
                  onChange={() => setUnitPreference("K")}
                />
                <div className="w-[29px] text-white text-sm font-medium font-['Inter']">
                  (K)
                </div>
              </div>
            </div>
          </div> */}

          <div className="2xl:my- scrollbar-custom overflow-x-scroll rounded-lg border border-white bg-[#101010]/90 md:my-4 xl:my-8 md:h-[82%]">
            <CollectorBarTable data={tableData} />
          </div>

          <div className="mt-8 flex h-[60px] items-center justify-evenly rounded-lg border border-white bg-[#101010]/90 md:mt-0 md:h-[8%] ">
            <div className="font-['Poppins'] text-lg font-semibold text-white">
              Last Update
            </div>
            <div className="font-['Poppins'] text-[15px] font-medium text-white">
              {tableData.createdAt.length > 0 
                ? new Date(Math.max(...tableData.createdAt.map(date => new Date(date))))
                    .toLocaleString('en-US', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })
                    .replace(/(\d+)\/(\d+)\/(\d+), (.*)/, '$2/$1/$3, $4')
                : 'No data available'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectorBar;
