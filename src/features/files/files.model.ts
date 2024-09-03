import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        publicId: {
            type: String,
            required: true,
        },
        fileURL: {
            type: String,
            required: true,
        },
        isPublic: {
            type: Boolean,
            default: true,
        },
        fileExtension: {
            type: String,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },
        upvotes: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Student",
                },
            ],
            default: [],
        },
        downvotes: {
            type: [
                {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Student",
                },
            ],
            default: [],
        },
    },
    { timestamps: true },
);

const FileModel = mongoose.model("File", fileSchema);
export default FileModel;
