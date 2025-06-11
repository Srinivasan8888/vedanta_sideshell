import mongoose from "mongoose";

const ReportSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true
    },
    phoneNo: {
        type: String,
        required: true,
        unique: true
    },
    employeeNo: {
        type: String,
        required: true,
        unique: true
    }
});

export default mongoose.model("SetAlert-users", ReportSchema);