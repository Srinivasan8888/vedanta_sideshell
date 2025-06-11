import mongoose from "mongoose";
const {Schema} = mongoose;

const sensorSchema = new mongoose.Schema({
    id:{
        type:String,
    }, busbar:{
        type:String,
    },
    CBT11B1:{
        type:String
    },
    CBT11B2:{
        type:String
    },
    CBT12B1:{
        type:String
    },
    CBT12B2:{
        type:String
    },
    CBT13B1:{
        type:String
    },
    CBT13B2:{
        type:String
    },
    CBT14B1:{
        type:String
    },
    CBT14B2:{
        type:String
    },
    TIME: {
        type:String
     }
},{timestamps: true});

export default mongoose.model('sensorModel8',sensorSchema);