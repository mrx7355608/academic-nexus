import mongoose from "mongoose";
import { IFileDocument } from "./files.type";

const fileSchema = new mongoose.Schema<IFileDocument>(
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
            type: [{ type: mongoose.Types.ObjectId, ref: "Student" }],
            default: [],
        },
        downvotes: {
            type: [{ type: mongoose.Types.ObjectId, ref: "Student" }],
            default: [],
        },
    },
    { timestamps: true },
);

const FileModel = mongoose.model<IFileDocument>("File", fileSchema);
export default FileModel;
