import joi from "joi"
import validator from "validator";
import ApiError from "../../../utils/ApiError"
import { IFileInput } from "../files.type";

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
            if (validator.isURL(value)) {
                return value;
            } else {
                return helpers.error("string.url");
            }
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

        isPublic: joi.boolean(),
        fileExtension: joi.string(),

        title: joi.string().min(10).max(200).required().messages({
            "string.min": "Title should be 10 characters atleast",
            "string.max": "Title cannot be longer than 200 characters",
            "string.empty": "Titlecannot be empty",
            "string.base": "Invalid title",
            "any.required": "Title is required",
        }),
        subject: joi
        .string()
        .valid(..._validSubjects)
        .required()
        .messages({
            "any.only": "Subject is not known",
            "string.empty": "Assessment must have a subject",
            "string.base": "Invalid assessment subject",
            "any.required": "Please select a subject for your assessment",
        }),
        type: joi
        .string()
        .valid("quiz", "proposal", "assignment", "report", "labtask")
        .required()
        .messages({
            "any.only":
                "Type must be one of quiz, proposal, assignment, report, labtask",
            "string.empty": "Assessment type cannot be empty",
            "string.base": "Assessment type should be a text value",
            "any.required": "Please select an assessment type",
        }),
    });

    return (data: IFileInput) => {
        const { error } = _createFileSchema.validate(data);
        if (error) {
            throw new ApiError(error.message, 400);
        }
    }

}