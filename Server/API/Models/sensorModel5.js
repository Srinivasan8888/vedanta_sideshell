import mongoose from "mongoose";
const {Schema} = mongoose;

const sensorSchema = new mongoose.Schema({
    id:{
        type:String,
    }, busbar:{
        type:String,
    },
    CBT17A1:{
        type:String
    },
    CBT17A2:{
        type:String
    },
    CBT18A1:{
        type:String
    },
    CBT18A2:{
        type:String
    },
    CBT19A1:{
        type:String
    },
    CBT19A2:{
        type:String
    },
    TIME: {
        type:String
     }
},{timestamps: true});

export default mongoose.model('sensorModel5',sensorSchema);