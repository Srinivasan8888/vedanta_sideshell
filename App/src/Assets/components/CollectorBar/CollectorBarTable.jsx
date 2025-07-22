import React from "react";
import "../miscellaneous/Scrollbar.css";

const CollectorBarTable = ({ data }) => {
  // Transform and sort data with latest first
  const tableData = data
    ? Object.keys(data)
        .filter(
          (key) =>
            key !== "createdAt" &&
            key !== "minValue" &&
            key !== "maxValue" &&
            key !== "averageValue",
        )
        .flatMap((sensorId) =>
          data[sensorId].map((value, index) => ({
            value,
            createdAt: data.createdAt[index],
          })),
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [];

  const headers = ["S.no", "TimeStamp", "Value"];

  return (
    <div
      style={{ maxHeight: "361px" }}
      className="overflow-x-auto md:overflow-visible"
    >
      <table className="font-poppins w-full text-[12px] font-normal text-white 2xl:text-[15px]">
        <thead className="sticky top-0 z-10 bg-[#e9eefb]/10 text-[12px] font-normal 2xl:text-[15px]">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className={`border border-white px-2 py-2 2xl:px-6 2xl:py-3 ${index % 2 === 0 ? "bg-[#e9eefb]/10" : "bg-[#e9eefb]/20"}`}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.length === 0 ? (
            <tr className="border-b border-white bg-[#e9eefb]/10">
              <td
                colSpan={headers.length}
                className="border border-white bg-[#e9eefb]/10 px-2 py-2 text-center text-[12px] font-normal text-white 2xl:px-6 2xl:py-4 2xl:text-[15px]"
              >
                No data available
              </td>
            </tr>
          ) : (
            tableData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-white bg-[#e9eefb]/10"
              >
                <td className="border border-white bg-[#e9eefb]/10 px-1 py-2 text-[12px] font-normal 2xl:px-2 2xl:py-4 2xl:text-[15px]">
                  {rowIndex + 1}
                </td>
                <td className="border border-white bg-[#e9eefb]/10 px-1 py-2 text-[12px] font-normal 2xl:px-2 2xl:py-4 2xl:text-[15px]">
                  {new Date(row.createdAt).toLocaleString()}
                </td>
                <td className="border border-white bg-[#e9eefb]/10 px-1 py-2 text-[12px] font-normal 2xl:px-2 2xl:py-4 2xl:text-[15px]">
                  {Number(row.value).toFixed(2)}°C
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default CollectorBarTable;
