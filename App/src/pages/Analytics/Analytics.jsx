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
    <div
     
    >
      
      <div className="m-4 rounded-lg border border-white bg-[rgba(16,16,16,0.5)] md:h-[90%]">
      <div className="m-4 gap-3  xl:h-[35%] md:grid md:grid-cols-2 xl:flex xl:grid-cols-none">
          <AnalyticsButton
            selectedButton={selectedButton}
            setSelectedButton={setSelectedButton}
          />

          <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-white bg-[rgba(16,16,16,0.7)] py-4 text-white backdrop-blur xl:h-[100%] xl:w-[35%]">
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

          <div className="scrollbar-custom mt-4 h-auto w-full overflow-x-auto overflow-y-auto rounded-xl border border-white p-2 text-white backdrop-blur md:flex md:h-[100%] lg:h-[300px] lg:w-full md:col-span-2 xl:h-[100%] md:flex-row md:p-4 xl:w-[40%]">
          <div className="w-full rounded-xl bg-[rgba(16,16,16,0.7)] pb-4 md:h-[100%] md:w-[60%]">
          <div className="flex items-center justify-center py-2 font-['Poppins'] text-[18px] font-semibold text-white md:h-[20%] md:text-[22px]">
                Side A
              </div>
              <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-2 justify-center items-center px-1 md:grid-cols-3 md:gap-5 xl:mr-3">
                  {[1, 2, 3, 4, 5, 6].map((busBarNumber) => (
                    <button
                      key={busBarNumber}
                      className={`flex h-16 w-20 items-center justify-center rounded-lg border bg-[rgba(16,16,16,0.9)] focus:outline-none focus:ring-2 focus:ring-white md:h-20 md:w-28 ${
                        selectedBusBar === busBarNumber
                          ? "border-4 border-white"
                          : "border border-white"
                      }`}
                      onClick={() => handleBusBarClick(busBarNumber)}
                    >
                      <span className="font-['Poppins'] text-sm font-medium text-white md:text-base">
                        BusBar {busBarNumber}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-2 w-full rounded-xl bg-[rgba(16,16,16,0.7)] pb-4 md:ml-4 md:mt-0 md:h-[100%] md:w-[40%]">
              <div className="flex items-center justify-center py-2 font-['Poppins'] text-[18px] font-semibold text-white md:h-[20%] md:text-[22px]">
                Side B
              </div>
              <div className="flex justify-center">
                <div className="grid grid-cols-2 gap-2 justify-around ml-1 xl:px-1 md:ml-3 md:grid-cols-2 md:gap-5 xl:ml-0 xl:mr-1">
                  {[7, 8, 9, 10].map((busBarNumber) => (
                    <button
                      key={busBarNumber}
                      className={`flex h-16 w-20 items-center justify-center rounded-lg border bg-[rgba(16,16,16,0.9)] focus:outline-none focus:ring-2 focus:ring-white  md:h-20 md:w-28 ${
                        selectedBusBar === busBarNumber
                          ? "border-4 border-white"
                          : "border border-white"
                      }`}
                      onClick={() => handleBusBarClick(busBarNumber)}
                    >
                      <span className="font-['Poppins'] text-sm font-medium text-white md:text-base">
                        BusBar {busBarNumber}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="md:flex md:h-[270px] lg:h-[43%] xl:h-[58%] custom-md-air:h-[400px]">
          <div className="m-4 h-[700px] rounded-xl border border-white bg-[rgba(16,16,16,0.6)] backdrop-blur md:h-full md:w-full">
            <AnalyticsChart data={fetchedData} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
