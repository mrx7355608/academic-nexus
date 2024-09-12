import joi from "joi";
import validator from "validator";
import ApiError from "../../../utils/ApiError";
import { IFile } from "../files.type";

export default function validateCreateFileData() {
    const _validSubjects = [
        "Linear Algebra",
        "Programming Fundamentals",
        "Object Oriented Programming",
        "Data Structures & Algorithms",
        "Data Communication & Computer Networks",
        "Computer Architecture & Assembly Language",
        "Funtional English",
        "Applied Physics",
        "Web Programming",
        "Personal Development",
        "Philosophy and Critical Thinking",
        "Digital Logic Design",
    ];

    const _createFileSchema = joi.object({
        fileURL: joi
            .string()
            .custom(function (value, helpers) {
                return validator.isURL(value)
                    ? value
                    : helpers.error("string.url");
            })
            .required()
            .messages({
                "string.empty": "File URL cannot be empty",
                "string.base": "Invalid file url",
                "string.url": "Invalid file url",
                "any.required": "Please upload a file first",
            }),

        publicId: joi.string().required().messages({
            "string.empty": "Public id is missing",
            "string.base": "Invalid public id",
            "any.required": "Public id is required",
        }),

        title: joi.string().min(10).max(200).required().messages({
            "string.min": "Title should be 10 characters atleast",
            "string.max": "Title cannot be longer than 200 characters",
            "string.empty": "Title cannot be empty",
            "string.base": "Invalid title",
            "any.required": "Title is required",
        }),

        subject: joi
            .string()
            .valid(..._validSubjects)
            .required()
            .messages({
                "any.only": "Unknown subject",
                "string.empty": "subject cannot be empty",
                "string.base": "Invalid subject",
                "any.required": "Subject is required",
            }),

        isPublic: joi.boolean().valid(true, false).required().messages({
            "any.required": "File status is required",
            "boolean.base": "File status should be public or private",
            "any.only": "File status should be public or private",
        }),

        fileExtension: joi
            .string()
            .required()
            .valid("pdf", "doc", "docx", "ppt", "xlsx")
            .messages({
                "any.only": "The file extension is not allowed",
                "string.empty": "File extension cannot be empty",
                "string.base": "Invalid file extension",
                "any.required": "File extension is required",
            }),
    });

    return (data: IFile) => {
        const { error } = _createFileSchema.validate(data);
        if (error) {
            throw new ApiError(error.message, 400);
        }
    };
}
