import React, { useState } from "react";
import AnalyticsButton from "../../Assets/components/Analytics/AnalyticsButton";
import AverageDateRange from "../../Assets/components/Analytics/AverageDateRange";
import TimeInterval from "../../Assets/components/Analytics/TimeInterval";
import RangeDate from "../../Assets/components/Analytics/RangeDate";
import CountData from "../../Assets/components/Analytics/CountData";
// import AnalyticsTable from "../../Assets/components/Analytics/AnalyticsTable";
import AnalyticsChart from "../../Assets/components/Analytics/AnalyticsChart";

const Analytics = () => {
  const [selectedButton, setSelectedButton] = useState("Average");
  const [selectedBusBar, setSelectedBusBar] = useState(1); // Default selected BusBar is 1
  const [fetchedData, setFetchedData] = useState(null); // New state for fetched data

  // Example function to handle BusBar clicks
  const handleBusBarClick = (busBarNumber) => {
    setSelectedBusBar(busBarNumber); // Update the selected BusBar
    console.log(`BusBar${busBarNumber} clicked`);
    // Add your logic here
  };

  // console.log("Fetched Data:", fetchedData); // Log the fetched data

  return (
    <div>

      <div className="m-4 rounded-lg border border-white bg-[rgba(16,16,16,0.75)] text-white md:h-[95%] ">
        <div className="m-4 gap-3 md:grid md:grid-cols-2 xl:flex xl:grid-cols-none">
          <AnalyticsButton
            selectedButton={selectedButton}
            setSelectedButton={setSelectedButton}
          />

          <div className="mt-4 flex flex-row items-center justify-center rounded-xl border border-white bg-[rgba(16,16,16,0.7)] py-4 text-white backdrop-blur xl:w-[35%]">
          <div className="w-full rounded-xl bg-[rgba(16,16,16,0.7)] pb-4  md:w-[20%]">
              <div className="flex flex-row justify-center">
                <div className="grid grid-row-2 gap-2 justify-center items-center px-1 md:grid-row-2 md:gap-5 xl:mr-3">
                  <button
                    className={`flex h-16 w-20 items-center justify-center rounded-lg border bg-[rgba(16,16,16,0.9)] focus:outline-none focus:ring-2 focus:ring-white md:h-20 md:w-28 ${selectedBusBar === 1
                        ? "border-4 border-white"
                        : "border border-white"
                      }`}
                    onClick={() => handleBusBarClick(1)}
                  >
                    <span className="font-['Poppins'] text-sm font-medium text-white md:text-base">
                      A Side
                    </span>
                  </button>
                  <button
                    className={`flex h-16 w-20 items-center justify-center rounded-lg border bg-[rgba(16,16,16,0.9)] focus:outline-none focus:ring-2 focus:ring-white md:h-20 md:w-28 ${selectedBusBar === 2
                        ? "border-4 border-white"
                        : "border border-white"
                      }`}
                    onClick={() => handleBusBarClick(2)}
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
            <div className="w-full  h-full">
              {fetchedData && fetchedData.length > 0 ? (
                <div className="overflow-auto max-h-[250px] rounded-lg border border-gray-600">
                  <table className="min-w-full divide-y divide-gray-600">
                    <thead className="bg-gray-800 sticky top-0">
                      <tr>
                        {Object.keys(fetchedData[0]).map((key) => (
                          <th 
                            key={key}
                            scope="col"
                            className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider"
                          >
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                      {fetchedData.map((row, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'}>
                          {Object.values(row).map((value, i) => (
                            <td key={i} className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                              {typeof value === 'number' ? value.toFixed(2) : value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex items-center justify-center text-gray-400 h-full">
                  No data available. Select filters and click "Fetch Data" to view results.
                </div>
              )}
            </div>
          </div>
        </div>
       
        <div className="m-4 h-[700px] rounded-xl border border-white bg-[rgba(16,16,16,0.6)] backdrop-blur md:h-[100%] md:w-full">
            <AnalyticsChart data={fetchedData} />
          </div>
        
      </div>
    </div>
  );
};

export default Analytics;
