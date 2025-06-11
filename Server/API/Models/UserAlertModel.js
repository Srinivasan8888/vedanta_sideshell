import mongoose from "mongoose";

const UserAlertSchema = new mongoose.Schema({
  info: {
    type: String,
    required: true,
    lowercase: true
  },
  warning: {
    type: String,
    required: true,
    lowercase: true
  },
  critical: {
    type: String,
    required: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    lowercase: true
},
}, {
  timestamps: true
});

export default mongoose.model("UserAlert-Limit", UserAlertSchema);
