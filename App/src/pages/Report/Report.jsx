import React, { useState, useEffect } from "react";
import reportimg from "../../Assets/images/reportimg.png";

import ReportsButton from "../../Assets/components/Reports/ReportsButton";
import AverageDateRange from "../../Assets/components/Reports/AverageDateRange";
import TimeInterval from "../../Assets/components/Reports/TimeInterval";
import RangeDate from "../../Assets/components/Reports/RangeDate";
import CountData from "../../Assets/components/Reports/CountData";

//images
import Average from "../../Assets/images/Average.png";
import Interval from "../../Assets/images/Interval.png";
import Count from "../../Assets/images/Count.png";
import Dateimg from "../../Assets/images/Date.png";

import Dropdown from "../../Assets/components/Reports/Dropdown.jsx";
import DropdownSides from "../../Assets/components/Reports/Dropdown-sides.jsx";

const Report = () => {
  const [selectedButton, setSelectedButton] = useState("Average");

  useEffect(() => {
    // Retrieve the selected button from localStorage on component mount
    const savedButton = localStorage.getItem('selectedButton');
    if (savedButton) {
      setSelectedButton(savedButton);
    }
  }, []);

  useEffect(() => {
    // Save the selected button to localStorage whenever it changes
    localStorage.setItem('selectedButton', selectedButton);
  }, [selectedButton]);

  return (
    // <div className=" md:h-[95%] flex flex-col">
    //   <div className="flex-1 flex flex-col xl:flex-row bg-[rgba(16,16,16,0.5)] m-4 rounded-lg border border-white">
    //     {/* <ReportsButton
    //       selectedButton={selectedButton}
    //       setSelectedButton={setSelectedButton}
    //     /> */}
    //     <div className="flex-1 bg-[rgb(9,9,11)] rounded-lg border border-white backdrop-blur-lg text-white flex flex-col xl:flex-row m-2 xl:m-4 ">
    //       {/* <div className="hidden xl:flex items-center justify-center p-4 w-full xl:w-1/2">
    //         <img 
    //           src={reportimg} 
    //           className="max-w-full h-auto rounded-md" 
    //           alt="Report visualization"
    //         />
    //       </div>
    //       <div className="flex-1 p-4 xl:p-6 overflow-auto">
    //       {selectedButton === "Range" && <RangeDate />}
    //         {selectedButton === "Average" && <AverageDateRange />}
    //         {selectedButton === "Time" && <TimeInterval />}
    //         {selectedButton === "Count" && <CountData />}
    //       </div> */}
    //     </div>
    //   </div>
    // </div>

    <div className=" h-[100%] md:h-[93%]  flex flex-col rounded-lg border border-white m-4 flex-1 md:flex-row">
      <ReportsButton
        selectedButton={selectedButton}
        setSelectedButton={setSelectedButton}
      />
      <div className="rounded-lg border border-white   bg-gradient-to-br from-white/20 via-white/5 to-white/20 m-2 w-[95%] md:w-[70%] xl:w-[84%]  backdrop-blur-[5px] md:grid xl:grid-cols-2 grid-rows-1 gap-4">
        <div className="hidden xl:flex items-center justify-center m-4 w-full ">
          <img
            src={reportimg}
            className="max-w-full h-auto"
            alt="Report visualization"
          />
        </div>
        <div className="flex-1 text-white h-[100%] flex flex-col items-center xl:w-[84%] justify-center">
          
          {selectedButton === "Average" && <AverageDateRange />}
          {selectedButton === "Time" && <TimeInterval />}
          {selectedButton === "Range" && <RangeDate />}
          {selectedButton === "Count" && <CountData />}
        </div>
      </div>
    </div>
  );
};

export default Report;