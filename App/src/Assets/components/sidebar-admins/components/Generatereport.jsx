import React, { useState, useEffect } from 'react';
import adduser from "./img/Vector.svg";
import "../../miscellaneous/Scrollbar.css";
import { Toaster, toast } from 'sonner'
import API from '../../Axios/AxiosInterceptor';

const Generatereport = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    employeeNo: ''
  });
  const [editFormData, setEditFormData] = useState({
    id: '',
    name: '',
    email: '',
    employeeNo: ''
  });
  const [frequencyOptions, setFrequencyOptions] = useState([]);
  const [selectedFrequency, setSelectedFrequency] = useState('');
  const [selectedRadioFrequency, setSelectedRadioFrequency] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [reportUsers, setReportUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [frequencyData, setFrequencyData] = useState([]);

  useEffect(() => {
    fetchFrequencyOptions();
    fetchReportUsers();
    fetchFrequencyData();
  }, []);

  const fetchReportUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await API.get(
        `${process.env.REACT_APP_SERVER_URL}api/admin/getReportUsers`
      );
      setReportUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching report users:", error);
      toast.error("Failed to load report users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchFrequencyData = async () => {
    try {
      setIsLoading(true);
      const response = await API.get(
        `${process.env.REACT_APP_SERVER_URL}api/admin/getFrequency`
      );
      
      if (response.data && response.data.data) {
        // Store the single frequency object
        setFrequencyData([response.data.data]);
        // Set the frequency from API response
        setSelectedRadioFrequency(response.data.data.frequency);
      }
    } catch (error) {
      console.error("Error fetching frequency data:", error);
      toast.error("Failed to load frequency data");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFrequencyOptions = async () => {
    try {
      setIsLoading(true);
      const response = await API.get(
        `${process.env.REACT_APP_SERVER_URL}api/v2/getuniqueids`
      );
      const ids = response.data.ids;
      setFrequencyOptions(ids);
      
      // Only set default if we don't have frequency data yet
      if (ids.length > 0 && !selectedFrequency) {
        setSelectedFrequency(ids[0]);
      }
    } catch (error) {
      console.error("Error fetching frequency options:", error);
      toast.error("Failed to load frequency options");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFrequencyChange = (e) => {
    setSelectedFrequency(e.target.value);
  };

  const handleRadioFrequencyChange = (e) => {
    setSelectedRadioFrequency(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Use email from form data instead of localStorage
    const userEmail = formData.email;
    
    if (!userEmail) {
      toast.error("Email is required. Please enter a valid email.");
      return;
    }
    
    try {
      setIsSaving(true);
      const response = await API.post(
        `${process.env.REACT_APP_SERVER_URL}api/admin/createReport`,
        {
          name: formData.name,
          email: userEmail,
          employeeNo: formData.employeeNo
        }
      );
      
      if (response.status === 400 && response.data && response.data.message) {
        // Handle maximum user limit error
        toast.error(response.data.message);
        return;
      }
      
      console.log('Report created:', response.data);
      toast.success('User has been added successfully');
      setIsModalOpen(false);
      
      // Reset form data
      setFormData({
        name: '',
        email: '',
        employeeNo: ''
      });
      
      // Refresh the user list
      fetchReportUsers();
    } catch (error) {
      console.error("Error creating report:", error);
      // Check if this is a 400 error with a message
      if (error.response && error.response.status === 400 && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(error.response?.data?.message || "Failed to add user");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      const response = await API.put(
        `${process.env.REACT_APP_SERVER_URL}api/admin/updateReport`,
        {
          name: editFormData.name,
          email: editFormData.email,
          employeeNo: editFormData.employeeNo
        }
      );
      
      console.log('Report updated:', response.data);
      toast.success('User has been updated successfully');
      setIsEditModalOpen(false);
      
      // Refresh the user list
      fetchReportUsers();
    } catch (error) {
      console.error("Error updating report:", error);
      toast.error(error.response?.data?.message || "Failed to update user");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      console.log('Before saving changes');
      console.log('Selected Frequency:', selectedFrequency);
      console.log('Selected Radio Frequency:', selectedRadioFrequency);
  
      if (!selectedRadioFrequency) {
        toast.error("Please select a frequency");
        return;
      }
  
      if (!selectedFrequency) {
        toast.error("Please select an ID");
        return;
      }
  
      // Ensure localStorage is only accessed on the client side
      if (typeof window !== 'undefined') {
        const userEmail = localStorage.getItem('email');
        if (!userEmail) {
          toast.error("User email not found. Please log in again.");
          return;
        }
  
        setIsSaving(true);
  
        // Create the payload object
        const payload = {
          frequency: selectedRadioFrequency,
          email: userEmail,
          id: selectedFrequency
        };
  
        console.log('Payload:', payload);
  
        // Send the frequency and email to the setFrequency API
        const frequencyResponse = await API.post(
          `${process.env.REACT_APP_SERVER_URL}api/admin/setFrequency`,
          payload
        );
        
        // Store the frequency data in localStorage
        localStorage.setItem('frequencyData', JSON.stringify({
          frequency: selectedRadioFrequency,
          id: selectedFrequency,
          timestamp: new Date().toISOString()
        }));
        
        console.log('Frequency set:', frequencyResponse.data);
        toast.success('Frequency settings saved successfully');
        
        // Refresh the user list and frequency data
        fetchReportUsers();
        fetchFrequencyData();
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(`Failed to save settings: ${error.response.data.message}`);
      } else {
        toast.error("Failed to save settings. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (user) => {
    console.log("Edit clicked for user:", user);
    setEditFormData({
      id: user._id,
      name: user.name,
      email: user.email,
      employeeNo: user.employeeNo
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = async (user) => {
    console.log("Delete clicked for user:", user);
    
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      try {
        setIsLoading(true);
        const response = await API.delete(
          `${process.env.REACT_APP_SERVER_URL}api/admin/deleteReport/${user.email}`
        );
        
        console.log('Report deleted:', response.data);
        toast.success('User has been deleted successfully');
        
        // Refresh the user list
        fetchReportUsers();
      } catch (error) {
        console.error("Error deleting report:", error);
        toast.error(error.response?.data?.message || "Failed to delete user");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col w-full h-full ">
      <Toaster richColors position="top-right" />
      <div className="flex flex-col flex-1 gap-4 px-4 py-4">
        <div className="h-[70%] rounded-2xl bg-[#101010]/90 backdrop-blur-sm border-2 border-white">
          <div className="flex h-[15%] items-center justify-between px-6">
            <div className="justify-start font-['Poppins'] text-2xl font-semibold text-white">
              Select People
            </div>
            <div>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center rounded-full border border-blue-700 p-2.5 text-center text-sm font-medium text-blue-700 hover:bg-blue-700 hover:text-white focus:outline-none focus:ring-4 focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:bg-blue-500 dark:hover:text-white dark:focus:ring-blue-800 cursor-pointer"
              >
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
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
                <span className="sr-only">Add User</span>
              </button>
            </div>
          </div>
          <div className="h-0 w-full outline outline-1 outline-offset-[-0.50px] outline-[rgba(255,255,255,1)]" />
          <div className="scrollbar-customd h-[80%]  overflow-x-auto">
            <div className="min-w-[30px] overflow-x-auto">
              <table className="w-full text-white">
                <thead className="sticky top-0 bg-[#101010]/90 text-base backdrop-blur-sm">
                  <tr>
                  <th scope="col" className="px-4 py-3 text-center whitespace-nowrap ">Name</th>
                  <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Email</th>
                  <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Emp No</th>
                  <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Frequency</th>
                  <th scope="col" className="px-4 py-3 text-center whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoadingUsers ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center">
                        <div className="flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span className="ml-2">Loading users...</span>
                        </div>
                      </td>
                    </tr>
                  ) : reportUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                        No users found. Add a new user to get started.
                      </td>
                    </tr>
                  ) : (
                    reportUsers.map((user) => {
                      // Get the frequency value from the single frequency object
                      const frequencyValue = frequencyData[0]?.frequency || 'Not set';
                      
                      return (
                        <tr key={user._id} className="border-b border-gray-700">
                          <td className="px-4 py-4">{user.name}</td>
                          <td className="px-4 py-4">{user.email}</td>
                          <td className="px-4 py-4">{user.employeeNo}</td>
                          <td className="px-4 py-4">
                            <span className="capitalize">
                              {frequencyValue}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <button
                              type="button"
                              onClick={() => handleEditClick(user)}
                              className="p-2 rounded-full hover:bg-gray-700 cursor-pointer"
                              title="Edit"
                            >
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                                <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClick(user)}
                              className="p-2 rounded-full hover:bg-gray-700 cursor-pointer"
                              title="Delete"
                            >
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
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="h-[30%] w-full rounded-2xl bg-[#101010]/90 backdrop-blur-sm">
          <div className="flex h-[15%] items-center justify-between px-6">
            <div className="mt-4 justify-start font-['Poppins'] text-2xl font-semibold text-white">
              Select Frequency
            </div>
            <div className="mt-6 p-4 justify-start font-['Poppins'] text-2xl font-semibold text-white">
           
              <div className="relative">
                <select
                  value={selectedFrequency}
                  onChange={handleFrequencyChange}
                  disabled={isLoading}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  {isLoading ? (
                    <option value="">Loading frequencies...</option>
                  ) : frequencyOptions.length > 0 ? (
                    frequencyOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))
                  ) : (
                    <option value="">No frequencies available</option>
                  )}
                </select>
                {isLoading && (
                  <div className="absolute transform -translate-y-1/2 right-3 top-1/2">
                    <svg className="w-5 h-5 text-gray-500 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
              </div>
              
            </div>
          </div>
          <div className="flex h-[55.5%] flex-col items-center justify-center overflow-hidden px-6 py-4">
            <div className="flex justify-around w-full h-full mt-6 flex-cols-3 md:mt-0">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="frequency"
                  value="daily"
                  checked={selectedRadioFrequency === 'daily'}
                  onChange={handleRadioFrequencyChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300">
                  Daily
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="frequency"
                  value="weekly"
                  checked={selectedRadioFrequency === 'weekly'}
                  onChange={handleRadioFrequencyChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300">
                  Weekly
                </span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  name="frequency"
                  value="monthly"
                  checked={selectedRadioFrequency === 'monthly'}
                  onChange={handleRadioFrequencyChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600"
                />
                <span className="text-sm font-medium text-gray-900 ms-2 dark:text-gray-300">
                  Monthly
                </span>
              </label>
            </div>
           
          </div>

          
          <button
            type="button"
            onClick={handleSaveChanges}
            disabled={isSaving || !selectedRadioFrequency || !selectedFrequency}
            className={`mt-4 inline-flex h-12 w-32 items-center justify-center rounded-2xl px-5 py-2.5 text-center text-sm backdrop-blur-sm md:mt-0 md:h-16 md:w-56 md:font-medium bg-white text-black hover:bg-gray-100 ${
              (isSaving || !selectedRadioFrequency || !selectedFrequency) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isSaving ? (
              <>
                <svg className="w-5 h-5 mr-3 -ml-1 text-black animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
        
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          />
          
          {/* Modal content */}
          <div className="relative z-50 w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Add New User
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email Id
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Employee Number
                </label>
                <input
                  type="text"
                  name="employeeNo"
                  value={formData.employeeNo}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
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
                      Adding...
                    </>
                  ) : (
                    'Add User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop with blur */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={() => setIsEditModalOpen(false)}
          />
          
          {/* Modal content */}
          <div className="relative z-50 w-full max-w-md p-6 bg-white rounded-lg shadow-lg dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit User
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email Id
                </label>
                <input
                  type="email"
                  name="email"
                  value={editFormData.email}
                  onChange={handleEditInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Employee Number
                </label>
                <input
                  type="text"
                  name="employeeNo"
                  value={editFormData.employeeNo}
                  onChange={handleEditInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-900 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>

              <div className="flex justify-end mt-6 space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
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
                      Updating...
                    </>
                  ) : (
                    'Update User'
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

export default Generatereport;