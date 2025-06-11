import React, { useState, useEffect } from "react";
import adduser from "./img/Vector.svg";
import "../../miscellaneous/Scrollbar.css";
import Switcher from "./comp/switcher.jsx"
import Table from "../../common/Table";
import axios from "axios";
import { Toaster, toast } from "sonner";
import API from "../../Axios/AxiosInterceptor.jsx";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const User = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTable, setActiveTable] = useState("UserP");
  const [tableAData, setTableAData] = useState([]);
  const [tableBData, setTableBData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [role, setRole] = useState("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmpassword, setconfirmPassword] = useState("");
  const [phoneno, setPhoneno] = useState("");
  const [empid, setEmpid] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Function to fetch users from API
  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}api/admin/getUsers`);
      const currentUserRole = localStorage.getItem('role');

      if (response.data && response.data.data) {
        // Filter out superadmin users if current user is admin
        let filteredUsers = response.data.data;
        if (currentUserRole === 'admin') {
          filteredUsers = filteredUsers.filter(user => user.role !== 'superadmin');
        }

        // Transform the API data to match our table structure
        const transformedData = filteredUsers.map((user, index) => ({
          sno: index + 1, // Increment serial number starting from 1
          name: user.name || 'N/A',
          email: user.email || 'N/A',
          role: user.role || 'N/A',
          Employee: user.empid || 'N/A',
          phone: user.phoneno ? `+91 ${user.phoneno}` : 'N/A' // Add +91 prefix to phone number
        }));

        setTableAData(transformedData);

        // For Table B (User Activity Log), we'll fetch real data from the API
        setTableBData([]); // This will be populated by fetchUserLogs useEffect
      } else {
        setError("No data received from the server");
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to fetch users. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const registerUser = async (event) => {
    event.preventDefault();
    if (confirmpassword != password) {
      alert("Password is not matching, please check the password and try again!!!")
    }
    if (confirmpassword === password) {
      try {
        const response = await API.post(
          `${process.env.REACT_APP_SERVER_URL}auth/register`,
          {
            name,
            email,
            password,
            phoneno,
            role,
            empid
          }
        );

        // Check if the response indicates success
        if (response.status === 201 && response.data.success) {
          toast.success("User registered successfully");
          // Close the modal
          setIsModalOpen(false);
          // Refresh the user list after adding a new user
          await fetchUsers(); // Ensure this is awaited to handle any async issues
        } else {
          toast.error("Unknown error has occurred");
        }
      } catch (error) {
        setErrorMessage(
          `Failed to register: ${error.response?.data?.error?.message || error.message}`,
        );
        toast.error(`Failed to register: ${error.response?.data?.error?.message || error.message}`);
      }
    } else {
      toast.error("Password is not matching");
    }
  };

  // Function to fetch user logs from API
  const fetchUserLogs = async () => {
    // setIsLoading(true); // You might want to set loading for this table too
    // setError(null);
    try {
      const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}api/admin/getUserLogs`);

      if (response.data && response.data.data) {
        // Create a copy of the array and reverse it to show most recent first
        const reversedData = [...response.data.data].reverse();
        // Transform the API data to match our table structure
        const transformedData = reversedData.map((log, index) => {
          let methodDisplay;
          const methodName = log.method ? log.method.toLowerCase() : '';

          if (methodName === 'login') {
            methodDisplay = <span className="text-green-500 font-medium">{log.method}</span>;
          } else if (methodName === 'logout') {
            methodDisplay = <span className="text-red-500 font-medium">{log.method}</span>;
          } else {
            // Default styling if method is neither login nor logout, or is undefined/null
            methodDisplay = <span className="text-gray-700 dark:text-gray-300 font-medium">{log.method || 'N/A'}</span>;
          }

          return {
            sno: index + 1,
            userId: log.userId || 'N/A',
            email: log.email || 'N/A',
            ip: log.ip || 'N/A',
            method: methodDisplay, // Use the JSX element here
            city: log.city || 'N/A',
            country: log.country || 'N/A',
            latitude: log.latitude || 'N/A',
            longitude: log.longitude || 'N/A',
            service: log.service || 'N/A',
            region: log.region || 'N/A',
            loginAt: log.loginAt ? new Date(parseInt(log.loginAt)).toLocaleString() : 'N/A'
          };
        });

        setTableBData(transformedData);
      } else {
        setError("No user logs received from the server"); // This error might conflict if fetchUsers also sets errors
      }
    } catch (err) {
      console.error("Error fetching user logs:", err);
      // setError("Failed to fetch user logs. Please try again later."); // Be mindful of error state shared with fetchUsers
      toast.error("Failed to fetch user logs."); // Use toast for specific log errors
    } finally {
      // setIsLoading(false); // Corresponding loading state for this fetch
    }
  };


  // Load user logs when component mounts
  useEffect(() => {
    fetchUserLogs();
  }, []);

  // Table A column headers
  const tableAHeaders = [
    { id: "sno", label: "S.No" },
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "role", label: "Role" },
    { id: "Employee", label: "Employee ID" },
    { id: "phone", label: "phone no" }
  ];

  // Table B column headers
  const tableBHeaders = [
    { id: "sno", label: "S.No" },
    { id: "email", label: "Email" },
    { id: "ip", label: "IP Address" },
    { id: "method", label: "Method" },
    { id: "city", label: "City" },
    { id: "country", label: "Country" },
    { id: "latitude", label: "Latitude" },
    { id: "longitude", label: "Longitude" },
    { id: "service", label: "Service Provider" },
    { id: "region", label: "Region" },
    { id: "loginAt", label: "Login Time" }
  ];

  // Action icons for the table
  const editIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
      <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
    </svg>
  );

  const deleteIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
      className="w-8 h-8"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
      />
    </svg>
  );

  // Handle action button clicks
  const handleEditClick = (row) => {
    // Set the selected user for editing
    setSelectedUser(row);

    // Extract phone number without the +91 prefix
    const phoneNumber = row.phone.replace('+91 ', '');

    // Populate the form fields with the user's data
    setName(row.name);
    setEmail(row.email);
    setRole(row.role);
    setPhoneno(phoneNumber);
    setEmpid(row.Employee);

    // Clear password fields as we don't want to show the hashed password
    setPassword('');
    setconfirmPassword('');

    // Set edit mode to true
    setIsEditMode(true);

    // Open the modal
    setIsModalOpen(true);
  };

  const handleDeleteClick = async (row) => {
    // Show confirmation dialog
    if (window.confirm(`Are you sure you want to delete user ${row.name}?`)) {
      try {
        // Make API call to delete the user
        const response = await API.delete(
          `${process.env.REACT_APP_SERVER_URL}api/admin/deleteUsers/${row.email}`
        );

        // Check if the response indicates success
        if (response.data && response.data.success) {
          toast.success("User deleted successfully");
          // Refresh the user list
          await fetchUsers(); // Ensure this is awaited to handle any async issues
        } else {
          toast.error(response.data?.message || "Failed to delete user");
        }
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error(`Failed to delete user: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Define table actions
  const tableActions = [
    {
      icon: editIcon,
      onClick: handleEditClick,
      label: "Edit"
    },
    {
      icon: deleteIcon,
      onClick: handleDeleteClick,
      label: "Delete"
    }
  ];

  const handleSwitch = (value) => {
    setActiveTable(value);
  };

  // Handle form submission for both create and update
  const handleSubmit = async (event) => {
    event.preventDefault();

    // If not in edit mode (i.e., creating new user), check user limit
    if (!isEditMode) {
      try {
        // First, fetch the current users to check the count of regular users
        const [usersResponse, limitsResponse] = await Promise.all([
          API.get(`${process.env.REACT_APP_SERVER_URL}api/admin/getUsers`),
          API.get(`${process.env.REACT_APP_SERVER_URL}api/admin/getLimitsValue`)
        ]);
        
        const users = usersResponse.data?.data || [];
        const userCount = users.filter(user => user.role === 'user').length;
        const userLimit = parseInt(limitsResponse.data?.adminuserlimit || '3', 10);
        
        if (userCount >= userLimit) {
          toast.error(`You have reached the maximum limit of ${userLimit} users`);
          return;
        }
      } catch (error) {
        console.error('Error checking user limit:', error);
        toast.error('Failed to check user limit. Please try again.');
        return;
      }
    }
    // If in edit mode, update the user
    if (isEditMode) {
      try {
        setIsSaving(true);

        // Prepare update data
        const updateData = {
          name,
          role,
          phoneno,
          empid
        };

        // Only include password if it's provided
        if (password) {
          if (password !== confirmpassword) {
            toast.error("Passwords do not match");
            setIsSaving(false);
            return;
          }
          updateData.password = password;
        }

        // Make API call to update the user using API instance
        const response = await API.put(
          `${process.env.REACT_APP_SERVER_URL}api/admin/updateUsers/${email}`,
          updateData
        );

        if (response.data && response.data.success) {
          toast.success("User updated successfully");
          setIsModalOpen(false);
          // Reset form and edit mode
          resetForm();
          // Refresh the user list
          fetchUsers();
        } else {
          toast.error(response.data?.message || "Failed to update user");
        }
      } catch (error) {
        console.error("Error updating user:", error);
        toast.error(`Failed to update user: ${error.response?.data?.message || error.message}`);
      } finally {
        setIsSaving(false);
      }
    } else {
      // If not in edit mode, register a new user
      registerUser(event);
    }
  };

  // Reset form fields
  const resetForm = () => {
    setName("");
    setEmail("");
    setPassword("");
    setconfirmPassword("");
    setRole("user");
    setPhoneno("");
    setEmpid("");
    setIsEditMode(false);
    setSelectedUser(null);
  };

  // Close modal and reset form
  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="flex flex-col w-full h-full">
      <Toaster position="top-right" richColors />
      <div className="flex flex-col justify-between md:flex-row">
        <div className="flex items-start justify-start gap-5 p-4">
          {localStorage.getItem('role') === 'superadmin' && <Switcher onSwitch={handleSwitch} />}
          {/* <button className="flex h-16 w-44 items-center justify-center gap-2 rounded-lg bg-[#101010]/90 outline outline-1 outline-offset-[-0.50px] outline-white backdrop-blur-sm">
            <div className="font-['Poppins'] text-lg font-medium text-white">
              Sort By
            </div>
            <svg
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="bx:sort">
                <path
                  id="Vector"
                  d="M8 16.5H4L10 22.5V2.5H8V16.5ZM14 5.5V22.5H16V8.5H20L14 2.5V5.5Z"
                  fill="white"
                />
              </g>
            </svg>
          </button> */}
        </div>
        <div className="flex items-center justify-center p-4 md:items-end md:justify-end">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="mb-2 me-2 inline-flex items-center rounded-lg px-5 py-2.5 text-center text-sm font-medium bg-[#050708] text-white hover:bg-[#050708]/90 focus:ring-4 focus:ring-[#050708]/50 dark:hover:bg-[#050708]/30 dark:focus:ring-[#050708]/50 cursor-pointer md:h-16 md:w-44"
          >
            <img src={adduser} alt="adduser" className="w-5 h-5 -ms-1 me-2" />
            Add User
          </button>
        </div>
      </div>
      <div className="flex flex-col flex-1 gap-4 px-4 py-4 rounded-2xl overflow-hidden">
        <div className="rounded-2xl border-2 border-white bg-[#101010]/90 backdrop-blur-sm h-full min-h-[95%] max-h-[calc(100vh-250px)] flex flex-col">
          <Table
            headers={activeTable === "UserP" ? tableAHeaders : tableBHeaders}
            data={activeTable === "UserP" ? tableAData : tableBData}
            isLoading={isLoading}
            error={error}
            actions={activeTable === "UserP" ? tableActions : []}
            actionLabel={activeTable === "UserP" ? "Actions" : null}
            headerClassName="bg-[rgba(59,59,59)]"
            className="overflow-y-hidden"
          />
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleCloseModal}
          />

          {/* Modal content */}
          <div className="relative z-50 w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditMode ? "Edit User" : "Add New User"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required="true"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email Id
                </label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                  placeholder="name@company.com"
                  required="true"
                  disabled={isEditMode} // Disable email field in edit mode
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Password {isEditMode && "(Leave blank to keep current password)"}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    required={!isEditMode} // Only required for new users
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="w-5 h-5 text-gray-500" />
                    ) : (
                      <FaEye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label
                  htmlFor="confirm-password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  Confirm Password {isEditMode && "(Leave blank to keep current password)"}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm-password"
                    value={confirmpassword}
                    onChange={(e) => setconfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                    required={!isEditMode} // Only required for new users
                  />
                  <button
                    type="button"
                    onClick={toggleConfirmPasswordVisibility}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                  >
                    {showConfirmPassword ? (
                      <FaEyeSlash className="w-5 h-5 text-gray-500" />
                    ) : (
                      <FaEye className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    +91
                  </span>
                  <input
                    type="text"
                    name="phoneno"
                    value={phoneno}
                    onChange={(e) => {
                      // Only allow digits and limit to 10 characters
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setPhoneno(value);
                    }}
                    className="w-full p-2.5 pl-12 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter 10-digit mobile number"
                    maxLength="10"
                    required="true"
                  />
                </div>
                {/* <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Format: +91 followed by 10-digit mobile number
                </p> */}
              </div>

              <div>
                <label
                  for="confirm-password"
                  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                >
                  User Role
                </label>

                <select
                  required
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                  }}
                  className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-gray-900 focus:border-primary-600 focus:ring-primary-600 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 dark:focus:border-blue-500 dark:focus:ring-blue-500"
                >
                  {localStorage.getItem('role') === 'superadmin' ? (
                    <>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      <option value="superadmin">Super-Admin</option>
                    </>
                  ) : (
                    <option value="user">User</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Employee ID
                </label>
                <input
                  type="text"
                  name="empid"
                  value={empid}
                  onChange={(e) => setEmpid(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required="true"
                />
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isSaving ? (
                    <>
                      <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditMode ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    isEditMode ? 'Update User' : 'Add User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default User;
