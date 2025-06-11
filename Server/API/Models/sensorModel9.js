import mongoose from "mongoose";
const {Schema} = mongoose;

const sensorSchema = new mongoose.Schema({
    id:{
        type:String,
    }, 
    busbar:{
        type:String,
    },
    CBT15B1:{
        type:String
    },
    CBT15B2:{
        type:String
    },
    CBT16B1:{
        type:String
    },
    CBT16B2:{
        type:String
    },
    CBT17B1:{
        type:String
    },
    CBT17B2:{
        type:String
    },
    CBT18B1:{
        type:String
    },
    CBT18B2:{
        type:String
    },
    TIME: {
        type:String
     }
},{timestamps: true});

export default mongoose.model('sensorModel9',sensorSchema);