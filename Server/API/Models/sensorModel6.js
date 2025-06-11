import mongoose from "mongoose";
const {Schema} = mongoose;

const sensorSchema = new mongoose.Schema({
    id:{
        type:String,
    }, busbar:{
        type:String,
    },
    CBT20A1:{
        type:String
    },
    CBT20A2:{
        type:String
    },
    CBT21A1:{
        type:String
    },
    CBT21A2:{
        type:String
    },
    CBT22A1:{
        type:String
    },
    CBT22A2:{
        type:String
    },
    CBT23A1:{
        type:String
    },
    CBT23A2:{
        type:String
    },
    CBT24A1:{
        type:String
    },
    CBT24A2:{
        type:String
     },
     CBT25A1:{
        type:String
    },
    CBT25A2:{
        type:String
     },
     CBT26A1:{
        type:String
    },
    CBT26A2:{
        type:String
     },
     CBT27A1:{
        type:String
    },
    CBT27A2:{
        type:String
     },
     TIME: {
        type:String
     }
},{timestamps: true});

export default mongoose.model('sensorModel6',sensorSchema);