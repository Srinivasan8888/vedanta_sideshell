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

// InfoCard component for displaying user information in cards
const InfoCard = ({ icon, label, value }) => (
  <div className="bg-gray-400/50 p-4 rounded-lg border border-gray-200">
    <div className="flex items-center space-x-3">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
        {icon}
      </div>
      <div className="text-left">
        <p className="text-xs font-medium text-white">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  </div>
);

// InfoField component for displaying form-like information fields
const InfoField = ({ label, value, icon }) => {
  const getIcon = () => {
    switch (icon) {
      case 'user':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'mail':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'phone':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
        );
      case 'id':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        );
      case 'shield':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-white">{label}</label>
      <div className="mt-1 relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {getIcon()}
        </div>
        <input
          type="text"
          readOnly
          value={value}
          className="focus:ring-blue-500 border focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-xl py-2 bg-gray-400/50 text-white"
        />
      </div>
    </div>
  );
};

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
    console.log('fetchUserData called');
    const email = localStorage.getItem("email");
    console.log('Retrieved email from localStorage:', email);
    
    if (!email) {
      console.error('No email found in localStorage');
      setIsLoading(false);
      return;
    }
    
    // Check if we have a recent cache (less than 5 minutes old)
    const cacheKey = 'userDataCache';
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const now = new Date().getTime();
    
    if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp, 10)) < 5 * 60 * 1000) {
      console.log('Using cached user data');
      setUserData(JSON.parse(cachedData));
      setIsLoading(false);
      return;
    }
    
    console.log('Fetching fresh user data from API');
    setIsLoading(true);
    
    const apiUrl = `${process.env.REACT_APP_SERVER_URL}api/admin/getUserDetails`;
    console.log('API URL:', apiUrl);
    
    API.post(apiUrl, { email })
      .then(response => {
        console.log('API Response:', response);
        if (response.data && response.data.data) {
          const userData = response.data.data;
          console.log('User data received:', userData);
          setUserData(userData);
          // Cache the data with timestamp
          localStorage.setItem(cacheKey, JSON.stringify(userData));
          localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
        } else {
          console.error('Unexpected API response format:', response);
        }
      })
      .catch(error => {
        console.error("Error fetching user data:", error);
        if (error.response) {
          console.error('Error response data:', error.response.data);
          console.error('Error status:', error.response.status);
          console.error('Error headers:', error.response.headers);
        } else if (error.request) {
          console.error('No response received:', error.request);
        } else {
          console.error('Error setting up request:', error.message);
        }
        // Use cached data if available
        if (cachedData) {
          console.log('Falling back to cached data');
          setUserData(JSON.parse(cachedData));
        }
      })
      .finally(() => {
        console.log('Finished loading user data');
        setIsLoading(false);
      });
  }, []); // Empty dependency array since we're using localStorage

  useEffect(() => {
    console.log('Settings component mounted, fetching user data...');
    
    // Initial fetch
    fetchUserData();
    
    // Set up a refresh interval (e.g., every 5 minutes)
    const refreshInterval = setInterval(() => {
      console.log('Refreshing user data...');
      fetchUserData();
    }, 5 * 60 * 1000);
    
    // Also refresh when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing data...');
        fetchUserData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up Settings component...');
      clearInterval(refreshInterval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchUserData]); // Include fetchUserData in dependencies

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
    <div className="min-h-screen overflow-hidden">
      
      <div className="flex ">
        {isAdminUser && <Adminsidebar />}
        
        <main className="flex-1 p-6 ">
          {/* Welcome Card */}
          <div className="bg-[#101010]/90 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Profile Picture */}
                <div className="flex-shrink-0">
                  <div className="h-32 w-32 rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
                    {userData?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                </div>
                
                {/* User Info */}
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Welcome, {userData?.name || 'User'}
                  </h1>
                  <p className="text-gray-400 mb-6">Manage your account settings and preferences</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <InfoCard 
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      }
                      label="Name"
                      value={userData?.name || 'N/A'}
                    />
                    <InfoCard 
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      }
                      label="Role"
                      value={userData?.role || 'N/A'}
                    />
                    <InfoCard 
                      icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                        </svg>
                      }
                      label="Employee ID"
                      value={userData?.empid || 'N/A'}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information Card */}
          <div className="bg-[#101010]/90 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Personal Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoField 
                  label="Full Name"
                  value={userData?.name || 'N/A'}
                  icon="user"
                />
                <InfoField 
                  label="Email Address"
                  value={userData?.email || 'N/A'}
                  icon="mail"
                />
                <InfoField 
                  label="Phone Number"
                  value={userData?.phoneno || 'N/A'}
                  icon="phone"
                />
                <InfoField 
                  label="Employee ID"
                  value={userData?.empid || 'N/A'}
                  icon="id"
                />
                <div className="md:col-span-2">
                  <InfoField 
                    label="User Role"
                    value={userData?.role || 'N/A'}
                    icon="shield"
                  />
                </div>
              </div>
              
              {/* <div className="mt-8 flex justify-end">
                <button className="px-6 py-2.5 bg-blue-700 text-white font-medium text-sm leading-tight rounded-md shadow-md hover:bg-blue-600 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out flex items-center border border-blue-500/30">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Profile
                </button>
              </div> */}
            </div>
          </div>
        </main>
      </div>
    </div>

  );
};

export default Settings;
