import express from 'express';
import {
    createReport, createAlert, SetColorRange, deleteReport,
    updateReport, getColorRangeModel, updateUser, deleteUser, getUserDetails,
    updateAlert, deleteAlert, createSetAlert, getCombinedAlertAndFrequency,updateDevice, deleteDevice, createDevice, getAllDevices, getLimitsValue, createLimitsValue, getAlertsByDateRange, getUserLogs, getAllAlerts, getUserAlertRange, SaveAlertRange, SetAlertFrequency, getAlertFrequency, AlertfreqUsers, alertFrequency, reportUsers, getFrequency, getUsers
} from '../Controller/Admin.Controller.js';

const router = express.Router();

//post request
router.post('/createReport', createReport);
router.post('/setFrequency', alertFrequency);
router.post('/createAlert', createAlert);
router.post('/createAlertUsers', createSetAlert);
router.post('/createSetAlertFrequency', SetAlertFrequency);
router.post('/SaveUserAlert', SaveAlertRange);
router.post('/SaveColorRange', SetColorRange);
router.post('/getUserDetails', getUserDetails)
router.post('/setLimitsValue', createLimitsValue)
router.post('/CreateDevice', createDevice)

//get request
router.get('/getReportUsers', reportUsers);
router.get('/getLimitsValue', getLimitsValue);
router.get('/getAlertFreqUsers', AlertfreqUsers);
router.get('/getFrequency', getFrequency);
router.get('/getCombinedAlertAndFrequency', getCombinedAlertAndFrequency);
router.get('/getAlertFrequency', getAlertFrequency);
router.get('/getUserAlertRange', getUserAlertRange);
router.get('/getColorRange', getColorRangeModel);
router.get('/getUsers', getUsers)
router.get('/getAllAlerts', getAllAlerts)
router.get('/getAlertsByDateRange', getAlertsByDateRange)
router.get('/getUserLogs', getUserLogs) 
router.get('/getAllDevices', getAllDevices)

//update request
router.put('/updateReport', updateReport)
router.put('/updateAlertUser/:email', updateAlert)
router.put('/updateUsers/:email', updateUser);
router.put('/updateDevice/:deviceId', updateDevice);

//delete request
router.delete('/deleteReport/:email', deleteReport)
router.delete('/deleteAlertUser/:email', deleteAlert)
router.delete('/deleteUsers/:email', deleteUser)
router.delete('/deleteDevice/:deviceId', deleteDevice);

export default router;      