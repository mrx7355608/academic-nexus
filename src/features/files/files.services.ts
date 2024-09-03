import FilesModel from "./files.model";
import { IFileInput } from "./files.type";
import fileValidators from "./files.validators";
import ApiError from "../../utils/ApiError";
import config from "../../config/config";
import { v2 as cloudinary } from "cloudinary";
import validator from "validator";
import StudentModel from "../students/students.model";

cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
});

export default function FileServices() {
    const listAll = async () => {};

    const listOne = async (assessment: any) => {
        return await assessment.populate("author", "fullname profilePicture");
    };

    const create = async (data: IFileInput, userId: string): Promise<void> => {
        fileValidators.createValidator(data);
        await FilesModel.create({ ...data, author: userId });
    };

    const edit = async (
        assessment: any,
        userId: string,
        changes: IFileInput,
    ) => {
        // Check if author matches
        if (String(assessment.author) !== userId) {
            throw new ApiError("You cannot edit this assessment", 403);
        }

        // Validate new changes
        fileValidators.editValidator(changes);

        // Update assessment
        const updated = await FilesModel.findByIdAndUpdate(
            assessment._id,
            changes,
            { new: true },
        );

        return updated;
    };

    const remove = async (assessment: any, userId: string) => {
        // Check if author matches
        if (String(assessment.author) !== userId) {
            throw new ApiError("You cannot delete this assessment", 403);
        }

        // Delete assessment
        await FilesModel.findByIdAndDelete(assessment._id);

        // Also delete file from cloudnary
        cloudinary.api
            .delete_resources([assessment.publicId], {
                type: "upload",
                resource_type:
                    assessment.fileExtension === "docx" ? "raw" : "image",
            })
            .then(console.log);
    };

    const listMyFiles = async (type: string, subject: string | undefined) => {
        // Validate type
        const validTypes = [
            "quiz",
            "assignment",
            "report",
            "proposal",
            "labtask",
        ];
        if (!validTypes.includes(type)) {
            throw new ApiError("Invalid type", 400);
        }

        // Build query
        let queryFilter = { type };

        // Get subject from query
        if (subject) {
            queryFilter = Object.assign(queryFilter, {
                subject: subject,
            });
        }

        // Find files
        const files = await FilesModel.find(queryFilter).populate(
            "author",
            "fullname",
        );

        return files;
    };

    const listStudentFiles = async (studentId: string) => {
        if (!validator.isMongoId(studentId)) {
            throw new ApiError("Invalid student id", 400);
        }

        const student = await StudentModel.findById(studentId);
        if (!student) {
            throw new ApiError("Student not found", 404);
        }

        const files = await FilesModel.find({ author: studentId }).populate(
            "author",
            "fullname",
        );

        return files;
    };

    return {
        listAll,
        listMyFiles,
        listStudentFiles,
        listOne,
        create,
        edit,
        remove,
    };
}
