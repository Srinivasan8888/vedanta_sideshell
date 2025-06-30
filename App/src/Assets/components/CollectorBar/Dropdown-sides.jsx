import React, { useState, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import axios from "axios";

const DropdownSides = ({ selectedside, setSelectedside }) => {
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
      setSelectedside(option); // Update to set the selected option directly
    };

    
  // Define the two options we want to show
  const sideOptions = ['Aside', 'Bside'];

  return (
    <div className="items-end justify-end mt-4 ml-2 md:mt-0">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <MenuButton className="inline-flex w-64 justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 backdrop-blur-[8px] shadow-[inset_4px_4px_4px_0_rgba(0,0,0,0.25)]">
            {selectedside || "Select Side"}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </MenuButton>
        </div>

        <MenuItems
          transition
          className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
        >
          <div className="py-1">
            {sideOptions.map((option, index) => (
              <MenuItem key={index}>
                {({ active }) => (
                  <button
                    type="button"
                    onClick={() => setSelectedside(option)}
                    className={`${
                      active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                    } block w-full px-4 py-2 text-left text-sm`}
                  >
                    {option}
                  </button>
                )}
              </MenuItem>
            ))}
          </div>
        </MenuItems>
      </Menu>
    </div>
  )
}

export default DropdownSides