import React, { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";

const Dropdown = ({ selected, setSelected, selectedSide }) => {
  const [options, setOptions] = useState([]);

  // useEffect(() => {
  //     const fetchOptions = async () => {
  //         try {
  //             const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}api/v2/getcbname`);
  //             setOptions(response.data);
  //         } catch (error) {
  //             console.error("Error fetching data:", error);
  //         }
  //     };
  //     fetchOptions();
  // }, []);

  // const handleRadioChange = (option) => {
  //   setSelected(option); // Update to set the selected option directly
  // };

  useEffect(() => {
    // Generate sensor options with display names based on selected side
    const sensors = Array.from({ length: 12 }, (_, i) => {
      const sensorValue = `sensor${i + 1}`;
      let displayName;

      if (selectedSide === "Aside") {
        // East side: es1, es2, etc.
        displayName = `ES${i + 1}`;
      } else if (selectedSide === "Bside") {
        // West side: ws1, ws2, etc.
        displayName = `WS${i + 13}`;
      } else {
        // Default fallback
        displayName = sensorValue;
      }

      return {
        value: sensorValue,
        display: displayName,
      };
    });
    setOptions(sensors);
  }, [selectedSide]);

  return (
    <div className="ml-2 mt-4 items-end justify-end md:mt-0">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="inline-flex h-8 w-24 justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-[inset_4px_4px_4px_0_rgba(0,0,0,0.25)] ring-1 ring-inset ring-gray-300 backdrop-blur-[8px] hover:bg-gray-50">
            {selected
              ? options.find((opt) => opt.value === selected)?.display ||
                selected
              : "Select Configuration"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-5"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </MenuButton>
        </div>

        <MenuItems
          transition
          className="absolute right-0 z-10 mt-2 max-h-96 w-24 origin-top-right overflow-auto rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
        >
          <div className="py-1">
            {options.map((option, index) => (
              <MenuItem key={index}>
                <button
                  type="button"
                  onClick={() => setSelected(option.value)}
                  className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                >
                  {option.display}
                </button>
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  );
};

export default Dropdown;
