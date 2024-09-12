import { Document } from "mongoose";

export interface IFile {
    title: string;
    fileURL: string;
    fileExtension: string;
    subject: string;
    isPublic: boolean;
    publicId: string;
}

export interface IFileMongooseDocument extends Document, IFile {}

export interface IFileDB {
    findAll: (skip: number) => Promise<IFileMongooseDocument[]>;
    findOne: (title: string) => Promise<IFileMongooseDocument | null>;
    findById: (id: string) => Promise<IFileMongooseDocument | null>;
    insert: (data: IFile) => Promise<IFileMongooseDocument>;
    update: (
        id: string,
        changes: Partial<IFile>,
    ) => Promise<IFileMongooseDocument>;
    remove: (id: string) => Promise<void>;
}
