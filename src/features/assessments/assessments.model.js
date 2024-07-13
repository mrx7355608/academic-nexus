import mongoose from "mongoose";

const assessmentSchema = new mongoose.Schema(
    {
        isPublic: {
            type: Boolean,
            default: true,
        },
        title: {
            type: String,
            required: true,
        },
        fileURL: {
            type: String,
            required: true,
        },
        fileExtension: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
    },
    { timestamps: true },
);

const AssessmentModel = mongoose.model("Assessment", assessmentSchema);
export default AssessmentModel;
