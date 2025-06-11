import React, { useState } from "react";

const Switcher13 = ({ toggleChartType }) => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
    toggleChartType();
  };

  return (
    <>
      <label className='relative inline-flex items-center justify-center p-1 bg-transparent border rounded-md cursor-pointer select-none themeSwitcherTwo shadow-card w-[96px] h-[35.91px]'>
        <input
          type="checkbox"
          className="sr-only"
          checked={isChecked}
          onChange={handleCheckboxChange}
        />
        <span
          className={`flex items-center space-x-[6px] rounded py-2 px-[13px] text-sm font-medium${!isChecked ? "text-primary bg-[rgba(0,119,228)]" : "text-body-color"
            }`}
        >
          <svg width="16.551758" height="17.051758" viewBox="0 0 16.5518 17.0518" fill="none" >
            <defs>
              <clipPath id="clip169_286">
                <rect id="ooui:chart" rx="3.500000" width="15.551723" height="16.051685" transform="translate(0.500000 0.500000)" fill="white" fill-opacity="0" />
              </clipPath>
            </defs>
            <rect id="ooui:chart" rx="3.500000" width="15.551723" height="16.051685" transform="translate(0.500000 0.500000)" fill="#FFFFFF" fill-opacity="0" />
            <g clip-path="url(#clip169_286)">
              <path id="Vector" d="M2.48 2.55L0.82 2.55L0.82 16.19L15.72 16.19L15.72 14.49L2.48 14.49L2.48 2.55Z" fill="#FFFFFF" fill-opacity="1.000000" fill-rule="nonzero" />
              <path id="Vector" d="M9.1 9.37L6.62 7.67L3.31 11.08L3.31 13.64L14.89 13.64L14.89 4.26L9.1 9.37Z" fill="#FFFFFF" fill-opacity="1.000000" fill-rule="nonzero" />
            </g>
          </svg>




        </span>
        <span
          className={`flex items-center space-x-[6px] rounded py-2 px-[13px] text-sm font-medium ${isChecked ? "text-primary bg-[rgba(0,119,228)]" : "text-body-color"
            }`}
        >
          <svg
            width="22.588135"
            height="14.859863"
            viewBox="0 0 22.5881 14.8599"
            fill="none"
          >
          
            <defs>
              <clipPath id="clip169_277">
                <rect
                  id="icon-park-outline:chart-stock"
                  rx="3.500000"
                  width="21.588234"
                  height="13.859664"
                  transform="translate(0.500000 0.500000)"
                  fill="white"
                  fill-opacity="0"
                />
              </clipPath>
            </defs>
            <rect
              id="icon-park-outline:chart-stock"
              rx="3.500000"
              width="21.588234"
              height="13.859664"
              transform="translate(0.500000 0.500000)"
              fill="#FFFFFF"
              fill-opacity="0"
            />
            <g clip-path="url(#clip169_277)">
              <path
                id="Vector"
                d="M6.58 4.95L6.58 9.9L2.82 9.9L2.82 4.95L6.58 4.95Z"
                stroke="#FFFFFF"
                stroke-opacity="1.000000"
                stroke-width="2.000000"
                stroke-linejoin="round"
              />
              <path
                id="Vector"
                d="M4.7 1.85L4.7 4.95M4.7 9.9L4.7 13"
                stroke="#FFFFFF"
                stroke-opacity="1.000000"
                stroke-width="2.000000"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <path
                id="Vector"
                d="M19.76 4.95L19.76 9.9L16 9.9L16 4.95L19.76 4.95Z"
                stroke="#FFFFFF"
                stroke-opacity="1.000000"
                stroke-width="2.000000"
                stroke-linejoin="round"
              />
              <path
                id="Vector"
                d="M17.88 1.85L17.88 4.95M17.88 9.9L17.88 13"
                stroke="#FFFFFF"
                stroke-opacity="1.000000"
                stroke-width="2.000000"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <path
                id="Vector"
                d="M13.17 4.33L13.17 9.28L9.41 9.28L9.41 4.33L13.17 4.33Z"
                stroke="#FFFFFF"
                stroke-opacity="1.000000"
                stroke-width="2.000000"
                stroke-linejoin="round"
              />
              <path
                id="Vector"
                d="M11.29 1.23L11.29 4.33M11.29 9.28L11.29 12.38"
                stroke="#FFFFFF"
                stroke-opacity="1.000000"
                stroke-width="2.000000"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
            </g>
          </svg>
        </span>
      </label>
    </>
  );
};

export default Switcher13;
