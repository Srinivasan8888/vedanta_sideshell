import React, { useState } from "react";
import warning from "../../images/warning.png";

const AlertBox = ({ onClose, partNames }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="h-[287px] w-[809px] rounded-2xl border-2 border-white animate-[blink_1s_ease-in-out_infinite]">
      <style>{`
        @keyframes blink {
          0% { background-color: rgba(0, 0, 0, 0.8); }
          50% { background-color: rgba(255, 0, 0, 0.8); }
          100% { background-color: rgba(0, 0, 0, 0.8); }
        }
      `}</style>
      <div className="flex h-full rounded-2xl">
        <div className="h-full w-[95%] rounded-2xl">
          <div className="flex items-center justify-center h-full space-x-4">
            <div className="flex-shrink-0">
              <img src={warning} className="w-16 h-16" />
            </div>
            <p className="w-[505px] font-['Poppins'] text-base font-medium leading-loose text-white">
              The Temperature of {partNames.join(', ')} within the potline {localStorage.getItem('id')} has reached or
              exceeded the specified limit. Immediate action is required to
              prevent potential damage or safety Hazards.
            </p>
          </div>
        </div>
        <div className="flex h-full w-[5%] justify-end items-start pr-4 pt-4 rounded-2xl ml-auto">
          <button onClick={() => {
            setIsVisible(false);
            if (onClose) onClose();
          }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="white"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertBox;