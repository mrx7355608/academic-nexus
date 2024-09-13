import { IFileDocument } from "../files.type";

type IAuthor = {
    id: string;
    fullname: string;
    profilePicture: string;
};

class ResponseFileDTO {
    public id: string;
    public title: string;
    public subject: string;
    public fileExtension: string;
    public fileURL: string;
    public isPublic: boolean;
    public publicId: string;
    public createdAt: string;
    public author: IAuthor;

    constructor(file: IFileDocument) {
        this.id = String(file._id);
        this.title = file.title;
        this.subject = file.subject;
        this.fileURL = file.fileURL;
        this.isPublic = file.isPublic;
        this.fileExtension = file.fileExtension;
        this.publicId = file.publicId;
        this.createdAt = new Date(file.createdAt).toDateString();
        this.author = {
            id: (file.author as any)._id,
            fullname: (file.author as any).fullname,
            profilePicture: (file.author as any).profilePicture,
        };
    }
}

export default ResponseFileDTO;
