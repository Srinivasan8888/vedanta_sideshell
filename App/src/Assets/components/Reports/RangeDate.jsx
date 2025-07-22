import React, { useState } from "react";
import Dropdown from "./Dropdown";
import * as XLSX from "xlsx/xlsx.mjs";
import DropdownSides from "./Dropdown-sides";
import API from "../Axios/AxiosInterceptor";

const RangeDate = () => {
  const [selected, setSelected] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedside, setSelectedside] = useState("Aside");

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
            `${process.env.REACT_APP_SERVER_URL}api/v2/getReportDateData?${params.toString()}`,
          );

          console.log("API Response:", response);
          const responseData = response.data?.data || [];
          console.log("Response Data:", responseData);

          if (!responseData || responseData.length === 0) {
            alert("No data found for the selected criteria.");
            return;
          }

          // Format data for Excel
          const excelData = responseData.map(
            ({ TIME, count, waveguide, ...rest }) => {
              // Create base object with timestamp
              const baseObj = {
                // Use the timestamp field directly as TIME
                TIME: TIME || "N/A",
                // Rename waveguide to more descriptive name
                Side: waveguide === "Aside" ? "East Side" : "West Side",
              };

              // Get sensor keys (excluding metadata and count)
              const sensorKeys = Object.keys(rest).filter(
                (key) =>
                  key !== "metadata" &&
                  key !== "count" &&
                  key.startsWith("sensor"),
              );

              // Sort sensor keys numerically (sensor1, sensor2, etc.)
              sensorKeys.sort((a, b) => {
                const numA = parseInt(a.replace("sensor", ""));
                const numB = parseInt(b.replace("sensor", ""));
                return numA - numB;
              });

              // Rename sensors based on the waveguide value in the data
              sensorKeys.forEach((key) => {
                const sensorNum = parseInt(key.replace("sensor", ""));
                const sensorValue = rest[key];

                // Skip adding N/A, empty or undefined sensors
                if (sensorValue === undefined || sensorValue === "N/A") return;

                if (waveguide === "Aside") {
                  baseObj[`ES${sensorNum}`] = sensorValue;
                } else if (waveguide === "Bside") {
                  baseObj[`WS${sensorNum + 12}`] = sensorValue;
                }
              });

              return baseObj;
            },
          );

          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.json_to_sheet(excelData);
          XLSX.utils.book_append_sheet(wb, ws, "Data");

          const currentTime = new Date()
            .toLocaleString()
            .replace(/:/g, "-")
            .replace(/,/g, "");
          XLSX.writeFile(
            wb,
            `${selected}_${selectedside}_report_${currentTime}.xlsx`,
          );
          console.log("Data exported to Excel:", excelData);
        } catch (error) {
          console.error("Error fetching or processing data:", error);
          alert(
            "An error occurred while processing your request. Please try again.",
          );
        }
      };

      apidate();
    }
  };
  return (
    <>
      <div className="2xl:font-boldfont-['Poppins'] mt-4 flex flex-row items-end justify-center text-[12px] font-semibold md:mt-0 md:h-[10%] xl:text-[10px] 2xl:text-[15px]">
        Select Date Ranges
      </div>
      <div className="w-[80%] grid-cols-1 grid-rows-4 justify-center gap-4 md:grid md:h-[70%] 2xl:w-[60%] 2xl:gap-0">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="items-start text-[12px] font-normal xl:text-[10px] 2xl:text-[15px]">
            Configuration
          </div>
          <Dropdown
            selected={selected}
            setSelected={setSelected}
            selectedSide={selectedside}
          />
        </div>

        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="items-start text-[12px] font-normal xl:text-[10px] 2xl:text-[15px]">
            Select Sides
          </div>
          <DropdownSides
            selectedside={selectedside}
            setSelectedside={setSelectedside}
          />
        </div>

        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="text-start text-[12px] font-normal xl:text-[10px] 2xl:text-[15px]">
            From
          </div>
          <div>
            <input
              type="date"
              id="startdate"
              name="startdate"
              onChange={handleDateChange}
              value={startDate}
              className="custom-datepicker mt-4 h-9 w-56 rounded-lg border border-white/30 bg-transparent p-1 text-sm text-white shadow-[inset_4px_4px_4px_0_rgba(0,0,0,0.25)] backdrop-blur-[8px] md:mt-0 2xl:w-64"
              style={{
                colorScheme: "dark",
                backgroundColor: "rgba(233, 238, 251, 0.25)",
              }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="text-start text-[12px] font-normal xl:text-[10px] 2xl:text-[15px]">
            To
          </div>
          <div>
            <input
              type="date"
              id="enddate"
              name="enddate"
              onChange={handleDateChange}
              value={endDate}
              className="custom-datepicker mt-4 h-9 w-56 rounded-lg border border-white/30 bg-transparent p-1 text-sm text-white shadow-[inset_4px_4px_4px_0_rgba(0,0,0,0.25)] backdrop-blur-[8px] md:mt-0 2xl:w-64"
              style={{
                colorScheme: "dark",
                backgroundColor: "rgba(233, 238, 251, 0.25)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="item-center flex justify-center text-[14px] font-semibold md:h-[20%] 2xl:font-bold">
        <div className="mt-4 flex h-12 w-44 items-center justify-center rounded-lg bg-[#e9eefb]/50 text-white 2xl:mt-0 2xl:h-16 2xl:w-56">
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
    </>
  );
};

export default RangeDate;
