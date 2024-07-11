import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
    {
        googleId: {
            type: String,
            required: true,
        },
        fullname: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        profilePicture: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "Not provided",
        },
        degree: {
            type: String,
            default: "Not provided",
        },
    },
    {
        timestamps: true,
    },
);

const StudentModel = mongoose.model("Student", studentSchema);
export default StudentModel;
