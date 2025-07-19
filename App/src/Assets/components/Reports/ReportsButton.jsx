import React from "react";
import Average from "../../images/Average.png";
import Count from "../../images/Count.png";
import Dateimg from "../../images/Date.png";
import Interval from "../../images/Interval.png";

const ReportsButton = ({ selectedButton, setSelectedButton }) => {
  return (
    <div className="rounded-lg border border-white grid grid-cols-1 grid-rows-4 gap-5  bg-gradient-to-br from-white/20 via-white/5 to-white/20 m-2 w-[95%] md:w-[27%] xl:w-[16%]  backdrop-blur-[5px] p-5">
    
   <button className={` border border-white rounded-xl flex items-center justify-center ${selectedButton === "Average" ? "ring-2 ring-white" : ""
      }`} onClick={() => setSelectedButton("Average")}>
      <div className="flex items-center flex-col gap-2"><img src={Dateimg} className="w-6 h-6 md:mt-0 md:h-auto md:w-3 2xl:w-5" />
        <div className="justify-start text-white text-[10px] 2xl:text-[14px] font-medium font-['Poppins']">AVERAGE DATA</div>
      </div>
    </button>

    <button className={`row-start-2 border border-white rounded-xl flex items-center justify-center ${selectedButton === "Time" ? "ring-2 ring-white" : ""
      }`}
      onClick={() => setSelectedButton("Time")}
    >
      <div className="flex items-center flex-col gap-2">
        <img src={Interval} className="w-6 h-6 md:mt-0 md:h-auto md:w-3 2xl:w-5" />
        <div className="justify-start text-white text-[10px] 2xl:text-[14px] font-medium font-['Poppins']">INTERVAL DATA</div>
      </div>
    </button>
   
    <button
      className={`border row-start-3 border-white rounded-xl flex items-center justify-center ${selectedButton === "Range" ? "ring-2 ring-white" : ""
        }`}
      onClick={() => setSelectedButton("Range")}
    >
      <div className="flex items-center flex-col gap-2">
        <img src={Dateimg} className="w-6 h-6 md:mt-0 md:h-auto md:w-3 2xl:w-5" />
        <div className="justify-start text-white text-[10px] 2xl:text-[14px] font-medium font-['Poppins']">RANGE DATA</div>
      </div>
    </button>

    <button className={`row-start-4 border border-white rounded-xl flex items-center justify-center ${selectedButton === "Count" ? "ring-2 ring-white" : ""
      }`} onClick={() => setSelectedButton("Count")}>
      <div className="flex items-center flex-col gap-2">
        <img src={Count} className="w-6 h-6 md:mt-0 md:h-auto md:w-3 2xl:w-5" />
        <div className="justify-start text-white text-[10px] 2xl:text-[14px] font-medium font-['Poppins']">COUNT-WISE DATA</div>
      </div>
    </button>
  </div>
  );
};

export default ReportsButton;
