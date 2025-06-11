import React, { useEffect } from "react";
import '../miscellaneous/Scrollbar.css'

const HeatmapTable = ({ data, dates }) => {
  // Get unique keys for column headers
  const keys = data.map(item => item.key);

  // Store data in local storage if new data is available
  useEffect(() => {
    if (dates.length > 0) {
      localStorage.setItem("heatmapData", JSON.stringify({ data }));
    }
  }, [data]);

  // Retrieve data from local storage if no new data is available
  const storedData =
    dates.length === 0
      ? JSON.parse(localStorage.getItem("heatmapData"))
      : null;
  const finalData = storedData || { data } || { data: {} }; // Ensure finalData has default structure

  const noDataAvailable =
    !dates ||
    dates.length === 0 ||
    (finalData.data && Object.keys(finalData.data).length === 0);

  return (
    <div className="relative w-full overflow-x-auto rounded-lg shadow-md scrollbar-custom">
      <table className="w-full text-sm font-normal text-white md:text-lg font-poppins">
        <thead className="sticky top-0 bg-[rgb(16,16,16)] z-10 rounded-lg">
          <tr>
            <th className="px-2 md:px-6 py-2 md:py-3 border border-white bg-[rgb(16,16,16)]">Date</th>
            {keys.map((key, index) => (
              <th 
                key={key}
                className={`px-2 md:px-6 py-2 md:py-3 border border-white ${
                  index % 2 === 0 ? "bg-[rgb(16,16,16)]" : "bg-[rgb(20,20,20)]"
                }`}
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {noDataAvailable ? (
            <tr className="border-b border-white bg-[rgb(16,16,16)] w-full">
              <td
                colSpan={keys.length + 1}
                className="px-2 md:px-6 py-2 md:py-4 text-center font-medium text-white border border-white bg-[rgb(16,16,16)] "
              >
                No data available
              </td>
            </tr>
          ) : (
            dates.map((date, dateIndex) => (
              <tr key={date} className="border-b border-white bg-[rgb(16,16,16)]">
                <td className="px-2 md:px-6 py-2 md:py-4 border border-white bg-[rgb(16,16,16)] text-xs md:text-sm">
                  {new Date(date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric"
                  })}
                </td>
                {data.map((item, colIndex) => {
                  const value = item.values[dateIndex];
                  return (
                    <td
                      key={`${item.key}-${dateIndex}`}
                      className={`px-2 md:px-6 py-2 md:py-4 border border-white ${
                        colIndex % 2 === 0 ? "bg-[rgb(16,16,16)]" : "bg-[rgb(20,20,20)]"
                      } text-xs md:text-sm`}
                    >
                      <span className={`
                        ${value >= 190 && value < 230 ? 'text-green-400' : 
                         value >= 230 && value < 250 ? 'text-green-600' :
                         value >= 250 && value < 300 ? 'text-orange-600' :
                         value >= 300 && value < 450 ? 'text-red-600' :
                         value >= 450 ? 'text-red-800' : 'text-white'}
                      `}>
                        {value?.toFixed(2) || "-"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default HeatmapTable;
