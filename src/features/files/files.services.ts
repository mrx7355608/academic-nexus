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
    // LIST ALL FILES
    const listAll = async (page: number) => {
        const LIMIT = 15;
        const skipVal = (page - 1) * LIMIT;
        const files = await filesDB.findAll(skipVal);
        return files;
    };

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
        await filesDB.insert(data);
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
        cloudinaryService.deleteResource(file.publicId, file.fileExtension);
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
        listAll,
        listOne,
        create,
        edit,
        remove,
        validateFile,
    };
}
