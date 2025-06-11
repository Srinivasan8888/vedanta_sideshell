import React, { useState } from "react";
import API from "../Axios/AxiosInterceptor";
import "./CSS/AnalyticsDateRange.css";

const RangeDate = ({ selectedBusBar, setFetchedData }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // useEffect(()=>{
  //   const busBarVariable = `BusBar${selectedBusBar}`;
  //   console.log("selectedBusBar", busBarVariable);
  // },[selectedBusBar]);

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    if (name === "startdate") {
      setStartDate(value);
      // console.log("Start Date:", value);
    } else if (name === "enddate") {
      setEndDate(value);
      // console.log("End Date:", value);
    }
  };

  const fetchdatagraph = () => {
    console.log("Fetching data..."); // Debug log
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
    } else {
      console.log("Start Date:", startDate, "End Date:", endDate); // Debug log
      const busBarVariable = `sensormodel${selectedBusBar}`;
      const apidate = async () => {
        try {
          const response = await API.get(
            `${process.env.REACT_APP_SERVER_URL}api/v2/getDateChart?key=${busBarVariable}&startDate=${startDate}&endDate=${endDate}`
          );
          const data = response.data;
          setFetchedData(data);
          console.log(data); // Debug log
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      apidate();
    }
  };

  return (
    <div className="md:h-[100%] h-[280px]">
      <div className="md:h-[11%] flex justify-center text-xl font-semibold mt-2">
        Select Date
      </div>
      <div className="flex flex-col gap-4 mt-10 md:mt-0 items-center justify-center w-full md:gap-4 md:h-[58.4%] space-y-2 ">
        <div className="flex items-center space-x-2 ">
          <label
            htmlFor="startdate"
            className="text-sm font-medium text-white whitespace-nowrap"
          >
            From
          </label>
          <input
            type="date"
            id="startdate"
            name="startdate"
            value={startDate}
            onChange={handleDateChange}
            className="w-full text-sm h-11 text-white bg-[rgba(0,0,0,0.6)]  border border-gray-200 rounded-md shadow-sm p-1 custom-datepicker"
          />
        </div>

        <div className="flex items-center space-x-2">
          <label
            htmlFor="enddate"
            className="text-sm font-medium text-white whitespace-nowrap"
          >
            To
          </label>
          <input
            type="date"
            id="enddate"
            name="enddate"
            value={endDate}
            onChange={handleDateChange}
            className="w-full text-sm h-11 text-white bg-[rgba(0,0,0,0.6)]  border border-gray-200 rounded-md shadow-sm p-1 custom-datepicker"
          />
        </div>
      </div>
      <div
        className="bg-[rgba(16,16,16,1)] border-2 border-white h-[60px] w-[100px] md:w-[64.5%] md:h-[20%]  rounded-lg flex items-center justify-center mt-10 mb-2 md:mt-[0.5px] md:mb-0 mx-auto"
        onClick={fetchdatagraph}
      >
        <button className="flex items-center justify-center">Plot Graph</button>
      </div>
    </div>
  );
};

export default RangeDate;
