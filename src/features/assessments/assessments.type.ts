export interface IAssessmentInput {
    title: string;
    fileURL: string;
    fileExtension: string;
    subject: string;
    type: string;
    isPublic: boolean;
    publicId?: string;
}
