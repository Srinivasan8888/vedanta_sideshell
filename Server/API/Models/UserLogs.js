import mongoose from "mongoose";

const LoginLocationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User',
    required: false
  },
  email: {
    type: String,
    required: true
  },
  ip: {
    type: String,
    required: true
  },
  method: {
    type: String,
    required: true,
    enum: ['login', 'logout']
  },
  city: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  latitude: {
    type: String,
    required: true
  },
  longitude: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  loginAt: {
    type: String,
    default: Date.now
  }
});

export default mongoose.model("UserLogs", LoginLocationSchema);