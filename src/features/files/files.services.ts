import mongoose from "mongoose";
import ApiError from "../../utils/ApiError";
import { IFile, IFileDB } from "./files.type";
import fileValidators from "./files.validators";
import validator from "validator";

interface ICloudinaryService {
    deleteResource: (publicId: string, fileExtension: string) => void;
}

export default function FileServices(
    filesDB: IFileDB,
    cloudinaryService: ICloudinaryService,
) {
    // LIST ONE FILE BY ID
    const listOne = async (fileId: string) => {
        const file = await validateFile(fileId);
        const populatedFile = await file.populate(
            "author",
            "fullname profilePicture",
        );
        return populatedFile;
    };

    // CREATE NEW FILE
    const create = async (data: IFile) => {
        fileValidators.createValidator(data);
        const file = await filesDB.insert(data);
        return await file.populate("author", "profilePicture fullname");
    };

    // EDIT FILE
    const edit = async (
        fileId: string,
        userId: string,
        changes: Partial<IFile>,
    ) => {
        const file = await validateFile(fileId);

        if (String(file.author) !== userId)
            throw new ApiError("You cannot edit this file", 403);

        fileValidators.editValidator(changes);
        const updated = await filesDB.update(fileId, changes);
        return updated;
    };

    // REMOVE FILE
    const remove = async (fileId: string, userId: string) => {
        const file = await validateFile(fileId);

        // Check if author matches
        if (String(file.author) !== userId) {
            throw new ApiError("You cannot delete this file", 403);
        }

        // Delete assessment from database
        await filesDB.remove(fileId);

        // Also delete file from cloudnary
        if (process.env.NODE_ENV !== "test") {
            cloudinaryService.deleteResource(file.publicId, file.fileExtension);
        }
    };

    // UPVOTE FILE
    const upvote = async (fileId: string, userId: string) => {
        // 1. Validate file id and return file
        const file = await validateFile(fileId);

        // 2. Check if user has already upvoted this file
        const userObjectId = new mongoose.Types.ObjectId(userId);
        if (file.upvotes.includes(userObjectId)) {
            throw new ApiError("You have already upvoted this file", 400);
        }

        // 3. Update votes
        const updatedFile = await filesDB.update(fileId, {
            $push: { upvotes: userId },
            $pull: { downvotes: userId },
        } as any);

        return updatedFile;
    };

    // DOWN-VOTE FILE
    const downvote = async (fileId: string, userId: string) => {
        // 1. Validate file id and return file
        const file = await validateFile(fileId);

        // 2. Check if user has already downvoted this file
        const userObjectId = new mongoose.Types.ObjectId(userId);
        if (file.downvotes.includes(userObjectId)) {
            throw new ApiError("You have already downvoted this file", 400);
        }

        // 3. Update votes
        const updatedFile = await filesDB.update(fileId, {
            $pull: { upvotes: userId },
            $push: { downvotes: userId },
        } as any);

        return updatedFile;
    };

    /*
     * UTILITY FUNCTIONS
     */
    const validateFile = async (id: string) => {
        if (!validator.isMongoId(id)) {
            throw new ApiError("Invalid file id", 400);
        }

        const file = await filesDB.findById(id);
        if (!file) {
            throw new ApiError("File not found", 404);
        }

        return file;
    };

    return {
        listOne,
        create,
        edit,
        remove,
        validateFile,
        upvote,
        downvote,
    };
}
