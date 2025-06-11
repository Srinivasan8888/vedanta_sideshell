import mongoose from "mongoose";

const ColorRangeSchema = new mongoose.Schema({
    vlmin: {
        type: Number,
        required: true,
    },
    vlmax: {
        type: Number,
        required: true,
    },
    lmin: {
        type: Number,
        required: true,
    },
    lmax: {
        type: Number,
        required: true,
    },
    medmin: {
        type: Number,
        required: true,
    },
    medmax: {
        type: Number,
        required: true,
    },
    highmin: {
        type: Number,
        required: true,
    },
    highmax: {
        type: Number,
        required: true,
    },
    vhighmin: {
        type: Number,
        required: true,
    },
    vhighmax: {
        type: Number,
        required: true,
    },
}, {
    timestamps: true
});

export default mongoose.model("Color-Range", ColorRangeSchema); 