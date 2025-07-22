import React, { useState } from "react";
import API from "../Axios/AxiosInterceptor";
import "./CSS/AnalyticsDateRange.css";

const RangeDate = ({ selectedBusBar, setFetchedData }) => {
  console.log("selectedBusBar", selectedBusBar);
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
    console.log("Fetching data...");
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
    } else {
      console.log("Start Date:", startDate, "End Date:", endDate);
      const apidate = async () => {
        try {
          const response = await API.get(
            `${process.env.REACT_APP_SERVER_URL}api/v2/getReportDateData?sensorrange=all-data&sides=${selectedBusBar}&startDate=${startDate}&endDate=${endDate}`
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
    // <div className="md:h-[100%] h-[280px]">
    //   <div className="md:h-[11%] flex justify-center text-xl font-semibold mt-2">
    //     Select Date
    //   </div>
    //   <div className="flex flex-col gap-4 mt-10 md:mt-0 items-center justify-center w-full md:gap-4 md:h-[58.4%] space-y-2 ">
    //     <div className="flex items-center space-x-2 ">
    //       <label
    //         htmlFor="startdate"
    //         className="text-sm font-medium text-white whitespace-nowrap"
    //       >
    //         From
    //       </label>
    //       <input
    //         type="date"
    //         id="startdate"
    //         name="startdate"
    //         value={startDate}
    //         onChange={handleDateChange}
    //         className="w-full text-sm h-11 text-white bg-[rgba(0,0,0,0.6)]  border border-gray-200 rounded-md shadow-sm p-1 custom-datepicker"
    //       />
    //     </div>

    //     <div className="flex items-center space-x-2">
    //       <label
    //         htmlFor="enddate"
    //         className="text-sm font-medium text-white whitespace-nowrap"
    //       >
    //         To
    //       </label>
    //       <input
    //         type="date"
    //         id="enddate"
    //         name="enddate"
    //         value={endDate}
    //         onChange={handleDateChange}
    //         className="w-full text-sm h-11 text-white bg-[rgba(0,0,0,0.6)]  border border-gray-200 rounded-md shadow-sm p-1 custom-datepicker"
    //       />
    //     </div>
    //   </div>
    //   <div
    //     className="bg-[rgba(16,16,16,1)] border-2 border-white h-[60px] w-[100px] md:w-[64.5%] md:h-[20%]  rounded-lg flex items-center justify-center mt-10 mb-2 md:mt-[0.5px] md:mb-0 mx-auto"
    //     onClick={fetchdatagraph}
    //   >
    //     <button className="flex items-center justify-center">Plot Graph</button>
    //   </div>
    // </div>

    <div className="border xl:w-[25%] w-[100%] h-[300px] xl:h-[100%] flex flex-col gap-2 rounded-xl  bg-gradient-to-br from-white/20 via-white/5 to-white/20 backdrop-blur-[5px]">
      <div className="h-[15%] text-center text-[12px] xl:text-[10px] 2xl:text-[15px] font-normal flex items-center justify-center">Select Date</div>
      <div className="h-[65%] flex flex-col items-center justify-center gap-10 xl:gap-4">
        <div className="flex items-center  space-x-2">
          <label
            htmlFor="startdate"
            className="text-[12px] xl:text-[10px] 2xl:text-[15px] font-normal  text-white whitespace-nowrap"
          >
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
            }}
          />
        </div>
        <div className="flex items-center space-x-2">
          <label
            htmlFor="startdate"
            className="text-[12px] xl:text-[10px] 2xl:text-[15px] font-normal text-white whitespace-nowrap"
          >
            &nbsp; &nbsp; &nbsp;To
          </label>
          <input
            type="date"
            id="enddate"
            name="enddate"
            value={endDate}
            onChange={handleDateChange}
            className=" text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal  text-white  border border-gray-200 rounded-md shadow-sm p-1" style={{
              colorScheme: 'dark',
              backgroundColor: 'rgba(233, 238, 251, 0.25)',
            }}
          />
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

export default RangeDate;
