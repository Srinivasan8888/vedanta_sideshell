import mongoose from "mongoose";
const {Schema} = mongoose;

const sensorSchema = new mongoose.Schema({
    id:{
        type:String,
    },
    busbar:{
        type:String,
    },
    CBT15A1:{
        type:String
    },
    CBT15A2:{
        type:String
    },
    CBT16A1:{
        type:String
    },
    CBT16A2:{
        type:String
    },
    TIME: {
        type:String
     }
},{timestamps: true});

export default mongoose.model('sensorModel4',sensorSchema);