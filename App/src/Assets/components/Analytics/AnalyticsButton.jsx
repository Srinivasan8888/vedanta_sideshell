import React from "react";
import Average from "../../images/Average.png";
import Count from "../../images/Count.png";
import Dateimg from "../../images/Date.png";
import Interval from "../../images/Interval.png";

const AnalyticsButton = ({ selectedButton , setSelectedButton }) => {
  // console.log("Selected Button in AnalyticsButton:", selectedButton); // Debugging

  return (
    <div className="xl:w-[25%] xl:h-[100%] h-[270px] bg-[rgba(16,16,16,0.6)] mt-4 grid grid-cols-2 gap-4 rounded-xl p-4 border backdrop-blur-sm md:backdrop-blur border-white">
      <button
        className={`bg-[rgb(16,16,16)] rounded-xl border h-[100%] focus:ring-2 focus:ring-white flex flex-col justify-center items-center ${
          selectedButton === "Average" ? "ring-2 ring-white focus:ring-[#00FF00]" : "focus:ring-[#00FF00]"
        }`}
        onClick={() => setSelectedButton("Average")}
      >
        <img src={Average} className="w-6 h-6" alt="Average" />
        <div className="mt-4 text-sm text-white md:text-lg md:font-medium">Average Data</div>
      </button>
      <button
        className={`bg-[rgb(16,16,16)] rounded-xl border h-[100%] focus:ring-2 focus:ring-white flex flex-col justify-center items-center ${
          selectedButton === "Time" ? "ring-2 ring-white focus:ring-white" : "focus:ring-white"
        }`}
        onClick={() => setSelectedButton("Time")}
      >
        <img src={Interval} className="w-6 h-auto" alt="Interval" />
        <div className="mt-4 text-sm text-white md:text-lg md:font-medium">Interval Data</div>
      </button>
      <button
        className={`bg-[rgb(16,16,16)] rounded-xl border h-[100%] focus:ring-2 focus:ring-white flex flex-col justify-center items-center ${
          selectedButton === "Range" ? "ring-2 ring-white focus:ring-white" : "focus:ring-white"
        }`}
        onClick={() => setSelectedButton("Range")}
      >
        <img src={Dateimg} className="w-6 h-auto" alt="Date" />
        <div className="mt-4 text-sm text-white md:text-lg md:font-medium">Date Picker</div>
      </button>
      <button
        className={`bg-[rgb(16,16,16)] rounded-xl border h-[100%] focus:ring-2 focus:ring-white flex flex-col justify-center items-center ${
          selectedButton === "Count" ? "ring-2 ring-white focus:ring-white" : "focus:ring-white"
        }`}
        onClick={() => setSelectedButton("Count")}
      >
        <img src={Count} className="w-6 h-auto" alt="Count" />
        <div className="mt-4 text-sm text-white md:text-lg md:font-medium">Count-wise Data</div>
      </button>
    </div>
  );
};

export default AnalyticsButton;