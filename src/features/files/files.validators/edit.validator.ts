import joi from "joi";
import { IFileInput } from "../files.type";
import ApiError from "../../../utils/ApiError";
import validator from "validator";

export default function validateEditFileData() {
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

    const editValidationSchema = joi.object({
        fileURL: joi
            .string()
            .custom(function (value, helpers) {
                return validator.isURL(value)
                    ? value
                    : helpers.error("string.url");
            })
            .messages({
                "string.empty": "File URL cannot be empty",
                "string.base": "Invalid file url",
                "string.url": "Invalid file url",
            }),

        fileExtension: joi
            .string()
            .valid("pdf", "doc", "docx", "ppt", "xlsx")
            .messages({
                "any.only": "The file extension is not allowed",
                "string.empty": "File extension cannot be empty",
                "string.base": "Invalid file extension",
            }),

        title: joi.string().min(10).max(200).messages({
            "string.min": "Title should be 10 characters atleast",
            "string.max": "Title cannot be longer than 200 characters",
            "string.empty": "Title cannot be empty",
            "string.base": "Invalid title",
        }),

        isPublic: joi.boolean().required(),

        subject: joi
            .string()
            .valid(..._validSubjects)
            .messages({
                "any.only": "Unknown subject",
                "string.empty": "Subject cannot be empty",
                "string.base": "Invalid subject",
                "any.required": "Subject is required",
            }),
    });

    return (data: IFileInput) => {
        const { error } = editValidationSchema.validate(data);
        if (error) {
            throw new ApiError(error.message, 400);
        }
    };
}
