import React, { useState } from "react";
import Dropdown from "./Dropdown";
import * as XLSX from 'xlsx/xlsx.mjs';
import axios from "axios";

const TimeInterval = () => {
  const [selected, setSelected] = useState("");
  const [average, setAverage] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleRadioChange = (event) => {
    setSelected(event.target.value);
  };

  const averageradio = (event) => {
    setAverage(event.target.value);
    console.log("Selected Radio Value:", event.target.value); // Log the selected value
  };


  const handleDateChange = (event) => {
    const { name, value } = event.target;
    if (name === "startdate") {
      setStartDate(value);
      console.log("Start Date:", value);
    } else if (name === "enddate") {
      setEndDate(value);
      console.log("End Date:", value);
    }
  };
  
  const downloadexcel = () => {
   
    
    if (!startDate || !endDate) {
      alert("Please select both start and end dates.");
    } else if (!average) {
      alert("Please select the average.");
    } else if (!selected) {
      alert("Please select a configuration.");
    } else {
      const apidate = async () => {
        if (selected !== null) {
          try {
            const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}api/v2/getIntervalExcel?key=${selected}&startDate=${startDate}&endDate=${endDate}&average=${average}`);
            console.log(response);
              const data = response.data;
              console.log(data);
  
              if (data == null || data.length === 0 ) {
                alert("No data found.");
                return;
              }
  

              if (Array.isArray(data)) {
                const modifiedData = data.map((obj) => {
                  const { _id, __v, updatedAt, ...rest } = obj;
                  return rest;
                });
  
                const wb = XLSX.utils.book_new();
                const ws = XLSX.utils.json_to_sheet(modifiedData);
                XLSX.utils.book_append_sheet(wb, ws, "Data");
              const currentTime = new Date().toLocaleString().replace(/:/g, '-');
              XLSX.writeFile(wb, `${selected} Interval_report_${currentTime}.xlsx`);
              console.log("Data:", modifiedData);
            } else {
              console.error("Data received is not an array:", data);
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        }
      };

      apidate();
    }
  };
  return (
    <>
      <div className="xl:w-[50%] w-[100%] md:mb-0 ">
      <div className="md:h-[16%] flex flex-row justify-center items-end md:text-3xl md:font-semibold md:mt-0 mt-4">
      Select Time Interval
        </div>
        <div className="flex flex-col md:h-[40%] gap-10 justify-center mx-16">
          <div className="flex flex-col items-center justify-between mt-10 md:flex-row">
            <div className="items-start text-xl font-normal">Configuration</div>
            <Dropdown selected={selected} setSelected={setSelected}/>
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
          Get 1 data for every-
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
            onClick={ downloadexcel}>
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
              <span className="ml-2">Download Excel</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default TimeInterval;
