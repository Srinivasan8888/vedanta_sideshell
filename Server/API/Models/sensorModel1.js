import mongoose from "mongoose";
const {Schema} = mongoose;

const sensorSchema = new mongoose.Schema({
    id:{
        type:String,
    },
    busbar:{
        type:String,
    },
    CBT1A1:{
        type:String
    },
    CBT1A2:{
        type:String
    },
    CBT2A1:{
        type:String
    },
    CBT2A2:{
        type:String
    },
    CBT3A1:{
        type:String
    },
    CBT3A2:{
        type:String
    },
    CBT4A1:{
        type:String
    },
    CBT4A2:{
        type:String
    },
    CBT5A1:{
        type:String
    },
    CBT5A2:{
        type:String
     },
     CBT6A1:{
        type:String
    },
    CBT6A2:{
        type:String
     },
     CBT7A1:{
        type:String
    },
    CBT7A2:{
        type:String
     },
     TIME: {
        type:String
     }
},{timestamps: true});

export default mongoose.model('SensorModel1',sensorSchema);