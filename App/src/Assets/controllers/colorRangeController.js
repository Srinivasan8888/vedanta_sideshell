import ColorRangeModel from "../models/ColorRange.js";

// Set color range values
export const SetColorRange = async (req, res) => {
    const { vlmin, vlmax, lmin, lmax, medmin, medmax, highmin, highmax, vhighmin, vhighmax } = req.body;

    if (!vlmin || !vlmax || !lmin || !lmax || !medmin || !medmax || !highmin || !highmax || !vhighmin || !vhighmax) {
        return res.status(400).json({ message: 'All fields are required!' });
    }

    try {
        const newColorRange = new ColorRangeModel({
            vlmin, vlmax, lmin, lmax, medmin, medmax, 
            highmin, highmax, vhighmin, vhighmax
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

// Get all color ranges
export const GetAllColorRanges = async (req, res) => {
    try {
        const colorRanges = await ColorRangeModel.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: "Color ranges retrieved successfully.",
            data: colorRanges,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get latest color range
export const GetLatestColorRange = async (req, res) => {
    try {
        const latestRange = await ColorRangeModel.findOne().sort({ createdAt: -1 });
        
        if (!latestRange) {
            return res.status(404).json({ message: "No color range found." });
        }
        
        res.status(200).json({
            message: "Latest color range retrieved successfully.",
            data: latestRange,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update color range
export const UpdateColorRange = async (req, res) => {
    const { id } = req.params;
    const { vlmin, vlmax, lmin, lmax, medmin, medmax, highmin, highmax, vhighmin, vhighmax } = req.body;

    try {
        const updatedRange = await ColorRangeModel.findByIdAndUpdate(
            id,
            { vlmin, vlmax, lmin, lmax, medmin, medmax, highmin, highmax, vhighmin, vhighmax },
            { new: true }
        );

        if (!updatedRange) {
            return res.status(404).json({ message: "Color range not found." });
        }

        res.status(200).json({
            message: "Color range updated successfully.",
            data: updatedRange,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete color range
export const DeleteColorRange = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRange = await ColorRangeModel.findByIdAndDelete(id);

        if (!deletedRange) {
            return res.status(404).json({ message: "Color range not found." });
        }

        res.status(200).json({
            message: "Color range deleted successfully.",
            data: deletedRange,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 