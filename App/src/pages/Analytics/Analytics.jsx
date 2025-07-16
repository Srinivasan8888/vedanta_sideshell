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

    <div className="m-4 rounded-lg border border-white bg-[rgba(16,16,16,0.75)] text-white md:h-[95%]">
      <div className="m-4 gap-3 md:grid md:grid-cols-2 xl:flex xl:grid-cols-none md:h-[40%] h-[1100px] ">
        <AnalyticsButton
          selectedButton={selectedButton}
          setSelectedButton={setSelectedButton}
        />

        <div className="mt-4 flex flex-row items-center justify-center rounded-xl border border-white bg-[rgba(16,16,16,0.7)] py-4 text-white backdrop-blur xl:w-[35%]">
          <div className="w-full rounded-xl bg-[rgba(16,16,16,0.7)] pb-4  md:w-[20%]">
            <div className="flex flex-row justify-center">
              <div className="grid grid-row-2 gap-2 justify-center items-center px-1 md:grid-row-2 md:gap-5 xl:mr-3">
                <button
                  className={`flex h-16 w-20 items-center justify-center rounded-lg border bg-[rgba(16,16,16,0.9)] focus:outline-none focus:ring-2 focus:ring-white md:h-20 md:w-28 ${selectedBusBar === "Aside" ? "border-4 border-white" : "border border-white"
                    }`}
                  onClick={() => handleBusBarClick("Aside")}
                >
                  <span className="font-['Poppins'] text-sm font-medium text-white md:text-base">
                    East Side
                  </span>
                </button>

                <button
                  className={`flex h-16 w-20 items-center justify-center rounded-lg border bg-[rgba(16,16,16,0.9)] focus:outline-none focus:ring-2 focus:ring-white md:h-20 md:w-28 ${selectedBusBar === "Bside" ? "border-4 border-white" : "border border-white"
                    }`}
                  onClick={() => handleBusBarClick("Bside")}
                >
                  <span className="font-['Poppins'] text-sm font-medium text-white md:text-base">
                    West Side
                  </span>
                </button>

              </div>
            </div>
          </div>

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
        </div>
        {/* <div className="scrollbar-custom mt-4 h-auto w-full bg-[rgba(16,16,16,0.7)] overflow-x-auto overflow-y-auto rounded-xl border border-white p-2 text-white backdrop-blur md:flex lg:w-full md:col-span-2 md:flex-row md:p-4 xl:w-[40%]"> */}
        <div className=" scrollbar-custom mt-4 w-full h-auto bg-[rgba(16,16,16,0.7)] overflow-hidden rounded-xl border items-center justify-center border-white  text-white backdrop-blur md:flex lg:w-full md:col-span-2 md:flex-row xl:w-[40%]">
            {tableData.length > 0 ? (
              <div className="h-full overflow-auto rounded-lg border-0 shadow-lg">
                <table className="min-w-full divide-y divide-gray-700 bg-transparent">
                  <thead className="bg-gray-800/90 backdrop-blur-sm sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-800 z-10">
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
                            className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap"
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
                      {tableData[0]?.count && (
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap">
                          Count
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-700">
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
                          className={`${index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'} hover:bg-gray-800/80 transition-colors`}
                        >
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-200 sticky left-0 bg-gray-800 z-5">
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
                                className="px-4 py-2 text-center text-sm text-gray-200 whitespace-nowrap"
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
                            <td className="px-4 py-2 text-center text-sm text-gray-200 whitespace-nowrap">
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
              <div className="flex flex-col items-center justify-center h-48 text-gray-400 ">
                  <svg 
                  className="w-12 h-12 mb-2 text-gray-600" 
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
                <p className="text-center">
                  No data available.
                  <br />
                  <span className="text-sm">Select filters and click "Fetch Data" to view results.</span>
                </p>

                
              </div>
            )}
          </div>
      </div>

      <div className="flex-1 h-[700px]  md:h-[56%]  rounded-xl border border-white bg-[rgba(16,16,16,0.6)] backdrop-blur md:w-full ">
          <AnalyticsChart data={fetchedData} />  
          {/* console.log("fetchedData", fetchedData); */}
      </div>

    </div>

  );
};

export default Analytics;
