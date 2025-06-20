import React, { useState, useEffect } from "react";
import reportimg from "../../Assets/images/reportimg.png";

import ReportsButton from "../../Assets/components/Reports/ReportsButton";
import AverageDateRange from "../../Assets/components/Reports/AverageDateRange";
import TimeInterval from "../../Assets/components/Reports/TimeInterval";
import RangeDate from "../../Assets/components/Reports/RangeDate";
import CountData from "../../Assets/components/Reports/CountData";

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
    <div>
      {/* <div className="flex bg-[rgba(16,16,16,0.5)] md:h-[87%] m-4 rounded-lg border border-white sm:flex-cols sm:flex-row-none md:flex-row"> */}
      <div className="flex bg-[rgba(16,16,16,0.5)] md:h-[90%]  lg:h-[80%]  m-4 rounded-lg border border-white flex-col xl:flex-row ">
        <ReportsButton
          selectedButton={selectedButton}
          setSelectedButton={setSelectedButton}
        />
        <div className="bg-[rgb(9,9,11)]  md:w-[92%] xl:w-[70%] m-8 rounded-lg border border-white backdrop-blur-lg text-white flex">
          <div className="md:w-[50%] xl:flex md:hidden items-center justify-center m-32 rounded-lg hidden sm:flex">
            <img src={reportimg} className="w-full h-fit rounded-md" />
          </div>
          {selectedButton === "Average" && <AverageDateRange />}
          {selectedButton === "Time" && <TimeInterval />} 
          {selectedButton === "Range" && <RangeDate />}
          {selectedButton === "Count" && <CountData />} 
        </div>
      </div>
    </div>
  );
};

export default Report