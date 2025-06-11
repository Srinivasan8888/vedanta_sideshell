import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    model: {
        type: String,
        required: true,
    },
    sensor: {
        type: String,
        required: true,
    },
    value: {
        type: Number,
        required: true,
    },
    severity: {
        type: String,
        enum: ['critical', 'warning', 'info'],
        required: true
      },
    message: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now,
    }
});

export default mongoose.model("alerts-notification", notificationSchema);