import express from 'express';
import { generateAndSendReports, updateReportFrequency, sendTestEmail } from '../Controller/ReportsController.js';

const router = express.Router();

// Route to generate and send reports
router.post('/generate', generateAndSendReports);

// Route to update user's report frequency
router.post('/update-frequency', updateReportFrequency);

// Route to send test email
router.post('/test-email', sendTestEmail);

export default router;
