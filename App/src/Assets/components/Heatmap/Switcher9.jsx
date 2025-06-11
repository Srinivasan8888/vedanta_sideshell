import React, { useState } from "react";

const Switcher9 = ({ onValueChange }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [value, setValue] = useState("Min");
 
  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    const newValue = !isChecked ? "max" : "min";
    setValue(newValue);
    onValueChange(newValue);
    console.log("Value", newValue);
  };

  return (
    <>
      <label className="relative inline-flex items-center justify-center p-1 bg-transparent border rounded-md cursor-pointer select-none themeSwitcherTwo shadow-card w-[210px] h-[55px]">
        <input
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <span
          className={`flex flex-row items-center space-x-[6px] rounded py-3 px-[14px] text-sm font-medium${
            !isChecked ? "text-primary bg-[rgba(0,119,228)]" : "text-body-color"
          }`}
        >
          <p>Min.Value</p>
        </span>
        <span
          className={`flex items-center space-x-[6px] rounded py-3 px-[14px] text-sm font-medium ${
            isChecked ? "text-primary bg-[rgba(0,119,228)]" : "text-body-color"
          }`}
        >
          <p>Max.Value</p>
        </span>
      </label>
    </>
  );
};

export default Switcher9;
