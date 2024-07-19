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
        .valid(...validSubjects)
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

const createValidationSchema = joi.object({
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

    password: joi.string().min(8).max(20).required().messages({
        "string.min": "Password should be 8 characters atleast",
        "string.max": "Password cannot be longer than 20 characters",
        "string.empty": "Password cannot be empty",
        "string.base": "Invalid password",
        "any.required": "Password is required",
    }),
    title: joi.string().min(10).max(200).required().messages({
        "string.min": "Title should be 10 characters atleast",
        "string.max": "Title cannot be longer than 200 characters",
        "string.empty": "Titlecannot be empty",
        "string.base": "Invalid title",
        "any.required": "Title is required",
    }),
    subject: joi
        .string()
        .valid(...validSubjects)
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

export function editAssessmentValidator(data) {
    const { error } = editValidationSchema.validate(data);
    if (error) {
        throw new ApiError(error.message, 400);
    }
}

export function createAssessmentValidator(data) {
    const { error } = createValidationSchema.validate(data);
    if (error) {
        throw new ApiError(error.message, 400);
    }
}
