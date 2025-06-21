import mongoose from "mongoose";
const { Schema } = mongoose;

const sensorSchema = new mongoose.Schema({
    id: {
        type: String,
    },
    waveguide: {
        type: String,
    },
    sensor1: { type: String },
    sensor2: { type: String },
    sensor3: { type: String },
    sensor4: { type: String },
    sensor5: { type: String },
    sensor6: { type: String },
    sensor7: { type: String },
    sensor8: { type: String },
    sensor9: { type: String },
    sensor10: { type: String },
    sensor11: { type: String },
    sensor12: { type: String },
    sensor13: { type: String },
    sensor14: { type: String },
    sensor15: { type: String },
    sensor16: { type: String },
    sensor17: { type: String },
    sensor18: { type: String },
    sensor19: { type: String },
    sensor20: { type: String },
    sensor21: { type: String },
    sensor22: { type: String },
    sensor23: { type: String },
    sensor24: { type: String },
    sensor25: { type: String },
    sensor26: { type: String },
    sensor27: { type: String },
    sensor28: { type: String },
    sensor29: { type: String },
    sensor30: { type: String },
    sensor31: { type: String },
    sensor32: { type: String },
    sensor33: { type: String },
    sensor34: { type: String },
    sensor35: { type: String },
    sensor36: { type: String },
    sensor37: { type: String },
    sensor38: { type: String },
    TIME: {
        type: String,
    },
}, { timestamps: true });

export default mongoose.model('Sensorvalues', sensorSchema);
