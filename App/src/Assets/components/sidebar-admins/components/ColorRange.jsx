import React, { useState, useEffect } from "react";
import API from "../../Axios/AxiosInterceptor";
import { Toaster, toast } from "sonner";

const ColorRange = () => {
  // State to manage the values for each range
  const [ranges, setRanges] = useState({
    veryLow: { min: 0, max: 0 },
    low: { min: 0, max: 0 },
    medium: { min: 0, max: 0 },
    high: { min: 0, max: 0 },
    veryHigh: { min: 0, max: 0 },
  });

  const [loading, setLoading] = useState(false);

  // Fetch the latest color range on component mount
  useEffect(() => {
    fetchLatestColorRange();
  }, []);

  // Function to fetch the latest color range
  const fetchLatestColorRange = async () => {
    try {
      setLoading(true);
      console.log("Fetching color range from:", `${process.env.REACT_APP_SERVER_URL}api/admin/getColorRange`);
      
      const response = await API.get(
        `${process.env.REACT_APP_SERVER_URL}api/admin/getColorRange`
      );
      
      console.log("API Response:", response.data);
      
      if (response.data && response.data.data) {
        const data = response.data.data;
        console.log("Setting ranges with data:", data);
        
        setRanges({
          veryLow: { min: data.vlmin || 0, max: data.vlmax || 0 },
          low: { min: data.lmin || 0, max: data.lmax || 0 },
          medium: { min: data.medmin || 0, max: data.medmax || 0 },
          high: { min: data.highmin || 0, max: data.highmax || 0 },
          veryHigh: { min: data.vhighmin || 0, max: data.vhighmax || 0 },
        });
        toast.success(response.data.message || "Color range loaded successfully");
      } else {
        console.log("No data found in response:", response.data);
        toast.error("No color range data found");
      }
    } catch (error) {
      console.error("Error fetching color range:", error);
      console.error("Error details:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to load color range data");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle increment/decrement
  const handleChange = (range, field, increment) => {
    setRanges((prevRanges) => {
      const newValue = prevRanges[range][field] + increment;
      // Ensure value doesn't go below 0
      return {
        ...prevRanges,
        [range]: {
          ...prevRanges[range],
          [field]: newValue >= 0 ? newValue : 0,
        },
      };
    });
  };

  // Function to handle direct input
  const handleInputChange = (range, field, value) => {
    const numValue = parseInt(value) || 0;
    setRanges((prevRanges) => ({
      ...prevRanges,
      [range]: {
        ...prevRanges[range],
        [field]: numValue >= 0 ? numValue : 0,
      },
    }));
  };

  // Function to save color range to database
  const handleSaveColorRange = async () => {
    try {
      setLoading(true);
      const userEmail = localStorage.getItem("email");
        if (!userEmail) {
          toast.error("User email not found. Please log in again.");
          return;
        }

      const dataToSave = {
        vlmin: ranges.veryLow.min,
        vlmax: ranges.veryLow.max,
        lmin: ranges.low.min,
        lmax: ranges.low.max,
        medmin: ranges.medium.min,
        medmax: ranges.medium.max,
        highmin: ranges.high.min,
        highmax: ranges.high.max,
        vhighmin: ranges.veryHigh.min,
        vhighmax: ranges.veryHigh.max,
        email: userEmail
      };

      const response = await API.post(
        `${process.env.REACT_APP_SERVER_URL}api/admin/SaveColorRange`,
        dataToSave
      );
      
      if (response.data && response.data.message) {
        toast.success(response.data.message);
      }
    } catch (error) {
      console.error("Error saving color range:", error);
      toast.error(error.response?.data?.message || "Failed to save color range");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col flex-1 gap-4 px-4 py-4">
        <div className="h-[100%] rounded-2xl border-2 border-white bg-[rgba(16,16,16,0.75)] backdrop-blur-sm">
          <div className="flex h-[10%] items-center justify-between px-6">
            <div className="justify-start font-['Poppins'] text-2xl font-semibold text-white">
              Customize values by colours
            </div>
          </div>
          <div className="m-10 flex h-[80%] flex-col items-center justify-center rounded-lg border bg-[rgba(16,16,16,0.90)] outline outline-1 outline-offset-[-0.50px] outline-white">
            <div className="flex h-[80%] w-full items-center justify-between px-6 text-white">
              <table className="w-full h-full text-left table-auto min-w-max">
                <thead>
                  <tr>
                    <th className="p-4 border-blue-gray-100 bg-blue-gray-50">
                      {" "}
                    </th>
                    <th className="p-4 border-blue-gray-100 bg-blue-gray-50">
                      {" "}
                    </th>
                    <th className="p-4 border-blue-gray-100 bg-blue-gray-50">
                      <p className="justify-start text-center font-['Poppins'] md:text-3xl font-semibold leading-none text-white antialiased">
                        {" "}
                        Min Value
                      </p>
                    </th>
                    <th className="p-4 border-blue-gray-100 bg-blue-gray-50">
                      <p className="justify-start text-center font-['Poppins'] md:text-3xl font-semibold leading-none text-white antialiased">
                        {" "}
                        Max Value
                      </p>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                     <td className="md:p-4 border-blue-gray-50">
                      <div className="bg-green-300 rounded-sm md:h-9 w-9" />
                    </td>
                     <td className="md:p-4 border-blue-gray-50">
                      <p className="justify-start self-stretch font-['Poppins'] md:text-3xl font-medium leading-normal text-white antialiased">
                        Very Low
                      </p>
                    </td>
                    <td className="p-4 text-center border-blue-gray-50">
                      <div className="relative mx-auto flex w-full max-w-[8rem] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleChange("veryLow", "min", -1)}
                          className="p-3 border h-11 rounded-s-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={ranges.veryLow.min}
                          onChange={(e) => handleInputChange("veryLow", "min", e.target.value)}
                          className="block h-11 w-full border-x-0 border-gray-300 py-2.5 text-center text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                          placeholder="000"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleChange("veryLow", "min", 1)}
                          className="p-3 border h-11 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center border-blue-gray-50">
                      <div className="relative mx-auto flex w-full max-w-[8rem] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleChange("veryLow", "max", -1)}
                          className="p-3 border h-11 rounded-s-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={ranges.veryLow.max}
                          onChange={(e) => handleInputChange("veryLow", "max", e.target.value)}
                          className="block h-11 w-full border-x-0 border-gray-300 py-2.5 text-center text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                          placeholder="000"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleChange("veryLow", "max", 1)}
                          className="p-3 border h-11 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                     <td className="md:p-4 border-blue-gray-50">
                      <div className="bg-green-500 rounded-sm h-9 w-9" />
                    </td>
                     <td className="md:p-4 border-blue-gray-50">
                      <p className="justify-start self-stretch font-['Poppins'] md:text-3xl font-medium leading-normal text-white antialiased">
                        Low
                      </p>
                    </td>
                    <td className="p-4 text-center border-blue-gray-50">
                      <div className="relative mx-auto flex w-full max-w-[8rem] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleChange("low", "min", -1)}
                          className="p-3 border h-11 rounded-s-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={ranges.low.min}
                          onChange={(e) => handleInputChange("low", "min", e.target.value)}
                          className="block h-11 w-full border-x-0 border-gray-300 py-2.5 text-center text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                          placeholder="000"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleChange("low", "min", 1)}
                          className="p-3 border h-11 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center border-blue-gray-50">
                      <div className="relative mx-auto flex w-full max-w-[8rem] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleChange("low", "max", -1)}
                          className="p-3 border h-11 rounded-s-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={ranges.low.max}
                          onChange={(e) => handleInputChange("low", "max", e.target.value)}
                          className="block h-11 w-full border-x-0 border-gray-300 py-2.5 text-center text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                          placeholder="000"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleChange("low", "max", 1)}
                          className="p-3 border h-11 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                     <td className="md:p-4 border-blue-gray-50">
                      <div className="bg-yellow-300 rounded-sm h-9 w-9" />
                    </td>
                     <td className="md:p-4 border-blue-gray-50">
                      <p className="justify-start self-stretch font-['Poppins'] md:text-3xl font-medium leading-normal text-white antialiased">
                        Medium
                      </p>
                    </td>
                    <td className="p-4 text-center border-blue-gray-50">
                      <div className="relative mx-auto flex w-full max-w-[8rem] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleChange("medium", "min", -1)}
                          className="p-3 border h-11 rounded-s-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={ranges.medium.min}
                          onChange={(e) => handleInputChange("medium", "min", e.target.value)}
                          className="block h-11 w-full border-x-0 border-gray-300 py-2.5 text-center text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                          placeholder="000"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleChange("medium", "min", 1)}
                          className="p-3 border h-11 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center border-blue-gray-50">
                      <div className="relative mx-auto flex w-full max-w-[8rem] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleChange("medium", "max", -1)}
                          className="p-3 border h-11 rounded-s-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={ranges.medium.max}
                          onChange={(e) => handleInputChange("medium", "max", e.target.value)}
                          className="block h-11 w-full border-x-0 border-gray-300 py-2.5 text-center text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                          placeholder="000"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleChange("medium", "max", 1)}
                          className="p-3 border h-11 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                  <tr>
                     <td className="md:p-4 border-blue-gray-50">
                      <div className="flex items-center rounded-sm h-9 w-9 bg-amber-500" />
                    </td>
                     <td className="md:p-4 border-blue-gray-50">
                      <p className="justify-start self-stretch font-['Poppins'] md:text-3xl font-medium leading-normal text-white antialiased">
                        High{" "}
                      </p>
                    </td>
                    <td className="p-4 text-center border-blue-gray-50">
                      <div className="relative mx-auto flex w-full max-w-[8rem] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleChange("high", "min", -1)}
                          className="p-3 border h-11 rounded-s-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={ranges.high.min}
                          onChange={(e) => handleInputChange("high", "min", e.target.value)}
                          className="block h-11 w-full border-x-0 border-gray-300 py-2.5 text-center text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                          placeholder="000"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleChange("high", "min", 1)}
                          className="p-3 border h-11 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center border-blue-gray-50">
                      <div className="relative mx-auto flex w-full max-w-[8rem] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleChange("high", "max", -1)}
                          className="p-3 border h-11 rounded-s-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={ranges.high.max}
                          onChange={(e) => handleInputChange("high", "max", e.target.value)}
                          className="block h-11 w-full border-x-0 border-gray-300 py-2.5 text-center text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                          placeholder="000"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleChange("high", "max", 1)}
                          className="p-3 border h-11 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>

                   <tr>
                    <td className="p-4">
                      <div className="bg-red-500 rounded-sm h-9 w-9" />
                    </td>
                    <td className="p-4">
                      <p className="justify-start self-stretch font-['Poppins'] md:text-3xl font-medium leading-normal text-white antialiased">
                        Very High
                      </p>
                    </td>
                    <td className="p-4 text-center border-blue-gray-50">
                      <div className="relative mx-auto flex w-full max-w-[8rem] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleChange("veryHigh", "min", -1)}
                          className="p-3 border h-11 rounded-s-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={ranges.veryHigh.min}
                          onChange={(e) => handleInputChange("veryHigh", "min", e.target.value)}
                          className="block h-11 w-full border-x-0 border-gray-300 py-2.5 text-center text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                          placeholder="000"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleChange("veryHigh", "min", 1)}
                          className="p-3 border h-11 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-center border-blue-gray-50">
                      <div className="relative mx-auto flex w-full max-w-[8rem] items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleChange("veryHigh", "max", -1)}
                          className="p-3 border h-11 rounded-s-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m19.5 8.25-7.5 7.5-7.5-7.5"
                            />
                          </svg>
                        </button>
                        <input
                          type="text"
                          value={ranges.veryHigh.max}
                          onChange={(e) => handleInputChange("veryHigh", "max", e.target.value)}
                          className="block h-11 w-full border-x-0 border-gray-300 py-2.5 text-center text-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500 bg-gray-50 text-gray-900 dark:bg-gray-700 dark:text-white"
                          placeholder="000"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => handleChange("veryHigh", "max", 1)}
                          className="p-3 border h-11 rounded-e-lg focus:outline-none focus:ring-2 focus:ring-gray-100 dark:border-gray-600 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 cursor-pointer"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="3 2 18 18"
                            strokeWidth="2"
                            stroke="currentColor"
                            className="w-3 h-3"
                          >
                            <path
                              strokeLinecap="round"
                              stroke="currentColor"
                              strokeLinejoin="round"
                              d="m4.5 15.75 7.5-7.5 7.5 7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex h-[10%] items-center justify-between px-6">
              <button
                type="button"
                onClick={handleSaveColorRange}
                disabled={loading}
                className="mt-4 inline-flex h-10 w-28 items-center justify-center rounded-2xl bg-white px-5 py-2.5 text-center text-sm text-black backdrop-blur-sm hover:bg-gray-100 disabled:opacity-50 md:mt-0 md:h-16 md:w-56 md:font-medium"
              >
                {loading ? "Saving..." : "Set Value"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorRange;

