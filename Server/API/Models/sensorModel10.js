import mongoose from "mongoose";
const { Schema } = mongoose;

const sensorSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    },
    busbar: {
      type: String,
    },
    CBT19B1: {
      type: String,
    },
    CBT19B2: {
      type: String,
    },
    CBT20B1: {
      type: String,
    },
    CBT20B2: {
      type: String,
    },
    CBT21B1: {
      type: String,
    },
    CBT21B2: {
      type: String,
    },
    CBT22B1: {
      type: String,
    },
    CBT22B2: {
      type: String,
    },
    CBT23B1: {
      type: String,
    },
    CBT23B2: {
      type: String,
    },
    CBT24B1: {
      type: String,
    },
    CBT24B2: {
      type: String,
    },
    CBT25B1: {
      type: String,
    },
    CBT25B2: {
      type: String,
    },
    CBT26B1: {
      type: String,
    },
    CBT26B2: {
      type: String,
    },
    CBT27B1: {
      type: String,
    },
    CBT27B2: {
      type: String,
    },
    TIME: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("sensorModel10", sensorSchema);