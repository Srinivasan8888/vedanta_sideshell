import mongoose from "mongoose";

const AlertfrequencySchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  frequency: {
    type: String,
    required: true,
  },
  id: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

export default mongoose.model("Report-Frequency", AlertfrequencySchema);
