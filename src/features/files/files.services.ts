import FilesModel from "./files.model"
import { IFileInput } from "./files.type";
import fileValidators from "./files.validators"
import ApiError from "../../utils/ApiError"

export default function FileServices() {
    const listAll = async () => {}

    const listOne = async (assessment: any) => {
        return await assessment.populate(
            "author",
            "fullname profilePicture",
        );
    }

    const create = async (data: IFileInput, userId: string): Promise<void> => {
        fileValidators.createValidator(data);
        await FilesModel.create({ ...data, author: userId });
    }

    const edit = async (assessmentId: string, userId: string, assessment: any, changes: IFileInput) => {
        // Check if author matches
        if (String(assessment.author) !== userId){
            throw new ApiError("You cannot edit this assessment", 403);
        }

        // Validate new changes
        fileValidators.editValidator(changes);

        // Update assessment
        const updated = await FilesModel.findByIdAndUpdate(
            assessmentId,
            changes,
            { new: true },
        );

        return updated;
    }
    const remove = async () => {}
    const listMyFiles = async () => {}
    const listStudentFiles = async () => {}

    return {
        listAll,
        listMyFiles,
        listStudentFiles,
        listOne,
        create,
        edit,
        remove,
    }
}
