import FileModel from "./files.model";
import { IFile, IFileDB } from "./files.type";

export default function FilesDB(): IFileDB {
    const findAll = async (skip: number) => {
        const files = await FileModel.find({}).skip(skip).limit(15);
        return files;
    };
    const findOne = async (title: string) => {
        return await FileModel.findOne({
            title: {
                $regex: new RegExp(title),
                $options: "i",
            },
        });
    };

    const findById = async (id: string) => await FileModel.findById(id);

    const insert = async (data: IFile) => await FileModel.create(data);

    const update = async (id: string, changes: Partial<IFile>) => {
        const updated = await FileModel.findByIdAndUpdate(id, changes, {
            new: true,
        });
        return updated!;
    };

    const remove = async (id: string) => {
        await FileModel.findByIdAndDelete(id);
    };

    return {
        findAll,
        findOne,
        findById,
        insert,
        update,
        remove,
    };
}
