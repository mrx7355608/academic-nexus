import joi from "joi";
import validator from "validator";
import ApiError from "../../utils/ApiError.js";

const validSubjects = [
    "Linear Algebra",
    "Programming Fundamentals",
    "Object Oriented Programming",
    "Data Structures & Algorithms",
    "Data Communication & Computer Networks",
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
        .custom(function (value) {
            return validator.isURL(value) ? true : false;
        })
        .messages({
            "string.empty": "File URL cannot be empty",
            "string.base": "Invalid file url",
            "string.custom": "Invalid file url",
        }),

    fileExtension: joi
        .string()
        .valid("pdf", "doc", "docx", "png", "jpeg", "jpg")
        .messages({
            "string.valid": "'$value' file extension is not allowed",
            "string.empty": "File extension cannot be empty",
            "string.base": "Invalid file extension",
        }),
    password: joi.string().min(8).max(20).messages({
        "string.min": "Password should be 8 characters atleast",
        "string.max": "Password cannot be longer than 20 characters",
        "string.empty": "Password cannot be empty",
        "string.base": "Invalid password",
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
        .valid(...validSubjects)
        .messages({
            "string.valid": "'$value' subject is not known",
            "string.empty": "Assessment must have a subject",
            "string.base": "Invalid assessment subject",
        }),
    type: joi
        .string()
        .valid("quiz", "proposal", "assignment", "report", "labtask")
        .messages({
            "string.valid": "$value is an invalid assessment type",
            "string.empty": "Assessment type cannot be empty",
            "string.base": "Assessment type should be a text value",
        }),
});

export function editAssessmentValidator(data) {
    const { error } = editValidationSchema.validate(data);
    if (error) {
        throw new ApiError(error.message, 400);
    }
}
