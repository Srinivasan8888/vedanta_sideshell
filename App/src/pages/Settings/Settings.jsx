import React, { useEffect, useState, useCallback, useRef } from "react";
import Adminsidebar from "../../Assets/components/sidebar-admins/adminsidebar";
import { Routes, Route, useLocation } from "react-router-dom";
import Generatereport from "../../Assets/components/sidebar-admins/components/Generatereport";
import Alert from "../../Assets/components/sidebar-admins/components/Alert";
import ColorRange from "../../Assets/components/sidebar-admins/components/ColorRange";
import User from "../../Assets/components/sidebar-admins/components/User";
import Alertslogs from "../../Assets/components/sidebar-admins/components/Alertslogs";
import API from "../../Assets/components/Axios/AxiosInterceptor";
import Navbar from "../../Assets/Navbar/Navbar";
const Settings = () => {
  const location = useLocation();
  const [userData, setUserData] = useState(() => {
    // Initialize with cached data if available
    const cachedData = {};
    const cachedKeys = Object.keys(localStorage).filter(key => key.startsWith('settings'));
    cachedKeys.forEach(key => {
      cachedData[key.replace('settings', '').charAt(0).toLowerCase() + key.replace('settings', '').slice(1)] = localStorage.getItem(key);
    });
    return Object.keys(cachedData).length > 0 ? cachedData : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserData = useCallback(() => {
    const email = localStorage.getItem("email");
    if (email) {
      setIsLoading(true);
      API.post(`${process.env.REACT_APP_SERVER_URL}api/admin/getUserDetails`, { email })
        .then(response => {
          const userData = response.data.data;
          if (userData) {
            setUserData(userData);
            // Store each user data field in localStorage with 'settings' prefix
            Object.entries(userData).forEach(([key, value]) => {
              if (value !== null && value !== undefined) {
                localStorage.setItem(`settings${key.charAt(0).toUpperCase() + key.slice(1)}`, value);
              }
            });
          }
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
          // If we have cached data, don't show an error to the user
          if (!userData) {
            // Handle error state if needed
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    fetchUserData();
    
    // Set up a refresh interval (e.g., every 5 minutes)
    const refreshInterval = setInterval(fetchUserData, 5 * 60 * 1000);
    
    // Also refresh when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchUserData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUserData]);

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (email) {
      API.post(`${process.env.REACT_APP_SERVER_URL}auth/get-role`, { email })
        .then(response => {
          if (response.data.success) {
            setUserData({
              ...userData,
              role: response.data.role
            });
            localStorage.setItem('userData', JSON.stringify({
              ...userData,
              role: response.data.role
            })); // Optional: cache it
          } else {
            throw new Error("Failed to fetch user role");
          }
        })
        .catch(error => {
          console.error("Error fetching user role:", error);
          const storedUser = localStorage.getItem('userData');
          if (storedUser) {
            setUserData(JSON.parse(storedUser));
          }
        });
    }
  }, []);

  // Check if user is admin or superadmin
  const isAdminUser = userData && (userData.role === 'admin' || userData.role === 'superadmin');

  return (
    <div>
      {!isAdminUser && <Navbar onLogout={() => {}} />}
      
      <div className="flex flex-row w-full h-full">
        <div className=" h-full ">
          {isAdminUser ? <Adminsidebar /> : ""}
        </div>

        <div className="w-full h-full text-white">
          
        
          <div className="flex h-[100%] flex-1 flex-col content-between gap-16 px-4 py-4">
          
            <div className="flex h-[45%] w-full rounded-2xl border-2 border-white bg-[rgba(16,16,16,0.75)] backdrop-blur-sm">
              <div className="w-full">
                <div className="flex h-[20%] items-center justify-start pl-5 font-['Poppins'] text-lg font-bold">
                  Welcome {userData ? userData.name : "Error"}
                </div>
                <div className="flex h-[60%] items-center justify-center">
                  <div className="font-['Poppins'] flex h-28 w-28 items-center justify-center rounded-full border-[5px] border-white text-3xl font-bold">
                    {userData?.name?.charAt(0).toUpperCase() || "E"}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center w-full">
                <table className="h-[40%] w-full table-auto py-14">
                  <tbody>
                    <tr>
                      <th className="flex items-center justify-center h-full pr-4">
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
                            d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                          />
                        </svg>
                      </th>
                      <td className="text-center">
                        {userData ? userData.name : "Error"}
                      </td>
                    </tr>
                    <tr>
                      <th className="flex items-center justify-center h-full pr-4">
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
                            d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                          />
                        </svg>
                      </th>
                      <td className="text-center">{userData ? userData.role : "Error"}</td>
                    </tr>
                    <tr>
                      <th className="flex items-center justify-center h-full pr-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Zm6-10.125a1.875 1.875 0 1 1-3.75 0 1.875 1.875 0 0 1 3.75 0Zm1.294 6.336a6.721 6.721 0 0 1-3.17.789 6.721 6.721 0 0 1-3.168-.789 3.376 3.376 0 0 1 6.338 0Z" />
                        </svg>
                      </th>
                      <td className="text-center">{userData ? userData.empid : "Error"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div>
                {/* <button className="m-14 rounded-lg bg-[#101010]/70 outline outline-1 outline-offset-[-0.50px] outline-white">
                  <div className="flex items-center justify-center w-24 h-12 gap-3 text-center">
                    Edit
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 28 28"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                      />
                    </svg>
                  </div>
                </button> */}
              </div>
            </div>
            <div className="flex h-[50%] rounded-2xl border-2 border-white bg-[rgba(16,16,16,0.75)] backdrop-blur-sm">
              <div className="w-full">
                <div className="flex h-[20%] items-center justify-start pl-5 font-['Poppins'] text-lg font-bold">
                  Personal Information
                </div>
                <div className="flex h-[50%] w-full justify-center">
                  <table className="table-auto w-[60%]">
                    <tbody>
                      <tr>
                        <th className="pr-4 text-base font-semibold text-center text-zinc-400 ">First Name
                        <td className="flex items-center justify-center text-base font-normal text-white">
                          {userData ? userData.name : "Error"}
                        </td>
                        </th>
                        <th className="pr-4 text-base font-semibold text-center text-zinc-400 ">Email Address
                        <td className="flex items-center justify-center text-base font-normal text-white">
                          {userData ? userData.email : "Error"}
                        </td>
                        </th>
                      </tr>
                      <tr>
                      <th className="pr-4 text-base font-semibold text-center text-zinc-400 ">Phone Number
                        <td className="flex items-center justify-center text-base font-normal text-white">
                          {userData ? userData.phoneno : "Error"}
                        </td>
                        </th>
                        <th className="pr-4 text-base font-semibold text-center text-zinc-400 ">Employee Id
                        <td className="flex items-center justify-center text-base font-normal text-white">
                          {userData ? userData.empid : "Error"}
                        </td>
                        </th>
                      </tr>
                      
                      <tr>
                      <th className="pr-4 text-base font-semibold text-center text-zinc-400 ">User Role
                        <td className="flex items-center justify-center text-base font-normal text-white">
                          {userData ? userData.role : "Error"}
                        </td>
                        </th>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
              </div>
              <div className="flex items-center justify-center w-[20%]">
               
              </div>
              <div>
                {/* <button className="m-14 rounded-lg bg-[#101010]/70 outline outline-1 outline-offset-[-0.50px] outline-white">
                  <div className="flex items-center justify-center w-24 h-12 gap-3 text-center">
                    Edit
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 28 28"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="size-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
                      />
                    </svg>
                  </div>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
