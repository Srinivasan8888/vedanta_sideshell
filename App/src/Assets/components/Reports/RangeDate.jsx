import React, { useState } from "react";
import Dropdown from "./Dropdown";
import * as XLSX from 'xlsx/xlsx.mjs';
import DropdownSides from "./Dropdown-sides";
import API from "../Axios/AxiosInterceptor";

const RangeDate = () => {
  const [selected, setSelected] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedside, setSelectedside] = useState("");

  const handleRadioChange = (event) => {
    setSelected(event.target.value);
  };

  const handleRadioChangeSide = (event) => {
    setSelectedside(event.target.value);
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
            });

            const response = await API.get(
              `${process.env.REACT_APP_SERVER_URL}api/v2/getReportDateData?${params.toString()}`
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
            
            const currentTime = new Date().toLocaleString().replace(/:/g, '-').replace(/,/g, '');
            XLSX.writeFile(wb, `${selected}_${selectedside}_report_${currentTime}.xlsx`);
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
      <div className="md:h-full xl:w-[50%] w-[100%]  md:p-4 xl:p-0">
        <div className="md:h-[16%] flex flex-row justify-center items-end md:text-3xl md:font-semibold md:mt-0 mt-4">
          Select Date
        </div>
        <div className="flex flex-col md:h-[60%] gap-10 justify-center mx-16">
          <div className="flex flex-col items-center justify-between mt-10 md:flex-row">
            <div className="items-start text-xl font-normal">Configuration</div>
            <Dropdown selected={selected} setSelected={setSelected} />
          </div>

          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="items-start text-xl font-normal">Select Sides</div>
            <DropdownSides selectedside={selectedside} setSelectedside={setSelectedside} />
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

        <div className="flex md:h-[25%] text-lg font-bold justify-center item-center pt-8 mb-4 md:mb-0">
          <div className="flex items-center justify-center w-56 h-16 bg-[rgba(232,235,236,1)] rounded-lg text-black">
            <button className="flex items-center" onClick={downloadexcel}>
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

export default RangeDate;
