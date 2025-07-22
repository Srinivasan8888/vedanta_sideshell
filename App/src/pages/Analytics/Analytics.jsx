import React, { useState, useEffect } from "react";
import AnalyticsButton from "../../Assets/components/Analytics/AnalyticsButton";
import AverageDateRange from "../../Assets/components/Analytics/AverageDateRange";
import TimeInterval from "../../Assets/components/Analytics/TimeInterval";
import RangeDate from "../../Assets/components/Analytics/RangeDate";
import CountData from "../../Assets/components/Analytics/CountData";
// import AnalyticsTable from "../../Assets/components/Analytics/AnalyticsTable";
import AnalyticsChart from "../../Assets/components/Analytics/AnalyticsChart";

const Analytics = () => {
  const [selectedButton, setSelectedButton] = useState("Range");
  const [selectedBusBar, setSelectedBusBar] = useState("Aside"); // Default selected BusBar is 1
  const [fetchedData, setFetchedData] = useState(null); // New state for fetched data

  // Get the data array from the response object
  const tableData = React.useMemo(() => {
    if (!fetchedData) return [];
    // If data is an array, use it directly
    if (Array.isArray(fetchedData)) return fetchedData;
    // If data has a data property that's an array, use that
    if (fetchedData.data) {
      if (Array.isArray(fetchedData.data)) return fetchedData.data;
      // If data.data is not an array but is an object, wrap it in an array
      if (typeof fetchedData.data === 'object' && fetchedData.data !== null) {
        return [fetchedData.data];
      }
    }
    // If we have no valid data, return empty array
    return [];
  }, [fetchedData]);

  // Function to handle BusBar clicks
  const handleBusBarClick = (busBar) => {
    setSelectedBusBar(busBar);
  };

  // Handle component updates
  useEffect(() => {
    // Component update logic can go here if needed
  }, [selectedBusBar, selectedButton, fetchedData, tableData]);

  return (

    <div className=" rounded-lg backdrop-blur-[5px] bg-gradient-to-br from-white/20 via-white/5 to-white/20 text-white xl:h-[93%] 2xl:h-[94%] p-2 border space-y-2 m-4 ">
      {/* <div className="m-4 gap-3 md:grid md:grid-cols-2 xl:flex xl:grid-cols-none md:h-[40%] h-[1100px] "> */}
      <div className="xl:flex gap-3  xl:h-[40%] space-y-2 xl:space-y-0 " >
        <AnalyticsButton
          selectedButton={selectedButton}
          setSelectedButton={setSelectedButton}
        />

        <div className=" border xl:w-[10%] w-[100%] h-[150px] xl:h-[100%] flex flex-row xl:flex-col gap-2 items-center rounded-xl justify-center bg-gradient-to-br from-white/20 via-white/5 to-white/20 backdrop-blur-[5px]">
          <button className={`border h-[80%] w-[35%] xl:h-[40%] xl:w-[80%] rounded-xl text-[10px] md:text-[12px] xl:text-[10px] 2xl:text-[15px] font-normal ${selectedBusBar === "Aside" ? "ring-2 ring-white focus:ring-white" : "focus:ring-white"
            }`} onClick={() => handleBusBarClick("Aside")}>East Side</button>
          <button className={`border h-[80%] w-[35%] xl:h-[40%] xl:w-[80%] rounded-xl text-[10px] md:text-[12px] xl:text-[10px] 2xl:text-[15px] font-normal ${selectedBusBar === "Bside" ? "ring-2 ring-white focus:ring-white" : "focus:ring-white"
            }`} onClick={() => handleBusBarClick("Bside")}>West Side</button>
        </div>

        <>
          {selectedButton === "Average" && (
            <AverageDateRange
              selectedBusBar={selectedBusBar}
              setFetchedData={setFetchedData} // Pass function to update fetched data
            />
          )}
          {selectedButton === "Time" && (
            <TimeInterval
              selectedBusBar={selectedBusBar}
              setFetchedData={setFetchedData}
            />
          )}
          {selectedButton === "Range" && (
            <RangeDate
              selectedBusBar={selectedBusBar}
              setFetchedData={setFetchedData}
            />
          )}
          {selectedButton === "Count" && (
            <CountData
              selectedBusBar={selectedBusBar}
              setFetchedData={setFetchedData}
            />
          )}
          </> 

        <div className="border xl:w-[40%] w-[100%] h-[300px]  overflow-x-auto overflow-y-auto scrollbar-custom  xl:h-[100%] rounded-xl bg-gradient-to-br from-white/20 via-white/5 to-white/20 backdrop-blur-[5px]">
        <div className="w-full h-full">
        {tableData.length > 0 ? (
            <div className=" overflow-auto rounded-lg   shadow-lg">
              <table className="min-w-full divide-y divide-gray-700 bg-transparent">
                <thead className=" backdrop-blur-sm sticky top-0 z-10 bg-[#e9eefb]/25">
                  <tr>
                    <th className="px-4 py-3 text-left text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal  text-gray-300 uppercase tracking-wider ">
                      {tableData[0]?.TIME || tableData[0]?.timestamp ? 'Timestamp' : 'Data'}
                    </th>
                    {tableData[0] && Object.keys(tableData[0])
                      .filter(key => {
                        // Filter out special keys and columns where all values are N/A or empty
                        if (key === 'TIME' || key === 'timestamp' || key === 'count') return false;

                        // Check if all values in this column are N/A or empty
                        const allNaOrEmpty = tableData.every(row => {
                          const val = row[key];
                          return val === null || val === undefined || val === '' || val === 'N/A';
                        });

                        return !allNaOrEmpty; // Keep columns that have at least one valid value
                      })
                      .sort((a, b) => {
                        if (a.startsWith('sensor') && b.startsWith('sensor')) {
                          return parseInt(a.replace('sensor', '')) - parseInt(b.replace('sensor', ''));
                        }
                        if (a === 'waveguide') return -1;
                        if (b === 'waveguide') return 1;
                        return a.localeCompare(b);
                      })
                      .map((key) => (
                        <th
                          key={key}
                          scope="col"
                          className="px-4 py-3 text-center text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal text-gray-300 uppercase tracking-wider whitespace-nowrap"
                        >
                          {key === 'waveguide' ? 'Sides' :
                            key === 'ASide' ? 'East Side' :
                              key === 'BSide' ? 'West Side' :
                                (() => {
                                  // Get the current side (East or West)
                                  const currentSide = tableData[0]?.waveguide || selectedBusBar || '';
                                  const isEast = currentSide.toString().toLowerCase().includes('a');

                                  // Extract sensor number
                                  const sensorMatch = key.match(/sensor(\d+)/i) || [];
                                  if (sensorMatch[1]) {
                                    const sensorNum = parseInt(sensorMatch[1]);
                                    const prefix = isEast ? 'ES' : 'WS';
                                    const baseNum = isEast ? 1 : 13; // ES starts from 1, WS from 13
                                    return `${prefix}${baseNum + sensorNum - 1}`; // Adjust for 1-based indexing
                                  }
                                  return key.replace('sensor', 'S'); // Fallback to original if no match
                                })()}
                        </th>
                      ))}
                    {/* {tableData[0]?.count && (
                      <th className="px-4 py-3 text-center text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal text-gray-300 uppercase tracking-wider whitespace-nowrap">
                        Count
                      </th>
                    )} */}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {tableData.map((row, index) => {
                    const timestamp = row.TIME || row.timestamp || '';
                    const date = timestamp ? new Date(timestamp) : null;

                    // Get all data keys except special fields and columns with all N/A values
                    const dataKeys = Object.keys(row).filter(
                      key => {
                        if (key === 'TIME' || key === 'timestamp' || key === 'count') return false;
                        // Check if this column has at least one non-N/A value
                        return !tableData.every(r => {
                          const val = r[key];
                          return val === null || val === undefined || val === '' || val === 'N/A';
                        });
                      }
                    ).sort((a, b) => {
                      if (a.startsWith('sensor') && b.startsWith('sensor')) {
                        return parseInt(a.replace('sensor', '')) - parseInt(b.replace('sensor', ''));
                      }
                      if (a === 'waveguide') return -1;
                      if (b === 'waveguide') return 1;
                      return a.localeCompare(b);
                    });

                    return (
                      <tr
                        key={index}
                        // className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'} hover:bg-gray-800/80 transition-colors`}
                        className={`bg-transparent hover:bg-gray-800/80 transition-colors`}
                      >
                        <td className="px-4 py-2 whitespace-nowrap text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal text-gray-200  ">
                          {date ? (
                            <div className="flex flex-col">
                              <span>{date.toLocaleDateString()}</span>
                              <span className="text-xs text-gray-400">{date.toLocaleTimeString()}</span>
                            </div>
                          ) : 'N/A'}
                        </td>
                        {dataKeys.map((key) => {
                          const value = row[key];
                          return (
                            <td
                              key={`${index}-${key}`}
                              className="px-4 py-2 text-center text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal text-gray-200 whitespace-nowrap"
                              title={`${key}: ${value}`}
                            >
                              {(() => {
                                if (value === null || value === undefined || value === '' || value === 'N/A') return null;
                                if (key === 'waveguide') {
                                  if (value === 'ASide' || value === 'A' || value === 'Aside' || value === 'aside') return 'East Side';
                                  if (value === 'BSide' || value === 'B' || value === 'Bside' || value === 'bside') return 'West Side';
                                  return value;
                                }
                                return value;
                              })()}
                            </td>
                          );
                        })}
                        {row.count !== undefined && (
                          <td className="px-4 py-2 text-center text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal text-gray-200 whitespace-nowrap">
                            {row.count}
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 ">
              <svg
                className=" w-6 h-6 2xl:w-12 2xl:h-12 mb-2 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-center text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal">
                No data available.
                <br />
                <span className="text-[12px] xl:text-[8px] 2xl:text-[15px] font-normal">Select filters and click "Fetch Data" to view results.</span>
              </p>


            </div>
          )}
        </div>
        </div>
      </div>

      <div className="flex-1 h-[400px] xl:h-[55%] 2xl:h-[56%]   xl:mt-1  rounded-xl border border-white bg-gradient-to-br from-white/20 via-white/5 to-white/20 backdrop-blur-[5px] md:w-full ">
        <AnalyticsChart data={fetchedData} />
      </div>

    </div>

  );
};

export default Analytics;
