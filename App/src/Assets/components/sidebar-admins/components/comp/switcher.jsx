import React, { useState } from "react";

const Switcher = ({ onSwitch }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [value, setValue] = useState("Min");

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    const newValue = !isChecked ? "UserL" : "UserP";
    setValue(newValue);
   
    console.log("Value", newValue);
    
    // Call the onSwitch prop with the new value
    if (onSwitch) {
      onSwitch(newValue);
    }
  };

  return (
    <>
      <label className="relative inline-flex items-center justify-center p-1  border rounded-md bg-[rgba(16,16,16,0.9)] cursor-pointer select-none themeSwitcherTwo shadow-card md:w-80 md:h-16">
        <input
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <span
          className={`flex items-center space-x-[6px] rounded py-3 px-[30px] text-white text-lg font-medium font-['Poppins']${
            !isChecked ? "text-white bg-[rgba(59,59,59)]" : "text-white"
          }`}
        >
          <p>User Profile</p>
        </span>
        <span
          className={`flex items-center space-x-[6px] rounded py-3 px-[30px] text-white text-lg font-medium font-['Poppins']${
            isChecked ? "text-white bg-[rgba(59,59,59)]" : "text-white"
          }`}
        >
          <p>User Log</p>
        </span>
      </label>
    </>
  );
};

export default Switcher;