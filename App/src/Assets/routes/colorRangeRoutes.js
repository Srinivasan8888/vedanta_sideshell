import express from 'express';
import { 
    SetColorRange, 
    GetAllColorRanges, 
    GetLatestColorRange, 
    UpdateColorRange, 
    DeleteColorRange 
} from '../controllers/colorRangeController.js';

const router = express.Router();

// Create a new color range
router.post('/', SetColorRange);

// Get all color ranges
router.get('/', GetAllColorRanges);

// Get latest color range
router.get('/latest', GetLatestColorRange);

// Update a color range
router.put('/:id', UpdateColorRange);

// Delete a color range
router.delete('/:id', DeleteColorRange);

export default router; 