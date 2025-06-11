import mongoose from "mongoose";

const SetAlertfrequencySchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    mode: {
        type: String,
        required: true,
    },
    frequency: {
        type: String,
        required: true,
    },
    
}, {
    timestamps: true
});

export default mongoose.model("SetAlert-Frequency", SetAlertfrequencySchema);
