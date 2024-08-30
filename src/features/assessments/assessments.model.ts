import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const assessmentSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        password: {
            type: String,
            required: true,
            select: 0,
        },
        publicId: {
            type: String,
            required: true,
        },
        fileURL: {
            type: String,
            required: true,
            select: 0,
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
        type: {
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

// PRE DOCUMENT MIDDLEWARE FOR HASHING PASSWORD
assessmentSchema.pre("save", async function (next) {
    if (this.isNew || this.isModified("password")) {
        const hashedPassword = await bcrypt.hash(this.password, 10);
        this.password = hashedPassword;
        return next();
    }

    return next();
});

const AssessmentModel = mongoose.model("Assessment", assessmentSchema);
export default AssessmentModel;
