import React, { useState } from "react";
import * as XLSX from 'xlsx/xlsx.mjs';
import API from "../Axios/AxiosInterceptor";
import Dropdown from "./Dropdown";
import DropdownSides from "./Dropdown-sides";

const CountData = () => {
  const [selectedDrop, setSelecteddrop] = useState("");
  const [showTextBox, setShowTextBox] = useState(false);
  const [customLimit, setCustomLimit] = useState("");
  const [selectedside, setSelectedside] = useState("");
  const [selected, setSelected] = useState("");

  const handleRadioChange = (event) => {
    setSelected(event.target.value);
  };
  const handleRadioChangeSide = (event) => {
    setSelectedside(event.target.value);
  };

  const handleradiocustom = (event) => {
    const value = event.target.value;
    setSelecteddrop(value);
    setShowTextBox(value === "custom");
    console.log("Selected value:", value);
  };

  const downloadexcel = async () => {
    if (!selectedDrop) {
      alert("Please select a record count.");
      return;
    }

    if (!selected) {
      alert("Please select a configuration.");
      return;
    }

    if (!selectedside) {
      alert("Please select a side.");
      return;
    }

    try {
      const count = selectedDrop === "custom" ? customLimit : selectedDrop;
      
      // Build query parameters
      const params = new URLSearchParams({
        sensorrange: selected,
        sides: selectedside,
        count: count
      });

      console.log('Fetching data with params:', params.toString());
      
      const response = await API.get(
        `${process.env.REACT_APP_SERVER_URL}api/v2/getReportCountData?${params.toString()}`
      );
      
      console.log('API Response:', response);
      const responseData = response.data?.data || [];
      
      if (!responseData || responseData.length === 0) {
        alert("No data found for the selected criteria.");
        return;
      }

      // Format data for Excel
      const excelData = responseData.map(({ timestamp, ...rest }) => ({
        timestamp: timestamp ? new Date(timestamp).toLocaleString() : 'N/A',
        ...rest
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);
      XLSX.utils.book_append_sheet(wb, ws, "Data");
      
      const currentTime = new Date().toLocaleString().replace(/:/g, '-').replace(/,/g, '');
      const filename = `${selected}_${selectedside}_${count}_records_${currentTime}.xlsx`;
      
      XLSX.writeFile(wb, filename);
      console.log("Data exported to Excel:", excelData);
      
    } catch (error) {
      console.error("Error fetching or processing data:", error);
      alert("An error occurred while processing your request. Please try again.");
    }
  };

  const renderRadioButton = (value, label) => (
    <div className="flex flex-row items-center justify-center" key={value}>
      <div className="items-end justify-end ml-2">
        <div className="flex items-center mb-4">
          <input
            id={`radio-${value}`}
            type="radio"
            value={value}
            name="radio-group"
            checked={selectedDrop === value}
            onChange={handleradiocustom}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label
            htmlFor={`radio-${value}`}
            className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300"
          >
            {label}
          </label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="md:h-full xl:w-[70%] w-[100%] md:p-4 xl:p-0 xl:overflow-hidden">
      <div className="md:h-[16%] flex flex-row justify-center items-end md:text-3xl md:font-semibold md:mt-0 mt-4">
        Select Count
      </div>
      <div>

        <div className="flex flex-col items-center justify-between  mt-10 md:flex-row ">
          <div className="items-start text-xl font-normal">Configuration</div>
          <Dropdown selected={selected} setSelected={setSelected} />

        </div>

        <div className="flex flex-col items-center justify-between mt-10 mb-5 md:flex-row">
          <div className="items-start text-xl font-normal">Select Sides</div>
          <DropdownSides selectedside={selectedside} setSelectedside={setSelectedside} />

        </div>
      </div>


      <div className="flex flex-col md:h-[40%] gap-10 justify-center mx-16 mt-10 md:mt-0">
        {renderRadioButton("100", "Last 100 Data")}
        {renderRadioButton("500", "Last 500 Data")}
        {renderRadioButton("1000", "Last 1000 Data")}
        {renderRadioButton("custom", "Custom Data")}

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
  );
};

export default CountData;