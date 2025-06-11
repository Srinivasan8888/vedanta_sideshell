import React, { useState, useEffect } from "react";
import { Server, Save, Plus } from 'lucide-react';
import { toast } from 'sonner';
import API from '../../Axios/AxiosInterceptor';

// Function to format time as relative time (e.g., "5 minutes ago")
const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(diffInSeconds / secondsInUnit);
        if (interval >= 1) {
            return interval === 1
                ? `${interval} ${unit} ago`
                : `${interval} ${unit}s ago`;
        }
    }

    return 'just now';
};


const Values = () => {
    const [limits, setLimits] = useState({
        reportUserLimit: '',
        alertUserLimit: '',
        adminUserLimit: ''
    });
    const [deviceAddress, setDeviceAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('limits');
    const [devices, setDevices] = useState([]);
    const [isLoadingDevices, setIsLoadingDevices] = useState(false);
    const [editingDevice, setEditingDevice] = useState(null);
    const [editDeviceValue, setEditDeviceValue] = useState('');

    const handleEditDevice = (device) => {
        setEditingDevice(device.id);
        setEditDeviceValue(device.deviceId);
    };

const handleSaveEdit = async (deviceId) => {
    const newDeviceId = editDeviceValue.trim();
    
    if (!newDeviceId) {
        toast.error('Please enter a device ID');
        return;
    }

    try {
        setIsLoading(true);
        
        // Find the existing device
        const existingDevice = devices.find(device => device.id === deviceId);
        if (!existingDevice) {
            throw new Error('Device not found');
        }

        // Call the update API
        const response = await API.put(
            `${process.env.REACT_APP_SERVER_URL}api/admin/updateDevice/${existingDevice.deviceId}`,
            { newDeviceId },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            }
        );

        if (response.data?.success) {
            toast.success('Device updated successfully!');
            setEditingDevice(null);
            fetchDevices(); // Refresh the device list
        } else {
            throw new Error(response.data?.message || 'Failed to update device');
        }
    } catch (error) {
        console.error('Error updating device:', error);
        const errorMessage = error.response?.data?.message || error.message || 'Error updating device';
        toast.error(errorMessage);
    } finally {
        setIsLoading(false);
    }
};

    const handleCancelEdit = () => {
        setEditingDevice(null);
        setEditDeviceValue('');
    };

    const handleDeleteDevice = async (deviceId) => {
        if (!window.confirm('Are you sure you want to delete this device?')) {
            return;
        }
    
        try {
            setIsLoading(true);
            
            // Find the device to get its deviceId
            const deviceToDelete = devices.find(device => device.id === deviceId);
            if (!deviceToDelete) {
                throw new Error('Device not found');
            }
    
            // Call the delete API
            const response = await API.delete(
                `${process.env.REACT_APP_SERVER_URL}api/admin/deleteDevice/${deviceToDelete.deviceId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
    
            if (response.data?.success) {
                toast.success('Device deleted successfully!');
                fetchDevices(); // Refresh the device list
            } else {
                throw new Error(response.data?.message || 'Failed to delete device');
            }
        } catch (error) {
            console.error('Error deleting device:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Error deleting device';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };
    // Fetch limits on component mount
    useEffect(() => {
        const fetchLimits = async () => {
            try {
                setIsLoading(true);
                const response = await API.get(`${process.env.REACT_APP_SERVER_URL}api/admin/getLimitsValue`);

                if (response.data && response.data.data) {
                    const { data } = response.data;
                    // Convert string values to numbers for the input fields
                    setLimits({
                        reportUserLimit: Number(data.reportuserlimit) || '',
                        alertUserLimit: Number(data.alertuserlimit) || '',
                        adminUserLimit: Number(data.adminuserlimit) || ''
                    });
                }
            } catch (error) {
                console.error('Error fetching limits:', error);
                toast.error(error.response?.data?.message || 'Failed to load limits');
            } finally {
                setIsLoading(false);
            }
        };

        fetchLimits();
    }, []);

    const handleLimitChange = (e) => {
        const { name, value } = e.target;
        // Convert input value to number if it's not empty
        const numericValue = value === '' ? '' : Number(value);
        setLimits(prev => ({
            ...prev,
            [name]: numericValue
        }));
    };

    const handleSaveLimits = async () => {
        if (!limits.reportUserLimit || !limits.alertUserLimit || !limits.adminUserLimit) {
            toast.error('Please fill in all limit fields');
            return;
        }

        try {
            setIsSaving(true);

            // Prepare the data in the format expected by the backend
            const requestData = {
                reportuserlimit: limits.reportUserLimit,
                alertuserlimit: limits.alertUserLimit,
                adminuserlimit: limits.adminUserLimit
            };

            const response = await API.post(
                `${process.env.REACT_APP_SERVER_URL}api/admin/setLimitsValue`,
                requestData
            );

            if (response.data && response.data.message) {
                toast.success(response.data.message);
            } else {
                throw new Error('Unexpected response from server');
            }
        } catch (error) {
            console.error('Error saving limits:', error);

            // Handle validation errors
            if (error.response?.status === 400) {
                if (error.response.data?.details) {
                    toast.error(`Validation error: ${error.response.data.details}`);
                } else if (error.response.data?.message) {
                    toast.error(error.response.data.message);
                } else {
                    toast.error('Please check your input and try again');
                }
            } else {
                toast.error(error.response?.data?.message || 'Failed to save limits');
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddDevice = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const deviceId = formData.get('deviceId');

        if (!deviceId) {
            alert('Please enter a device ID');
            return;
        }

        try {
            setIsLoading(true);

            const response = await API.post(
                `${process.env.REACT_APP_SERVER_URL}api/admin/CreateDevice`,
                { deviceId: deviceId.trim() },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Add if you're using authentication
                    }
                }
            );

            if (response.data.success) {
                toast.success('Device added successfully!');
                e.target.reset(); // Reset the form
                // Refresh the devices list
                await fetchDevices();
            } else {
                throw new Error(response.data.message || 'Failed to add device');
            }
        } catch (error) {
            console.error('Error adding device:', error);
            alert(error.response?.data?.message || error.message || 'Error adding device');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDevices = async () => {
        try {
            setIsLoadingDevices(true);
            const response = await API.get(`${process.env.REACT_APP_SERVER_URL}api/admin/getAllDevices`);
            if (response.data && response.data.success) {
                setDevices(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching devices:', error);
            toast.error('Failed to load devices');
        } finally {
            setIsLoadingDevices(false);
        }
    };

    // Fetch devices on component mount
    useEffect(() => {
        fetchDevices();
    }, []);

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex flex-col flex-1 gap-4 px-4 py-4">
                <div className="h-full rounded-2xl border-2 border-white bg-[rgba(16,16,16,0.75)] backdrop-blur-sm">
                    <div className="flex flex-col w-full h-full p-6 space-y-6">
                        {/* Limits Section */}
                        <div className="bg-[rgba(16,16,16,0.75)] backdrop-blur-sm rounded-xl border border-white/10 p-6 shadow-lg">
                            <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                                <Server className="w-5 h-5" />
                                System Limits
                            </h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Report User Limit
                                    </label>
                                    <input
                                        type="number"
                                        name="reportUserLimit"
                                        value={limits.reportUserLimit}
                                        onChange={handleLimitChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter limit"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Alert User Limit
                                    </label>
                                    <input
                                        type="number"
                                        name="alertUserLimit"
                                        value={limits.alertUserLimit}
                                        onChange={handleLimitChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter limit"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Admin User Limit
                                    </label>
                                    <input
                                        type="number"
                                        name="adminUserLimit"
                                        value={limits.adminUserLimit}
                                        onChange={handleLimitChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                        placeholder="Enter limit"
                                    />
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleSaveLimits}
                                    disabled={isSaving || isLoading}
                                    className="inline-flex items-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    {isSaving ? 'Saving...' : 'Save Limits'}
                                </button>
                            </div>
                        </div>

                        {/* Add Device Section */}
                        <div className="bg-[rgba(16,16,16,0.75)] backdrop-blur-sm rounded-xl border border-white/10 p-6 shadow-lg">
                            <div className="mb-6">
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Device Management</h2>
                                        <p className="text-sm text-gray-400 mt-1">Add and manage your devices</p>
                                    </div>

                                    <form onSubmit={handleAddDevice} className="flex-1 max-w-2xl">
                                        <div className="flex flex-col sm:flex-row gap-3 items-end">
                                            <div className="flex-1 w-full">
                                                <label htmlFor="deviceId" className="block text-sm font-medium text-gray-300 mb-1.5">
                                                    Device ID
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        id="deviceId"
                                                        name="deviceId"
                                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-10"
                                                        placeholder="Enter device ID"
                                                        required
                                                        min="1"
                                                    // value={deviceId}
                                                    // onChange={e => setDeviceId(e.target.value)}
                                                    />
                                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                        <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="submit"
                                                disabled={isLoading}
                                                className="w-full sm:w-auto inline-flex justify-center items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                                            >
                                                <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                                                {isLoading ? 'Adding Device...' : 'Add Device'}
                                            </button>
                                        </div>
                                        <p className="mt-2 text-xs text-gray-400">
                                            Enter the unique device ID to register a new device
                                        </p>
                                    </form>
                                </div>
                            </div>

                            {/* Device List */}
                            {/*  <div className="space-y-4">
                                <div className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-blue-500/20 rounded-lg">
                                            <Server className="w-5 h-5 text-blue-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">Main Server</h3>
                                            <p className="text-sm text-gray-400">Active • Last seen: 2 min ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.793.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                        <button className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-2 bg-green-500/20 rounded-lg">
                                            <Server className="w-5 h-5 text-green-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-white font-medium">Backup Server</h3>
                                            <p className="text-sm text-gray-400">Active • Last seen: 5 min ago</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.793.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                            </svg>
                                        </button>
                                        <button className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                </div> */}

                            {/* Empty State */}
                            {/* Uncomment to show when no devices are present */}
                            {/*
                                <div className="text-center py-8 bg-white/5 rounded-lg border-2 border-dashed border-white/10">
                                    <Server className="mx-auto h-10 w-10 text-gray-500" />
                                    <h3 className="mt-3 text-sm font-medium text-gray-200">No devices connected</h3>
                                    <p className="mt-1 text-sm text-gray-400">Get started by adding a new device</p>
                                    <button
                                        onClick={handleAddDevice}
                                        className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                    >
                                        <Plus className="-ml-1 mr-2 h-4 w-4" />
                                        Add Device
                                    </button>
                                </div>
                                
                            </div> */}

                            <div className="space-y-4">
                                {isLoadingDevices ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                        <p className="mt-2 text-sm text-gray-400">Loading devices...</p>
                                    </div>
                                ) : devices.length > 0 ? (
                                    devices.map((device) => (
                                        <div key={device.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4 border border-white/10">
                                            <div className="flex items-center space-x-4">
                                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                                    <Server className="w-5 h-5 text-blue-400" />
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-medium">
                                                        {editingDevice === device.id ? (
                                                            <div className="flex items-center gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={editDeviceValue}
                                                                    onChange={(e) => setEditDeviceValue(e.target.value)}
                                                                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white w-32"
                                                                    autoFocus
                                                                />
                                                                <button 
                                                                    onClick={() => handleSaveEdit(device.id)}
                                                                    className="text-green-400 hover:text-green-300"
                                                                    disabled={isLoading}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                                <button 
                                                                    onClick={handleCancelEdit}
                                                                    className="text-red-400 hover:text-red-300"
                                                                    disabled={isLoading}
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between">
                                                                <span>Device ID: {device.deviceId}</span>
                                                            </div>
                                                        )}
                                                    </h3>
                                                    <p className="text-sm text-gray-400">
                                                        {device.sensorCreatedAt ? (
                                                            new Date().getTime() - new Date(device.sensorCreatedAt).getTime() <= 5 * 60 * 1000 ? (
                                                                <span className="text-green-400">Active</span>
                                                            ) : (
                                                                <span className="text-red-400">Inactive</span>
                                                            )
                                                        ) : (
                                                            <span className="text-red-400">Inactive</span>
                                                        )} • {device.sensorCreatedAt ? formatRelativeTime(device.sensorCreatedAt) : "No initiated yet"}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                {editingDevice !== device.id && (
                                                    <button
                                                        onClick={() => handleEditDevice(device)}
                                                        className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.793.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                        </svg>
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteDevice(device.id)}
                                                    className="p-2 text-red-400 hover:text-red-300 rounded-lg hover:bg-red-500/10 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 bg-white/5 rounded-lg border-2 border-dashed border-white/10">
                                        <Server className="mx-auto h-10 w-10 text-gray-500" />
                                        <h3 className="mt-3 text-sm font-medium text-gray-200">No devices found</h3>
                                        <p className="mt-1 text-sm text-gray-400">Get started by adding a new device</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};

export default Values;