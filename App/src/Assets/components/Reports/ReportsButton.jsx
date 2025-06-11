import React from "react";
import Average from "../../images/Average.png";
import Count from "../../images/Count.png";
import Dateimg from "../../images/Date.png";
import Interval from "../../images/Interval.png";

const ReportsButton = ({ selectedButton, setSelectedButton }) => {
  return (
    <div className="lg:grid-row m-4 mt-4 grid h-[270px] grid-cols-2 items-center justify-center gap-4 rounded-xl border border-white bg-[rgba(16,16,16,0.6)] p-4 backdrop-blur-sm md:m-8 md:h-[92%] xl:h-[90%] lg:h-[70%] xl:grid-cols-none md:p-0 xl:w-[20%] xl:gap-0">
      {" "}
      <button
        className={`flex h-[100%] flex-col justify-center rounded-xl border bg-[rgb(16,16,16)] focus:ring-2 focus:ring-white xl:h-40 xl:w-60 items-center ${
          selectedButton === "Average" ? "ring-2 ring-white focus:ring-white" : "focus:ring-white"
        }`}
        onClick={() => setSelectedButton("Average")}
      >
        <img src={Average} className="w-6 h-6 md:mt-0 md:h-auto md:w-5" />
        <div className="mt-4 text-sm text-white font-regular md:text-lg md:font-medium">
          Average Data
        </div>
      </button>
      <button
        className={`flex h-[100%] flex-col justify-center rounded-xl border bg-[rgb(16,16,16)] focus:ring-2 focus:ring-white xl:h-40 xl:w-60 items-center ${
          selectedButton === "Time"? "ring-2 ring-white focus:ring-white" : "focus:ring-white"
        }`}
        onClick={() => setSelectedButton("Time")}
      >
        <img src={Interval} className="w-6 h-6 md:mt-0 md:h-auto md:w-8" />
        <div className="mt-4 text-sm text-white font-regular md:text-lg md:font-medium">
          Interval Data
        </div>
      </button>
      <button
        className={`flex h-[100%] flex-col items-center justify-center rounded-xl border bg-[rgb(16,16,16)] focus:ring-2 focus:ring-white xl:h-40 xl:w-60 ${
          selectedButton === "Range"? "ring-2 ring-white focus:ring-white" : "focus:ring-white"
        }`}
        onClick={() => setSelectedButton("Range")}
      >
        <img src={Dateimg} className="w-6 h-6 md:mt-0 md:h-auto" />
        <div className="mt-4 text-sm text-white font-regular md:text-lg md:font-medium">
          Date Picker
        </div>
      </button>
      <button
        className={`flex h-[100%] flex-col items-center justify-center rounded-xl border bg-[rgb(16,16,16)] focus:ring-2 focus:ring-white xl:h-40 xl:w-60 ${
          selectedButton === "Count" ? "ring-2 ring-white focus:ring-white" : "focus:ring-white"
        }`}
        onClick={() => setSelectedButton("Count")}
      >
        <img src={Count} className="w-6 h-6 md:mt-0 md:h-auto" />
        <div className="mt-4 text-sm text-white font-regular md:text-lg md:font-medium">
          Count-wise Data
        </div>
      </button>
    </div>
  );
};

export default ReportsButton;
