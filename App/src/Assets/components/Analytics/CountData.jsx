import React, { useState } from "react";
import API from "../Axios/AxiosInterceptor";
import "./CSS/AnalyticsDateRange.css";

const CountData = ({ selectedBusBar, setFetchedData }) => {
  const [selectedDrop, setSelecteddrop] = useState("");
  const [showTextBox, setShowTextBox] = useState(false);
  const [customLimit, setCustomLimit] = useState("");

  const handleradiocustom = (event) => {
    const value = event.target.value;
    setSelecteddrop(value);
    setShowTextBox(value === "custom");
    console.log("Selected value:", value);
  };

  const fetchdatagraph = () => {
    if (!selectedDrop) {
      alert("Please select a limit.");
      return;
    }
    try {
      let limit = selectedDrop === "custom" ? customLimit : selectedDrop;
      const busBarVariable = `sensormodel${selectedBusBar}`;
      const apidate = async () => {
        try {
          const response = await API.get(
            `${process.env.REACT_APP_SERVER_URL}api/v2/getLimitChart?key=${busBarVariable}&limit=${limit}`
          );
          const data = response.data;
          setFetchedData(data);
          // console.log(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      apidate();
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("An error occurred while fetching data. Please try again.");
    }
  };

  return (
    <div className="md:h-[100%] h-[280px]">
      <div className="md:h-[11%] flex justify-center text-xl font-semibold mt-2">
        Select Count
      </div>
      <div className="flex flex-col gap-4 mt-10 md:mt-0 items-center justify-center w-full md:gap-4 md:h-[58.4%] mb-[1.6px]">
        <div className="flex flex-row mt-4 space-x-2 md:flex-1 md:space-x-20">
          <div className="flex items-center ">
            <input
              id="radio-100"
              type="radio"
              value="100"
              name="radio-group"
              checked={selectedDrop === "100"}
              onChange={handleradiocustom}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="radio-1"
              className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
            >
              Last 100 Data
            </label>
          </div>
          <div className="flex items-center ">
            <input
              id="radio-500"
              type="radio"
              value="500"
              name="radio-group"
              checked={selectedDrop === "500"}
              onChange={handleradiocustom}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="radio-2"
              className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
            >
              Last 500 Data
            </label>
          </div>
        </div>
        <div className="flex flex-1 mb-4 space-x-2 md:space-x-20">
          <div className="flex items-center">
            <input
              id="radio-1000"
              type="radio"
              value="1000"
              name="radio-group"
              checked={selectedDrop === "1000"}
              onChange={handleradiocustom}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="radio-3"
              className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
            >
              Last 1000 Data
            </label>
          </div>
          <div className="flex items-center ">
            <input
              id="radio-custom"
              type="radio"
              value="custom"
              name="radio-group"
              checked={selectedDrop === "custom"}
              onChange={handleradiocustom}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="radio-4"
              className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
            >
              Custom Data
            </label>
          </div>
          {showTextBox && (
            <div className="flex flex-row items-center justify-center">
              <input
                type="number"
                placeholder="Enter custom data"
                className="p-2 text-black border rounded-md"
                onChange={(e) => setCustomLimit(e.target.value)}
              />
            </div>
          )}
        </div>
      </div>
      <div
        className="bg-[rgba(16,16,16,1)] border-2 border-white h-[60px] w-[100px] md:w-[37.5%] md:h-[21%] rounded-lg flex items-center justify-center mt-8 mb-1 md:mt-0 md:mb-0 mx-auto"
        onClick={fetchdatagraph}
      >
        <button className="flex items-center justify-center">Plot Graph</button>
      </div>
    </div>
  );
};

export default CountData;
