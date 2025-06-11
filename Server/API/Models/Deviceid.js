import mongoose from 'mongoose';

const DeviceIdSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    }
});

export default mongoose.model('DeviceId', DeviceIdSchema);