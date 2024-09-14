import mongoose, { Document } from "mongoose";

export interface IFile {
    title: string;
    fileURL: string;
    fileExtension: string;
    subject: string;
    isPublic: boolean;
    publicId: string;
    author: string | mongoose.Types.ObjectId;
}

export interface IFileDocument extends Document, IFile {
    createdAt: Date;
    updatedAt: Date;
    upvotes: mongoose.Types.ObjectId[];
    downvotes: mongoose.Types.ObjectId[];
}

export interface IFileDB {
    findAll: (skip: number) => Promise<IFileDocument[]>;
    findOne: (title: string) => Promise<IFileDocument | null>;
    findById: (id: string) => Promise<IFileDocument | null>;
    insert: (data: IFile) => Promise<IFileDocument>;
    update: (id: string, changes: Partial<IFile>) => Promise<IFileDocument>;
    remove: (id: string) => Promise<void>;
}
