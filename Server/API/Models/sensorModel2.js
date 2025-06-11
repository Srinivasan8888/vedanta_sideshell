import mongoose from "mongoose";
const {Schema} = mongoose;

const sensorSchema = new mongoose.Schema({
    id:{
        type:String,
    }, busbar:{
        type:String,
    },
    CBT8A1:{
        type:String
    },
    CBT8A2:{
        type:String
    },
    CBT9A1:{
        type:String
    },
    CBT9A2:{
        type:String
    },
    CBT10A1:{
        type:String
    },
    CBT10A2:{
        type:String
    },
    TIME:{
        type:String
    },
},{timestamps: true});

export default mongoose.model('sensorModel2',sensorSchema);