import joi from "joi"
import { IFileInput } from "../files.type";
import ApiError from "../../../utils/ApiError"
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
            if (validator.isURL(value)) {
                return value;
            } else {
                return helpers.error("string.url");
            }
        })
        .messages({
            "string.empty": "File URL cannot be empty",
            "string.base": "Invalid file url",
            "string.url": "Invalid file url",
        }),
        fileExtension: joi
        .string()
        .valid("pdf", "doc", "docx", "png", "jpeg", "jpg")
        .messages({
            "any.only": "The file extension is not allowed",
            "string.empty": "File extension cannot be empty",
            "string.base": "Invalid file extension",
        }),
        title: joi.string().min(10).max(200).messages({
            "string.min": "Title should be 10 characters atleast",
            "string.max": "Title cannot be longer than 200 characters",
            "string.empty": "Titlecannot be empty",
            "string.base": "Invalid title",
        }),
        isPublic: joi.boolean().messages({
            "boolean.base": "Invalid isPublic value, should be true or false",
        }),
        subject: joi
        .string()
        .valid(..._validSubjects)
        .messages({
            "any.only": "Subject is not known",
            "string.empty": "Assessment must have a subject",
            "string.base": "Invalid assessment subject",
        }),
        type: joi
        .string()
        .valid("quiz", "proposal", "assignment", "report", "labtask")
        .messages({
            "any.only":
                "Type must be one of quiz, proposal, assignment, report, labtask",
            "string.empty": "Assessment type cannot be empty",
            "string.base": "Assessment type should be a text value",
        }),
    });

    return (data: IFileInput) => {
        const { error } = editValidationSchema.validate(data);
        if (error) {
            throw new ApiError(error.message, 400);
        }
    }

}
