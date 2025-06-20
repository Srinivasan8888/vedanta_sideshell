import React, { useEffect, useState, useRef } from "react";
import Switcher10 from "../../Assets/components/Heatmap/Switcher10";
import Switcher9 from "../../Assets/components/Heatmap/Switcher9";
import HeatmapTable from "../../Assets/components/Heatmap/HeatmapTable";
import API from "../../Assets/components/Axios/AxiosInterceptor.jsx";

const Heatmap = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [switcherValue, setSwitcherValue] = useState("min");
  const [switcherValue10, setSwitcherValue10] = useState("ASide");
  const [ASideData, setASideData] = useState([]); // Store ASide data
  const [BSideData, setBSideData] = useState([]); // Store BSide data
  const [combinedData, setCombinedData] = useState([]);
  const [combinedTableData, setCombinedTableData] = useState([]);
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState(null); // Store error messages
  const socketRef = useRef(null); // Add this ref to track current socket
  const [heatmapData, setHeatmapData] = useState({
    minvalue: {},
    maxvalue: {},
    data: [],
    dates: []
  });

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    if (name === "startdate") {
      setStartDate(value);
      localStorage.setItem("startDate", value); // Store start date in local storage
    } else if (name === "enddate") {
      setEndDate(value);
      localStorage.setItem("endDate", value); // Store end date in local storage
    }
  };

  const handleSwitcherValueChange = (newValue) => {
    setSwitcherValue(newValue);
    // console.log("Switcher Value of value:", newValue);
  };

  // console.log("Combined Table Data:", ASideData);

  const handleSwitcherValueChange10 = (newValue) => {
    setSwitcherValue10(newValue);
    // console.log("Switcher Value10 of side:", newValue);
  };

 useEffect(() => {
    const storedStartDate = localStorage.getItem("startDate");
    const storedEndDate = localStorage.getItem("endDate");

    if (storedStartDate) {
      setStartDate(storedStartDate);
    }
    if (storedEndDate) {
      setEndDate(storedEndDate);
    }
  }, []);

  // Add this useEffect to handle API calls
  useEffect(() => {
    const fetchHeatmapData = async () => {
      try {
        const params = new URLSearchParams({
          startDate: startDate || '',
          endDate: endDate || '',
          side: switcherValue10,
          value: switcherValue
        });

        const response = await API.get(
          `${process.env.REACT_APP_SERVER_URL}api/v2/getHeatmap?${params}`
        );
        
        // Store all API data
        setHeatmapData(response.data);

        // Transform data for the grid
        const valueData = switcherValue === "min" 
          ? response.data.minvalue 
          : response.data.maxvalue;

        const gridData = Object.entries(valueData).map(([key, value]) => ({
          key,
          value
        }));

        setCombinedData(gridData);

      } catch (error) {
        console.error("Error fetching heatmap data:", error);
        setError("Failed to load heatmap data");
      }
    };

    if (startDate && endDate) {
      fetchHeatmapData();
    }
  }, [startDate, endDate, switcherValue, switcherValue10]); // <-- These dependencies trigger the effect

  return (

      <div className="m-4 flex flex-col rounded-lg border border-white bg-[rgba(16,16,16,0.75)] text-white md:h-[95%]">
        <div className="grid-row md:grid-col grid h-[1100px] rounded-tl-lg rounded-tr-lg md:h-[40%] md:w-full">
          
          <div className="h-[10px] md:h-[100%]">
            <div className="flex h-[480px] flex-col px-10 py-4 md:h-full md:justify-between">
              <p className="mb-2 flex justify-start text-2xl font-semibold md:h-[40%] xl:h-[20%] xl:mb-0">
                Collector Bar
              </p>
              <div className="flex h-[100%] w-[100%] flex-col md:flex-row mt-2 xl:flex-row">
                <div className="flex w-[100%] flex-col items-center justify-evenly md:w-[40%] md:flex-col custom-md-air:flex-col xl:w-[30%] xl:flex-row">
                <p>
                    <Switcher10 onValueChange10={handleSwitcherValueChange10} />
                  </p>
                  <p className="flex mt-3 text-xl font-semibold">Select Date</p>
                </div>

                <div className="flex w-[100%] flex-col md:h-[100%] md:flex-col md:gap-4 md:space-x-4 xl:flex-row">
                  <div className="flex w-[100%] flex-col items-center justify-between md:h-[60%] md:w-[100%] md:flex-row xl:h-[100%] xl:w-[55%] xl:gap-10">
                    <p className="mt-3 text-lg">From</p>

                    <input
                      type="date"
                      id="startdate"
                      name="startdate"
                      value={startDate}
                      onChange={handleDateChange}
                      className="text-md custom-datepicker h-[100%] items-center rounded-md border border-gray-200 bg-[rgba(0,0,0,0.6)] p-1 text-white shadow-sm md:w-[40%] xl:h-[55%]"
                    />

                    <p className="mt-3 text-lg">To</p>

                    <input
                      type="date"
                      id="enddate"
                      name="enddate"
                      value={endDate}
                      onChange={handleDateChange}
                      className="text-md custom-datepicker h-[100%] items-center rounded-md border border-gray-200 bg-[rgba(0,0,0,0.6)] p-1 text-white shadow-sm md:w-[40%] xl:h-[55%]"
                    />
                  </div>

                  <div className="mt-4 flex w-[100%] flex-col items-center justify-evenly md:mt-0 md:h-[50%] md:flex-row md:gap-4 xl:h-[100%] xl:w-[50%]">
                  <p className="mt-3 text-lg">Current Date</p>
                    <div className="mb-5 flex h-10 flex-col items-center justify-center rounded-lg border border-white bg-[rgba(16,16,16,0.8)] md:mb-0 md:h-[85%] xl:h-[55%] md:w-[50%] xl:w-[40%] m-2">
                      {" "}
                      <p className="text-xl font-semibold p-4">
                        {new Date().toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <p>
                      <Switcher9 onValueChange={handleSwitcherValueChange} />
                    </p>
                  </div>
                </div>

                
              </div>
            </div>
          </div>

          <div className="h-[40px] md:h-[90%]">
            <div className="flex h-[330px] flex-col justify-between px-10 md:h-[100%]">
              <p className="mb-2 flex justify-start text-2xl font-semibold md:h-[40%]">
                {switcherValue === "max" ? "Extreme Max" : "Extreme Min"}
              </p>

              <div className="grid grid-cols-2 gap-4 px-4 md:h-[100%] md:grid-cols-4 md:grid-rows-2 xl:h-[75%] xl:grid-cols-8 xl:grid-rows-1">
                {combinedData.length > 0 ? (
                  combinedData.map((data, index) => {
                    const valueData = switcherValue === "min" 
                      ? heatmapData.minvalue?.[data.key] 
                      : heatmapData.maxvalue?.[data.key];

                    return (
                      <div
                        key={index}
                        className="flex h-full flex-col items-center justify-center rounded-lg border border-white bg-[rgba(16,16,16,0.8)]"
                      >
                        <p className={`text-sm font-semibold md:text-xl ${
                          switcherValue === "min" ? "text-blue-400" : "text-blue-400"
                        }`}>
                          {valueData ? valueData.toFixed(2) : "N/A"}
                        </p>
                        <p>
                          {switcherValue === "max" ? "Max of" : "Min of"}{" "}
                          <span className="text-sm text-white md:text-md">
                            {data.key || "Data"}
                          </span>
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <>
                    {[...Array(8)].map((_, index) => (
                      <div className="flex h-full flex-col items-center justify-center rounded-lg border border-white bg-[rgba(16,16,16,0.8)]">
                        <div
                          key={index}
                          className="flex h-full w-[40%] items-center justify-center rounded-lg m-3"
                        >
                          <div className="text-xl font-semibold text-[rgb(39,129,255)]">
                            No Data Available
                          </div>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="scrollbar-custom mx-8 flex overflow-x-auto overflow-y-auto rounded-bl-lg rounded-br-lg md:mt-4 h-[100%]">
          <HeatmapTable 
            data={heatmapData.data || []}
            dates={heatmapData.dates || []}
          />
        </div>
      </div>
 
  );
};

export default Heatmap;
