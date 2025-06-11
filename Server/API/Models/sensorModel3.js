import mongoose from "mongoose";
const {Schema} = mongoose;

const sensorSchema = new mongoose.Schema({
    id:{
        type:String,
    }, busbar:{
        type:String,
    },
    CBT11A1:{
        type:String
    },
    CBT11A2:{
        type:String
    },
    CBT12A1:{
        type:String
    },
    CBT12A2:{
        type:String
    },
    CBT13A1:{
        type:String
    },
    CBT13A2:{
        type:String
    },
    CBT14A1:{
        type:String
    },
    CBT14A2:{
        type:String
    },
    TIME: {
        type:String
     }
},{timestamps: true});

export default mongoose.model('sensorModel3',sensorSchema);