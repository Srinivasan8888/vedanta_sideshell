import mongoose from "mongoose";
const { Schema } = mongoose;

const sensorSchema = new mongoose.Schema(
  {
    id: {
      type: String,
    }, busbar:{
      type:String,
  },
    CBT1B1: {
      type: String,
    },
    CBT1B2: {
      type: String,
    },
    CBT2B1: {
      type: String,
    },
    CBT2B2: {
      type: String,
    },
    CBT3B1: {
      type: String,
    },
    CBT3B2: {
      type: String,
    },
    CBT4B1: {
      type: String,
    },
    CBT4B2: {
      type: String,
    },
    CBT5B1: {
      type: String,
    },
    CBT5B2: {
      type: String,
    },
    CBT6B1: {
      type: String,
    },
    CBT6B2: {
      type: String,
    },
    CBT7B1: {
      type: String,
    },
    CBT7B2: {
      type: String,
    },
    CBT8B1: {
      type: String,
    },
    CBT8B2: {
      type: String,
    },
    CBT9B1: {
      type: String,
    },
    CBT9B2: {
      type: String,
    },
    CBT10B1:{
        type:String
    },
    CBT10B2:{
        type:String
     },
     TIME: {
      type:String
   }
  },
  { timestamps: true }
);

export default mongoose.model("sensorModel7", sensorSchema);
