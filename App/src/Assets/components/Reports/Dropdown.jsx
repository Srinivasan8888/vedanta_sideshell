import React, { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import axios from "axios";

const Dropdown = ({ selected, setSelected }) => {
    const [options, setOptions] = useState([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}api/v2/getcbname`);
                setOptions(response.data);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchOptions();
    }, []);

    const handleRadioChange = (option) => {
      setSelected(option); // Update to set the selected option directly
    };

    
  return (
     <div className="items-end justify-end mt-4 ml-2 md:mt-0">
        <Menu as="div" className="relative inline-block text-left">
          <div>
            <MenuButton className="inline-flex w-64 justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 backdrop-blur-[8px] shadow-[inset_4px_4px_4px_0_rgba(0,0,0,0.25)]">
              {selected || "Select Configuration"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
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
        className="absolute right-0 z-10 mt-2 w-56 max-h-96 overflow-auto origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-100 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
      >
         <MenuItem>
              <button
                type="button" 
                onClick={() => setSelected("All-Data")} 
                className="block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
              >
                All-Data
              </button>
            </MenuItem>
            <div className="py-1">
              {options.map((option, index) => (
                <MenuItem key={index}>
                  <button
                    type="button" 
                    onClick={() => setSelected(option)} 
                    className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none"
                  >
                    {option}
                  </button>
                </MenuItem>
              ))}
              <form action="#" method="POST">
                // ... existing code ...
              </form>
            </div>
          </MenuItems>
    </Menu>
  </div>
  )
}

export default Dropdown