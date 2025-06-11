import Report from '../Models/ReportModel.js';
import Frequency from '../Models/Alertfrequency.js'
import User from '../Models/User.model.js';
import setAlert from '../Models/SetAlertModel.js'
import SetAlertfrequency from '../Models/SetAlertfrequency.js';
import UserAlertModel from '../Models/UserAlertModel.js';
import ColorRangeModel from '../Models/ColorRangeModel.js';
import AlertModel from '../Models/AlertModel.js';
import bcrypt from 'bcrypt';
import SetAlertModel from '../Models/SetAlertModel.js';
import UserLog from '../Models/UserLogs.js';
import Values from '../Models/ValueModel.js';
import DeviceId from '../Models/Deviceid.js';
import sensorModel1 from '../Models/sensorModel1.js';


//post request's
export const createReport = async (req, res) => {
    const { name, email, employeeNo } = req.body;
    if (!name || !email || !employeeNo) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        // Get report user limit from Values collection
        const value = await Values.findOne();
        if (!value) {
            return res.status(500).json({
                message: "Failed to fetch user limit configuration"
            });
        }

        // Check current number of reports
        const currentReports = await Report.countDocuments();
        console.log('Current reports count:', currentReports);
        console.log('Report user limit:', value.reportuserlimit);

        // Convert reportuserlimit to integer
        const maxReports = parseInt(value.reportuserlimit, 10);
        
        if (currentReports >= maxReports) {
            return res.status(400).json({ 
                message: `Maximum number of users (${maxReports}) has been reached. No more users can be added.` 
            });
        }

        const report = await Report.create({ name, email, employeeNo });
        res.status(201).json({
            message: "Sensor data created successfully.",
            data: report,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const SaveAlertRange = async (req, res) => {
    const { info, warning, critical, email } = req.body;
    if (!info || !warning || !critical || !email) {
        return res.status(400).json({ message: 'All the fields are required' });
    }
    try {
        const savealert = await UserAlertModel.create({ info, warning, critical, email });
        res.status(201).json({
            message: 'Alerts Limit have been saved successfully.',
            data: savealert,
        })

    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}

export const createAlert = async (req, res) => {
    const { name, email, employeeNo } = req.body;
    if (!name || !email || !employeeNo) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const report = await Report.create({ name, email, employeeNo });
        res.status(201).json({
            message: "Sensor data created successfully.",
            data: report,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

// export const SetColorRange = async (req, res) => {
//     const { vlmin, vlmax, lmin, lmax, medmin, medmax, highmin, highmax, vhighmin, vhighmax } = req.body;

//     if (!vlmin || !vlmax || !lmin || !lmax || !medmin || !medmax || !highmin || !highmax || !vhighmin || !vhighmax) {
//         return res.status(400).json({ message: 'All fields are required!' });
//     }

//     try {
//         const newColorRange = new ColorRangeModel({
//             vlmin, vlmax, lmin, lmax, medmin, medmax, 
//             highmin, highmax, vhighmin, vhighmax
//         });

//         const savedRange = await newColorRange.save();

//         res.status(201).json({
//             message: "Color range saved successfully.",
//             data: savedRange,
//         });
//     } catch (error) {
//         res.status(500).json({ message: error.message });
//     }
// };

export const SetColorRange = async (req, res) => {
    const { vlmin, vlmax, lmin, lmax, medmin, medmax, highmin, highmax, vhighmin, vhighmax, email } = req.body;

    // List all required fields
    const requiredFields = [
        { name: 'vlmin', value: vlmin },
        { name: 'vlmax', value: vlmax },
        { name: 'lmin', value: lmin },
        { name: 'lmax', value: lmax },
        { name: 'medmin', value: medmin },
        { name: 'medmax', value: medmax },
        { name: 'highmin', value: highmin },
        { name: 'highmax', value: highmax },
        { name: 'vhighmin', value: vhighmin },
        { name: 'vhighmax', value: vhighmax },
        { name: 'email', value: email }
    ];

    // Check for missing fields
    const missingFields = requiredFields
        .filter(field => field.value === undefined)
        .map(field => field.name);

    if (missingFields.length > 0) {
        return res.status(400).json({
            message: `The following fields are missing: ${missingFields.join(', ')}`
        });
    }

    try {
        const newColorRange = new ColorRangeModel({
            vlmin, vlmax, lmin, lmax, medmin, medmax,
            highmin, highmax, vhighmin, vhighmax, email
        });

        const savedRange = await newColorRange.save();

        res.status(201).json({
            message: "Color range saved successfully.",
            data: savedRange,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const createSetAlert = async (req, res) => {
    const { name, email, phoneNo, employeeNo } = req.body;
    console.log('Received request body:', req.body);
    
    if (!name || !email || !employeeNo || !phoneNo) {
        console.log('Missing required fields:', { name, email, employeeNo, phoneNo });
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Get alert user limit from Values collection
        const value = await Values.findOne();
        if (!value) {
            return res.status(500).json({
                message: "Failed to fetch user limit configuration"
            });
        }

        // Check current user count
        const userCount = await setAlert.countDocuments();
        console.log('Current user count:', userCount);
        console.log('Alert user limit:', value.alertuserlimit);

        // Convert alertuserlimit to integer
        const maxUsers = parseInt(value.alertuserlimit, 10);
        
        if (userCount >= maxUsers) {
            return res.status(400).json({
                message: `Maximum number of users (${maxUsers}) has been reached. Cannot create more users.`
            });
        }

        console.log('Attempting to create alert user with data:', { name, email, employeeNo, phoneNo });
        const datas = await setAlert.create({ name, email, employeeNo, phoneNo });
        console.log('Successfully created alert user:', datas);
        res.status(201).json({
            message: "User created successfully.",
            data: datas,
        });
    } catch (error) {
        console.error('Error creating alert user:', error);
        if (error.code === 11000) {
            // Duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            return res.status(400).json({ 
                message: `This ${field} is already registered. Please use a different ${field}.` 
            });
        }
        res.status(500).json({ message: error.message });
    }
}

export const alertFrequency = async (req, res) => {
    const { email, frequency, id } = req.body;

    if (!email || !frequency || !id) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const newEntry = await Frequency.create({ email, frequency, id });

        res.status(201).json({
            message: "Frequency data saved successfully",
            data: newEntry,
        });
    } catch (error) {
        console.error("Error saving frequency data:", error);
        res.status(500).json({ message: error.message });
    }
};

export const SetAlertFrequency = async (req, res) => {
    const { email, mode, frequency } = req.body;

    if (!email || !frequency || !mode) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        const newEntry = await SetAlertfrequency.create({ email, frequency, mode });

        res.status(201).json({
            message: "AlertSetFrequency data saved successfully",
            data: newEntry,
        });
    } catch (error) {
        console.error("Error saving AlertSetFrequency data:", error);
        res.status(500).json({ message: error.message });
    }
};


export const createLimitsValue = async (req, res) => {
    try {
        const { reportuserlimit, alertuserlimit, adminuserlimit } = req.body;
        
        // Validate input
        if (!reportuserlimit || !alertuserlimit || !adminuserlimit) {
            return res.status(400).json({ 
                message: 'All fields are required',
                fields: ['reportuserlimit', 'alertuserlimit', 'adminuserlimit']
            });
        }

        // Convert values to numbers and validate
        const reportLimit = Number(reportuserlimit);
        const alertLimit = Number(alertuserlimit);
        const adminLimit = Number(adminuserlimit);

        if (isNaN(reportLimit) || isNaN(alertLimit) || isNaN(adminLimit)) {
            return res.status(400).json({ 
                message: 'All limit values must be valid numbers'
            });
        }

        // Create the value limit
        const valuelimit = await Values.create({ 
            reportuserlimit: String(reportLimit),
            alertuserlimit: String(alertLimit),
            adminuserlimit: String(adminLimit),
            timestamp: new Date()
        });

        res.status(201).json({
            message: "User limits created successfully.",
            data: valuelimit,
        });
    } catch (error) {
        console.error('Error creating user limits:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error',
                details: error.message
            });
        }
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
}

export const createDevice = async (req, res) => {
    try {
        const { deviceId } = req.body;
        
        // Validate input
        if (!deviceId) {
            return res.status(400).json({ 
                message: 'Device ID is required'
            });
        }

        // Check if device ID already exists
        const existingDevice = await DeviceId.findOne({ deviceId });
        if (existingDevice) {
            return res.status(409).json({
                success: false,
                message: 'Device ID already exists'
            });
        }

        // Create new device
        const device = await DeviceId.create({
            deviceId: deviceId,
            timestamp: new Date()
        });

        res.status(201).json({
            success: true,
            message: 'Device registered successfully',
            data: {
                id: device._id,
                deviceId: device.deviceId,
                timestamp: device.timestamp
            }
        });
    } catch (error) {
        console.error('Error registering device:', error);
        
        // Handle duplicate key error
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: 'This device ID is already registered'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}


//get request's
export const reportUsers = async (req, res) => {
    try {
        const reports = await Report.find().sort({ createdAt: -1 });

        if (!reports || reports.length === 0) {
            return res.status(404).json({ message: "No user reports found" });
        }

        res.status(200).json({
            message: "User reports fetched successfully",
            data: reports,
        });
    } catch (error) {

        console.error("Error fetching user reports:", error);
        res.status(500).json({ message: error.message });
    }
};

export const AlertfreqUsers = async (req, res) => {
    try {
        const reports = await setAlert.find().sort({ createdAt: -1 });

        if (!reports || reports.length === 0) {
            return res.status(404).json({ message: "No user reports found" });
        }

        res.status(200).json({
            message: "User reports fetched successfully",
            data: reports,
        });
    } catch (error) {

        console.error("Error fetching user reports:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getFrequency = async (req, res) => {
    try {
        // Fetch the latest frequency data (single document)
        const latestFrequencyData = await Frequency.findOne()
            .sort({ createdAt: -1 }); // Sort by createdAt in descending order

        // If no data is found, return a 404 response
        if (!latestFrequencyData) {
            return res.status(404).json({
                success: false,
                message: "No frequency data found",
            });
        }

        // Return the latest frequency data
        res.status(200).json({
            success: true,
            message: "Latest frequency data retrieved successfully",
            data: latestFrequencyData,
        });
    } catch (error) {
        console.error("Error fetching frequency data:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

export const getAlertFrequency = async (req, res) => {
    try {

        const Entry = await SetAlertfrequency.findOne().sort({ createdAt: -1 });
        if (!Entry) {
            return res.status(400).json({ message: 'No data found' });
        }
        res.status(200).json({
            message: "AlertSetFrequency data retrieved successfully",
            data: Entry,
        });

    } catch (error) {
        console.error("Error saving AlertSetFrequency data:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getCombinedAlertAndFrequency = async (req, res) => {
    try {
        // Fetch both data sources in parallel
        const [reports, frequencyData] = await Promise.all([
            setAlert.find().sort({ createdAt: -1 }),
            SetAlertfrequency.findOne().sort({ _id: -1 }).select('frequency mode')
        ]);

        // Check if reports exist
        if (!reports || reports.length === 0) {
            return res.status(404).json({
                success: false,
                message: "No user reports found"
            });
        }

        // Prepare response object
        const response = {
            success: true,
            message: "Data fetched successfully",
            data: {
                reports: reports,
                frequency: frequencyData?.frequency || null,
                mode: frequencyData?.mode || null
            }
        };

        // Optional: Add warning if frequency data is missing
        if (!frequencyData) {
            response.message += " (No frequency settings found)";
        }

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching combined data:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error"
        });
    }
};

export const getUsers = async (req, res) => {
    try {
        const usersDate = await User.find({}, { password: 0 });
        if (!usersDate) {
            return res.status(404).json({ message: "No frequency data found for this email" });
        }

        res.status(200).json({
            message: "Frequency data retrieved successfully",
            data: usersDate,
        });
    } catch (error) {
        console.error("Error fetching frequency data:", error);
        res.status(500).json({ message: error.message });
    }
};

export const getUserDetails = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return (res.status(500).json({ messege: 'email not found!!!' }));
    }
    try {
        const finduserdetail = await User.findOne({ email }, { password: 0 });
        if (!finduserdetail) {
            return res.status(404).json({ message: error.message });
        }
        res.status(200).json({
            message: "Frequency data retrieved successfully",
            data: finduserdetail,
        });
    } catch (error) {
        console.error("Error fetching frequency data:", error);
        res.status(500).json({ message: error.message });
    }
}

export const getUserAlertRange = async (req, res) => {

    try {
        const savealert = await UserAlertModel.find().sort({ updated: -1 })
        res.status(201).json({
            message: 'Alerts Limit have fetched successfully.',
            data: savealert,
        })

    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}

export const getColorRangeModel = async (req, res) => {
    try {
        // Fetch latest document, excluding the 'email' field
        const latestAlert = await ColorRangeModel.findOne()
            .sort({ updatedAt: -1 })
            .select('-email'); // Exclude email field

        res.status(200).json({
            message: 'Latest alert fetched successfully.',
            data: latestAlert,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


export const getAllAlerts = async (req, res) => {

    try {
        const savealert = await AlertModel.find().sort({ updated: -1 })
        res.status(201).json({
            message: 'Alerts Limit have fetched successfully.',
            data: savealert,
        })

    } catch (error) {
        res.status(500).json({ message: error.message });

    }
}


export const getAlertsByDateRange = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const date1 = new Date(startDate);
        date1.setHours(0, 0, 0, 0); // Start of the day

        const date2 = new Date(endDate);
        date2.setHours(23, 59, 59, 999); // End of the day

        const savealert = await AlertModel.find({
            timestamp: { $gte: date1, $lte: date2 }
        })
        .lean()
        .sort({ timestamp: -1 });

        res.status(200).json({
            message: 'Alerts have been fetched successfully.',
            data: savealert,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getUserLogs = async (req, res) => {
    try {
        const userLogs = await UserLog.find().sort({ createdAt: -1 });
        res.status(200).json({ message: 'User logs fetched successfully.', data: userLogs });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

export const getLimitsValue = async (req, res) => {
    try {
        // Get the latest limits value
        const latestLimits = await Values.findOne()
            .sort({ timestamp: -1 })
            .select('reportuserlimit alertuserlimit adminuserlimit timestamp');

        if (!latestLimits) {
            return res.status(404).json({
                message: 'No limit values found'
            });
        }

        // Convert string values back to numbers for the response
        const responseLimits = {
            reportuserlimit: Number(latestLimits.reportuserlimit),
            alertuserlimit: Number(latestLimits.alertuserlimit),
            adminuserlimit: Number(latestLimits.adminuserlimit),
            timestamp: latestLimits.timestamp
        };

        res.status(200).json({
            message: "Current user limits retrieved successfully",
            data: responseLimits
        });
    } catch (error) {
        console.error('Error getting user limits:', error);
        res.status(500).json({ 
            message: 'Internal server error',
            error: error.message 
        });
    }
}

export const getAllDevices = async (req, res) => {
    try {
        // Fetch all devices, sorted by timestamp (newest first)
        const devices = await DeviceId.find()
            .sort({ timestamp: -1 })
            .select('deviceId timestamp');

        if (!devices || devices.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No devices found',
                data: []
            });
        }

        // Get latest timestamp from SensorModel1 for each device
        const deviceIds = devices.map(device => device.deviceId);
        const latestSensorData = await sensorModel1.aggregate([
            { $match: { id: { $in: deviceIds } } },
            { $sort: { _id: -1 } },
            { $group: {
                _id: "$id",
                latestTimestamp: { $first: "$timestamp" },
                createdAt: { $first: "$createdAt" }
            }}
        ]);

        // Create mapping of deviceId to latest timestamp
        const latestTimestamps = new Map(latestSensorData.map(item => [item._id, item.latestTimestamp]));

        // Create mapping of deviceId to timestamps
        const timestampMapping = new Map(latestSensorData.map(item => [
            item._id,
            {
                latestTimestamp: item.latestTimestamp,
                createdAt: item.createdAt
            }
        ]));

        res.status(200).json({
            success: true,
            message: 'Devices retrieved successfully',
            data: devices.map(device => ({
                id: device._id,
                deviceId: device.deviceId,
                sensorCreatedAt: timestampMapping.get(device.deviceId)?.createdAt || null
            }))
        });
    } catch (error) {
        console.error('Error fetching devices:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};


//update request
export const updateReport = async (req, res) => {
    const { name, email, employeeNo } = req.body;
    if (!name || !email || !employeeNo) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const report = await Report.findOne({ email: email });
        if (!report) {
            return res.status(404).json({ message: 'Report not found with this email' });
        }

        report.name = name;
        report.employeeNo = employeeNo;

        const updatedReport = await report.save();

        res.status(200).json({
            message: "Report updated successfully.",
            data: updatedReport,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAlert = async (req, res) => {
    try {
        const { email } = req.params;
        const updateData = req.body;

        // Check if email is being updated and if new email already exists
        if (updateData.email && updateData.email !== email) {
            const existingUser = await Alert.findOne({ email: updateData.email });
            if (existingUser) {
                return res.status(400).json({ message: 'User with this email already exists' });
            }
        }

        const updatedAlert = await Alert.findOneAndUpdate(
            { email },
            updateData,
            { new: true }
        );

        if (!updatedAlert) {
            return res.status(404).json({ message: 'Alert user not found' });
        }

        res.status(200).json({ message: 'Alert user updated successfully', data: updatedAlert });
    } catch (error) {
        res.status(500).json({ message: 'Error updating alert user', error: error.message });
    }
};

export const updateUser = async (req, res) => {
    try {
        const { email } = req.params; // Extract email from URL params
        const updateData = { ...req.body }; // Clone the request body

        // Prevent updating sensitive fields
        const immutableFields = ['email', 'role']; // Removed 'empid' from this list
        immutableFields.forEach((field) => {
            if (updateData[field]) {
                delete updateData[field];
            }
        });

        // Handle password updates
        if (updateData.password) {
            // Hash the new password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(updateData.password, salt);
            updateData.password = hashedPassword;
        }

        // Check if the payload is empty
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update",
            });
        }

        // Debugging logs
        console.log("Update Data:", updateData);
        console.log("Email:", email);

        // Update the user in the database
        const updatedUser = await User.findOneAndUpdate(
            { email }, // Find user by email
            { $set: updateData }, // Update only the provided fields
            { new: true, select: '-password' } // Return updated user without password
        );

        // Check if the user exists
        if (!updatedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Return success response
        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: updatedUser,
        });
    } catch (error) {
        console.error("Error updating user:", error);

        if (error.code === 11000) {
            // Handle duplicate key error (e.g., duplicate empid)
            return res.status(400).json({
                success: false,
                message: "Duplicate empid. Please provide a unique value.",
            });
        }

        return res.status(500).json({
            success: false,
            message: error.message || "Internal Server Error",
        });
    }
};

export const updateDevice = async (req, res) => {
    try {
        const { newDeviceId } = req.body;
        const { deviceId } = req.params;
        
        // Validate input
        if (!newDeviceId || !deviceId) {
            return res.status(400).json({ 
                success: false,
                message: 'Both current and new device IDs are required'
            });
        }

        // Check if new device ID already exists
        const existingDevice = await DeviceId.findOne({ deviceId: newDeviceId });
        if (existingDevice) {
            return res.status(409).json({
                success: false,
                message: 'This device ID is already in use'
            });
        }

        // Find and update the device
        const updatedDevice = await DeviceId.findOneAndUpdate(
            { deviceId: deviceId },
            { 
                deviceId: newDeviceId,
                timestamp: new Date() 
            },
            { new: true }
        );

        if (!updatedDevice) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Device updated successfully',
            data: {
                id: updatedDevice._id,
                deviceId: updatedDevice.deviceId,
                timestamp: updatedDevice.timestamp
            }
        });

    } catch (error) {
        console.error('Error updating device:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

//delete request
export const deleteReport = async (req, res) => {
    const { email } = req.params;

    try {
        console.log('Attempting to delete report with email:', email);
        const report = await Report.findOne({ email: email });
        console.log('Found report:', report);

        if (!report) {
            console.log('No report found with email:', email);
            return res.status(404).json({ message: 'Report not found with this email' });
        }

        await Report.deleteOne({ email: email });
        console.log('Report deleted successfully');
        res.status(200).json({
            message: "Report deleted successfully.",
        });
    } catch (error) {
        console.error('Error deleting report:', error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteAlert = async (req, res) => {
    try {
        const { email } = req.params;
        
        // Check if user exists first
        const existingUser = await SetAlertModel.findOne({ email });
        if (!existingUser) {
            return res.status(404).json({ message: 'Alert user not found' });
        }

        // Delete the user
        const deletedUser = await SetAlertModel.findOneAndDelete({ email });
        
        res.status(200).json({ 
            message: 'Alert user deleted successfully', 
            data: deletedUser 
        });
    } catch (error) {
        console.error('Error in deleteAlert:', error);
        res.status(500).json({ 
            message: 'Error deleting alert user', 
            error: error.message 
        });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const { email } = req.params;

        const deletedUser = await User.findOneAndDelete({ email });

        if (!deletedUser) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting user:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;

        if (!deviceId) {
            return res.status(400).json({ 
                success: false,
                message: 'Device ID is required'
            });
        }

        const deletedDevice = await DeviceId.findOneAndDelete({ 
            deviceId: deviceId 
        });

        if (!deletedDevice) {
            return res.status(404).json({
                success: false,
                message: 'Device not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Device deleted successfully',
            data: {
                id: deletedDevice._id,
                deviceId: deletedDevice.deviceId
            }
        });

    } catch (error) {
        console.error('Error deleting device:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};