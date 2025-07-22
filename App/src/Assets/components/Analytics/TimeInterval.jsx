import React, { useState } from "react";
import "./CSS/AnalyticsDateRange.css";
import API from "../Axios/AxiosInterceptor";

const TimeInterval = ({ selectedBusBar, setFetchedData }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [average, setAverage] = useState(null);

  const handleRadioChange = (event) => {
    setAverage(event.target.value);
    // console.log("selected radio", event.target.value);
  };

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
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
    } else if (!average) {
      alert("Please select the average period!!!");
    } else {
      const busBarVariable = `sensormodel${selectedBusBar}`;
      const apidate = async () => {
        try {
          const response = await API.get(
            `${process.env.REACT_APP_SERVER_URL}api/v2/getReportPerData?sensorrange=all-data&sides=${selectedBusBar}&startDate=${startDate}&endDate=${endDate}&averageBy=${average}`
          );
          const data = response.data;
          setFetchedData(data);
          console.log(data);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };
      apidate();
    }
  };
  
  return (
    // <div className="md:h-[100%] h-[380px]">
    //   <div className="md:h-[11%] flex justify-center text-xl font-semibold mt-2">
    //     Select Time Interval
    //   </div>

    //   {/* <div className="flex md:flex-row flex-col gap-4 mt-2 md:mt-0 items-center justify-center w-full md:gap-2 md:h-[25%] md:space-x-10"> */}
    //   <div className="flex md:flex-row flex-col gap-4 mt-2 md:mt-0 items-center justify-center w-full lg:gap-2 md:h-[25%] lg:space-x-10 ">

    //     <div className="flex items-center space-x-2">
    //       <label
    //         htmlFor="startdate"
    //         className="text-sm font-medium text-white whitespace-nowrap md:hidden lg:flex"          >
    //         From
    //       </label>
    //       <input
    //         type="date"
    //         id="startdate"
    //         name="startdate"
    //         value={startDate}
    //         onChange={handleDateChange}
    //         className="w-full text-sm text-white bg-[rgba(0,0,0,0.6)]  border border-gray-200 rounded-md shadow-sm p-1 custom-datepicker"
    //       />
    //     </div>

    //     <div className="flex items-center space-x-2">
    //       <label
    //         htmlFor="enddate"
    //         className="text-sm font-medium text-white whitespace-nowrap md:hidden lg:flex"          >
    //         To
    //       </label>
    //       <input
    //         type="date"
    //         id="enddate"
    //         name="enddate"
    //         value={endDate}
    //         onChange={handleDateChange}
    //         className="w-full text-sm text-white bg-[rgba(0,0,0,0.6)]  border border-gray-200 rounded-md shadow-sm p-1 custom-datepicker"
    //       />
    //     </div>
    //   </div>

    //   <div className="flex-1 text-lg font-semibold md:h-[10%] mt-2">
    //    Get one data for every
    //   </div>

    //   <div className="flex flex-col md:flex-row items-center justify-center md:space-x-14 md:h[20%] mt-6">
    //     {/* <div className="flex items-center mb-4">
    //       <input
    //         id="radio-1"
    //         type="radio"
    //         value="Minute"
    //         name="radio-group"
    //         checked={average === "Minute"}
    //         onChange={handleRadioChange}
    //         className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
    //       />
    //       <label
    //         htmlFor="radio-1"
    //         className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
    //       >
    //         Minute
    //       </label>
    //     </div> */}

    //     <div className="flex items-center mb-4">
    //       <input
    //         id="radio-2"
    //         type="radio"
    //         value="Hour"
    //         name="radio-group"
    //         checked={average === "Hour"}
    //         onChange={handleRadioChange}
    //         className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
    //       />
    //       <label
    //         htmlFor="radio-2"
    //         className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
    //       >
    //         hour
    //       </label>
    //     </div>

    //     <div className="flex items-center mb-4">
    //       <input
    //         id="radio-3"
    //         type="radio"
    //         value="Day"
    //         name="radio-group"
    //         checked={average === "Day"}
    //         onChange={handleRadioChange}
    //         className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
    //       />
    //       <label
    //         htmlFor="radio-3"
    //         className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
    //       >
    //         Day
    //       </label>
    //     </div>
    //   </div>

    //   <div className="bg-[rgba(16,16,16,1)] border-2 border-white md:h-[20%] h-[15%] w-[55.5%] md:w-[30%] rounded-lg flex items-center justify-center md:mb-0 mx-auto" onClick={fetchdatagraph}>
    //     <button className="flex justify-center items-center">Plot Graph</button>
    //   </div>
    // </div>

    <div className="border xl:w-[25%] w-[100%] h-[35%] xl:h-[100%] flex flex-col gap-2 rounded-xl  bg-gradient-to-br from-white/20 via-white/5 to-white/20 backdrop-blur-[5px]">
    <div className="h-[15%] text-center text-[12px] xl:text-[10px] 2xl:text-[15px] font-normal flex items-center justify-center">Select Date</div>
    <div className="h-[65%] flex flex-col items-center justify-center gap-4">
      <div className="flex flex-col md:flex-row items-center justify-center gap-4">
        <div className="flex items-center space-x-2">
          <label
            htmlFor="startdate"
            className="text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal  text-white whitespace-nowrap md:hidden lg:flex"          >
            From
          </label>
          <input
            type="date"
            id="startdate"
            name="startdate"
            value={startDate}
            onChange={handleDateChange}
            className=" text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal   text-white  border border-gray-200 rounded-md shadow-sm p-1" style={{
              colorScheme: 'dark',
              backgroundColor: 'rgba(233, 238, 251, 0.25)',
            }}/>
        </div>

        <div className="flex items-center space-x-2">
          <label
            htmlFor="enddate"
            className="text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal text-white whitespace-nowrap md:hidden lg:flex"          >
            To
          </label>
          <input
            type="date"
            id="enddate"
            name="enddate"
            value={endDate}
            onChange={handleDateChange}
            className=" text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal   text-white  border border-gray-200 rounded-md shadow-sm p-1" style={{
              colorScheme: 'dark',
              backgroundColor: 'rgba(233, 238, 251, 0.25)',
            }}/>
        </div>
      </div>
      <div className="flex items-center space-x-2 text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal" >
        Get one data for every
      </div>
      <div className="flex flex-col md:flex-row items-center justify-center md:space-x-14 ">

        <div className="flex items-center ">
          <input
            id="radio-2"
            type="radio"
            value="Hour"
            name="radio-group"
            checked={average === "Hour"}
            onChange={handleRadioChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="radio-2"
            className="text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal text-gray-900 ms-2 dark:text-gray-300"
          >
            hour
          </label>
        </div>

        <div className="flex items-center ">
          <input
            id="radio-3"
            type="radio"
            value="Day"
            name="radio-group"
            checked={average === "Day"}
            onChange={handleRadioChange}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor="radio-3"
            className="text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal text-gray-900 ms-2 dark:text-gray-300"
          >
            Day
          </label>
        </div>
      </div>
    </div>
    <div className="flex items-center justify-center mb-4 h-[20%]">
      <button className=" h-[80%]  w-[35%] md:w-[25%]  md:h-[100%] xl:w-[30%] bg-[#e9eefb]/50 rounded-lg border-2 border-white text-[12px]   md:text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal" onClick={fetchdatagraph}>
        Plot Graph
      </button>
    </div>

  </div>
  );
};

export default TimeInterval;
