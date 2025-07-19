import React, { useState, useEffect } from "react";
import axios from "axios";
import Dropdown from "./Dropdown";
import * as XLSX from 'xlsx/xlsx.mjs';
import API from "../Axios/AxiosInterceptor";
import DropdownSides from "./Dropdown-sides";

const AverageDateRange = () => {
  const [selected, setSelected] = useState("");
  const [average, setAverage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedside, setSelectedside] = useState("");
  // const apiUrl = process.env.REACT_APP_SERVER_URL;

  const handleRadioChange = (event) => {
    setSelected(event.target.value);
  };

  const handleRadioChangeSide = (event) => {
    setSelectedside(event.target.value);
  };

  const averageradio = (event) => {
    setAverage(event.target.value);
    // console.log("Selected Radio Value:", event.target.value); // Log the selected value
  };



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

  const downloadexcel = () => {
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
    } else if (!average) {
      alert("Please select the average.");
    } else if (!selected) {
      alert("Please select a configuration.");
    } else if (!selectedside) {
      alert("Please select a side.");
    } else {
      const apidate = async () => {
        try {
          // Build query parameters
          const params = new URLSearchParams({
            sensorrange: selected,
            sides: selectedside,
            startDate: startDate,
            endDate: endDate,
            averageBy: average
          });

          const response = await API.get(
            `${process.env.REACT_APP_SERVER_URL}api/v2/getReportAverageData?${params.toString()}`
          );

          console.log('API Response:', response);
          const responseData = response.data?.data || [];
          console.log('Response Data:', responseData);

          if (!responseData || responseData.length === 0) {
            alert("No data found for the selected criteria.");
            return;
          }

          // Format data for Excel
          const excelData = responseData.map(({ timestamp, count, ...rest }) => ({
            timestamp: new Date(timestamp).toLocaleString(),
            ...Object.keys(rest).reduce((acc, key) => {
              // Only include sensor data fields (like sensor1, sensor2, etc.)
              if (key !== 'metadata' && key !== 'count') {
                acc[key] = rest[key];
              }
              return acc;
            }, {})
          }));

          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(excelData);
          XLSX.utils.book_append_sheet(wb, ws, "Data");

          const currentTime = new Date().toLocaleString().replace(/:/g, '-');
          XLSX.writeFile(wb, `${selected}_${selectedside}_${average}_report_${currentTime}.xlsx`);
          console.log("Data exported to Excel:", excelData);
        } catch (error) {
          console.error("Error fetching or processing data:", error);
          alert("An error occurred while processing your request. Please try again.");
        }
      };

      apidate();
    }
  };



  return (
    <>

      {/* <div className=" md:h-full  md:p-4 xl:p-0 xl:w-[50%] w-[100%] md:mb-0 ">
      <div className="md:h-[16%] flex flex-row justify-center items-end md:text-3xl md:font-semibold md:mt-0 mt-4">         
        Select Date Range
        </div>
        <div className="flex flex-col md:h-[40%] gap-10 justify-center mx-16">
          
       

          <div className="flex flex-col items-center justify-between mt-10 md:flex-row">
            <div className="items-start text-xl font-normal">Configuration</div>
            <Dropdown selected={selected} setSelected={setSelected}/>
      
          </div>

          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="items-start text-xl font-normal">Select Sides</div>
            <DropdownSides selectedside={selectedside} setSelectedside={setSelectedside}/>
      
          </div>


          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="text-xl font-normal text-start">From</div>
            <div>
              <input
                type="date"
                id="startdate"
                name="startdate"
                onChange={handleDateChange}
                value={startDate}
                className="w-64 h-9 text-sm text-black bg-[rgb(232, 235, 236)] border border-gray-200 rounded-md p-1 custom-datepicker backdrop-blur-[8px] md:mt-0 mt-4 shadow-[inset_4px_4px_4px_0_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="text-xl font-normal text-start">To</div>
            <div>
              <input
                type="date"
                id="enddate"
                name="enddate"
                onChange={handleDateChange}
                value={endDate}
                className="w-64 h-9 text-sm text-black bg-[rgb(232, 235, 236)] border border-gray-200 rounded-md p-1 custom-datepicker backdrop-blur-[8px] md:mt-0 mt-4 shadow-[inset_4px_4px_4px_0_rgba(0,0,0,0.25)]"
              />
            </div>
          </div>
        </div>
        <div className="flex md:h-[10%] text-lg font-bold justify-center item-center pt-10">
          Average By:
        </div>
        <div className="flex md:h-[10%] space-x-20 items-center justify-center xl:mt-0 mt-4">
          <div className="flex items-center mb-4">
            <input
              id="radio-2"
              type="radio"
              value="Hour"
              name="radio-group"
              checked={average === "Hour"}
              onChange={averageradio}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="radio-2"
              className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
            >
              Hour
            </label>
          </div>
          <div className="flex items-center mb-4">
            <input
              id="radio-3"
              type="radio"
              value="Day"
              name="radio-group"
              checked={average === "Day"}
              onChange={averageradio}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="radio-3"
              className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
            >
              Day
            </label>
          </div>
        </div>
        <div className="flex md:h-[15%] text-lg font-bold justify-center item-center md:pt-8 mb-4 md:mb-0">
          <div className="flex items-center justify-center w-56 h-16 bg-[rgba(232,235,236,1)] rounded-lg text-black">
            <button className="flex items-center" 
            onClick={ downloadexcel}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
                />
              </svg>
              <span className="ml-2" >Download Excel</span>
            </button>
          </div>
        </div>
      </div> */}

      <div className="md:h-[10%] flex flex-row justify-center items-center text-[14px] font-semibold 2xl:font-bold font-['Poppins'] md:mt-0 mt-4">
        Select Time Interval
      </div>
      <div className="md:h-[70%]  md:grid grid-cols-1 grid-rows-5 gap-4 2xl:gap-0  justify-center w-[80%]  2xl:w-[60%] ">

        <div className="flex flex-col items-center justify-between  md:flex-row">
          <div className="items-start text-[14px] font-normal">Configuration</div>
          <Dropdown
            selected={selected} setSelected={setSelected}
          />
        </div>

        <div className="flex flex-col items-center justify-between  md:flex-row">
          <div className="items-start text-[14px] font-normal">Select Sides</div>
          <DropdownSides selectedside={selectedside} setSelectedside={setSelectedside} />
        </div>


        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="text-[14px] font-normal text-start">From</div>
          <div>
            <input
              type="date"
              id="startdate"
              name="startdate"
              onChange={handleDateChange}
              value={startDate}
              className="w-64 h-9 text-sm text-white bg-[#e9eefb]/25 rounded-lg border border-gray-200 p-1 custom-datepicker backdrop-blur-[8px] md:mt-0 mt-4 shadow-[inset_4px_4px_4px_0_rgba(0,0,0,0.25)] bg-opacity-25"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="text-[14px] font-normal text-start">To</div>
          <div>
            <input
              type="date"
              id="enddate"
              name="enddate"
              onChange={handleDateChange}
              value={endDate}
              className="w-64 h-9 text-sm text-white bg-[rgb(232, 235, 236)] border border-gray-200 rounded-md p-1 custom-datepicker backdrop-blur-[8px] md:mt-0 mt-4 shadow-[inset_4px_4px_4px_0_rgba(0,0,0,0.25)]"
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between ">

          <div className="flex text-[14px] font-normal 2xl:font-bold justify-center item-center">
            Average By:
          </div>

          <div className="flex flex-col items-center justify-between md:flex-row gap-10">
            <div className="flex items-center mb-3 2xl:mb-10">
              <input
                id="radio-2"
                type="radio"
                value="Hour"
                name="radio-group"
                checked={average === "Hour"}
                onChange={averageradio}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="radio-2"
                className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
              >
                Hour
              </label>
            </div>
            <div className="flex items-center mb-3 2xl:mb-10">
              <input
                id="radio-3"
                type="radio"
                value="Day"
                name="radio-group"
                checked={average === "Day"}
                onChange={averageradio}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <label
                htmlFor="radio-3"
                className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
              >
                Day
              </label>
            </div>
          </div>
        </div>

      </div>

      <div className="flex md:h-[20%] text-[14px] font-semibold 2xl:font-bold justify-center item-center">
        <div className="flex items-center justify-center w-44 2xl:w-56 h-12 2xl:h-16 bg-[#e9eefb]/50 rounded-lg text-white mt-4 2xl:mt-0">
          <button className="flex items-center"
          onClick={downloadexcel}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
              />
            </svg>
            <span className="ml-2 ">Download Excel</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AverageDateRange;
