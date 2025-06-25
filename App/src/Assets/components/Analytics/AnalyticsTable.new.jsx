import React from "react";
import "../Miscellaneous/Scrollbar.css";

const AnalyticsTable = ({ data }) => {
  // If no data is provided, show a message
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-white font-poppins">
        No data available. Please select a filter to view data.
      </div>
    );
  }

  // Get all unique keys from the data objects to create table headers
  const headers = Object.keys(data[0] || {});

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-lg font-normal text-white font-poppins">
        <thead className="sticky top-0">
          <tr className="bg-[rgb(16,16,16)] rounded-tr-xl rounded-tl-xl">
            <th className="px-4 py-3 text-left">#</th>
            {headers.map((header, index) => (
              <th key={index} className="px-4 py-3 text-left whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="overflow-y-auto scrollbar-custom">
          {data.map((row, rowIndex) => (
            <tr 
              key={rowIndex} 
              className="border-t border-white hover:bg-[rgba(255,255,255,0.05)]"
            >
              <td className="px-4 py-2">{rowIndex + 1}</td>
              {headers.map((header, colIndex) => (
                <td key={colIndex} className="px-4 py-2 whitespace-nowrap">
                  {typeof row[header] === 'number' 
                    ? row[header].toFixed(2) 
                    : row[header] || '-'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AnalyticsTable;
