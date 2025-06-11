import mongoose from 'mongoose';

const valueSchema = new mongoose.Schema({
    reportuserlimit: {
        type: String,
        required: true,
    },
    alertuserlimit: {
        type: String,
        required: true,
    },
    adminuserlimit: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    }
});

export default mongoose.model("Users-limits", valueSchema);