import React, { useState } from "react";
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

  // Example function to handle BusBar clicks
  const handleBusBarClick = (busBar) => {
    setSelectedBusBar(busBar);
    console.log(`${busBar} clicked`);
  };

  // console.log("Fetched Data:", fetchedData); // Log the fetched data

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
                    A Side
                  </span>
                </button>

                <button
                  className={`flex h-16 w-20 items-center justify-center rounded-lg border bg-[rgba(16,16,16,0.9)] focus:outline-none focus:ring-2 focus:ring-white md:h-20 md:w-28 ${selectedBusBar === "Bside" ? "border-4 border-white" : "border border-white"
                    }`}
                  onClick={() => handleBusBarClick("Bside")}
                >
                  <span className="font-['Poppins'] text-sm font-medium text-white md:text-base">
                    B Side
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

        <div className="scrollbar-custom mt-4 h-auto w-full bg-[rgba(16,16,16,0.7)] overflow-x-auto overflow-y-auto rounded-xl border border-white p-2 text-white backdrop-blur md:flex lg:w-full md:col-span-2 md:flex-row md:p-4 xl:w-[40%]">
          <div className="w-full h-full">
            {fetchedData && fetchedData.length > 0 ? (
              <div className="overflow-auto max-h-[300px] rounded-lg border border-gray-700 shadow-lg">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800 sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider sticky left-0 bg-gray-800 z-10">
                        Timestamp
                      </th>
                      {Object.keys(fetchedData[0])
                        .filter(key => key.startsWith('sensor') || key === 'waveguide')
                        .sort((a, b) => {
                          // Sort sensors numerically
                          if (a.startsWith('sensor') && b.startsWith('sensor')) {
                            return parseInt(a.replace('sensor', '')) - parseInt(b.replace('sensor', ''));
                          }
                          return a.localeCompare(b);
                        })
                        .map((key) => (
                          <th
                            key={key}
                            scope="col"
                            className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider whitespace-nowrap"
                          >
                            {key === 'waveguide' ? 'Waveguide' : key.replace('sensor', 'S')}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody className="bg-gray-900 divide-y divide-gray-700">
                    {fetchedData.map((row, index) => {
                      const timestamp = row.timestamp || row.TIME || '';
                      const date = timestamp ? new Date(timestamp) : null;
                      
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
                          {Object.entries(row)
                            .filter(([key]) => key.startsWith('sensor') || key === 'waveguide')
                            .sort(([a], [b]) => {
                              // Sort sensors numerically
                              if (a.startsWith('sensor') && b.startsWith('sensor')) {
                                return parseInt(a.replace('sensor', '')) - parseInt(b.replace('sensor', ''));
                              }
                              return a.localeCompare(b);
                            })
                            .map(([key, value], i) => {
                              const isSensor = key.startsWith('sensor');
                              const numericValue = typeof value === 'number' ? value : parseFloat(value);
                              const isNumber = !isNaN(numericValue);
                              
                              // Determine color based on value
                              let textColor = 'text-gray-300';
                              if (isNumber) {
                                if (numericValue < 60) textColor = 'text-blue-300';
                                else if (numericValue < 70) textColor = 'text-green-400';
                                else if (numericValue < 80) textColor = 'text-yellow-400';
                                else if (numericValue < 90) textColor = 'text-orange-500';
                                else textColor = 'text-red-500';
                              }
                              
                              return (
                                <td 
                                  key={`${index}-${key}`} 
                                  className={`px-4 py-2 text-center text-sm ${textColor} whitespace-nowrap`}
                                  title={isNumber ? `${key}: ${numericValue.toFixed(2)}°C` : `${key}: ${value}`}
                                >
                                  {isNumber ? (
                                    <span className={`px-2 py-1 rounded ${isSensor ? 'bg-gray-800/50' : ''}`}>
                                      {numericValue.toFixed(2)}°C
                                    </span>
                                  ) : (
                                    <span className="text-gray-400">{value}</span>
                                  )}
                                </td>
                              );
                            })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-gray-400">
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
      </div>

      <div className="flex-1 h-[700px]  md:h-[56%]  rounded-xl border border-white bg-[rgba(16,16,16,0.6)] backdrop-blur md:w-full  ">
        <div className="h-full w-full">
          <AnalyticsChart data={fetchedData} />
        </div>
      </div>

    </div>

  );
};

export default Analytics;
