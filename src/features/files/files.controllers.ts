import AssessmentModel from "./assessments.model";
import validator from "validator";
import bcrypt from "bcryptjs";
import ApiError from "../../utils/ApiError";
import https from "https";
import {
    createAssessmentValidator,
    editAssessmentValidator,
} from "./assessments.validators";
import { v2 as cloudinary } from "cloudinary";
import StudentModel from "../students/students.model";
import config from "../../config/config";
import { RequestHandler } from "express";
import { PipelineStage } from "mongoose";

cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
});

const getAllAssessments: RequestHandler = async (req, res, next) => {
    try {
        const aggregateStages: PipelineStage[] = [];
        aggregateStages.push({ $match: { isPublic: true } });

        // Filtering
        if (req.query.subjects) {
            const subjects = (req.query.subjects as string).split(",");
            aggregateStages.push({ $match: { subject: { $in: subjects } } });
        }

        if (req.query.types) {
            const types = (req.query.subjects as string).split(",");
            aggregateStages.push({ $match: { type: { $in: types } } });
        }

        // Sorting - BY LATEST UPLOAD
        if (req.query.sort === "oldest") {
            aggregateStages.push({ $sort: { createdAt: 1 } });
        }

        // Sorting - BY HIGHEST VOTES
        else if (req.query.sort === "highest votes") {
            aggregateStages.push({
                $addFields: {
                    averageVotes: {
                        $subtract: [
                            { $size: "$upvotes" },
                            { $size: "$downvotes" },
                        ],
                    },
                },
            });
            aggregateStages.push({ $sort: { averageVotes: -1 } });
        }
        // Sorting - DEFAULT
        else {
            aggregateStages.push({ $sort: { createdAt: -1 } });
        }

        // Searching
        if (req.query.s) {
            aggregateStages.push({
                $match: {
                    title: {
                        $regex: new RegExp(req.query.s as string),
                        $options: "i",
                    },
                },
            });
        }

        // Deselect fileURL field from all the documents
        aggregateStages.push({
            $project: {
                fileURL: 0,
                password: 0,
                publicId: 0,
                updatedAt: 0,
                __v: 0,
            },
        });

        // Fetch data from database
        const assessments = await AssessmentModel.aggregate(aggregateStages);
        await AssessmentModel.populate(assessments, {
            path: "author",
            select: "fullname",
        });

        return res.status(200).json({
            ok: true,
            data: assessments,
        });
    } catch (err) {
        return next(err);
    }
};

const getOneAssessment: RequestHandler = async (req, res, next) => {
    try {
        const assessment = await (req as any).assessment.populate(
            "author",
            "fullname profilePicture",
        );
        return res.status(200).json({
            ok: true,
            data: assessment,
        });
    } catch (err) {
        return next(err);
    }
};

const createAssessment: RequestHandler = async (req, res, next) => {
    try {
        const data = req.body;

        // Validate data
        createAssessmentValidator(data);

        await AssessmentModel.create({ ...data, author: req.user });

        return res.status(201).json({
            ok: true,
            data: null,
        });
    } catch (err) {
        return next(err);
    }
};

const upvoteAssessment: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updated = await AssessmentModel.findByIdAndUpdate(
            id,
            {
                $push: { upvotes: (req.user as any)._id },
                $pull: { downvotes: (req.user as any)._id },
            },
            { new: true },
        );

        return res.status(200).json({
            ok: true,
            data: {
                upvotes: updated!.upvotes,
                downvotes: updated!.downvotes,
            },
        });
    } catch (err) {
        return next(err);
    }
};

const downvoteAssessment: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        const updated = await AssessmentModel.findByIdAndUpdate(
            id,
            {
                $pull: { upvotes: (req.user as any)._id },
                $push: { downvotes: (req.user as any)._id },
            },
            { new: true },
        );

        return res.status(200).json({
            ok: true,
            data: {
                upvotes: updated!.upvotes,
                downvotes: updated!.downvotes,
            },
        });
    } catch (err) {
        return next(err);
    }
};

type IContent = {
    pdf: string;
    doc: string;
    docx: string;
    png: string;
    jpg: string;
    jpeg: string;
    [key: string]: string;
};
const viewAssessmentFile: RequestHandler = async (req, res, next) => {
    try {
        const contentTypeMap: IContent = {
            pdf: "application/pdf",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
        };

        // Validate assessment id
        if (!validator.isMongoId(req.params.id)) {
            return next(new ApiError("Invalid assessment id", 400));
        }

        // Check if assessment exists
        const assessment = await AssessmentModel.findById(
            req.params.id,
            "+fileURL",
        );

        if (!assessment) {
            return next(new ApiError("Assessment not found", 404));
        }

        // Send resource back to frontend
        https.get(assessment.fileURL, (stream) => {
            res.setHeader(
                "Content-Type",
                contentTypeMap[assessment.fileExtension],
            );
            stream.pipe(res);

            // TODO: handle https errors during stream
        });
    } catch (err) {
        return next(err);
    }
};

const downloadFile: RequestHandler = async (req, res, next) => {
    try {
        const contentTypeMap: IContent = {
            pdf: "application/pdf",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
        };

        const { password } = req.body;

        // Validate assessment id
        if (!validator.isMongoId(req.params.id)) {
            return next(new ApiError("Invalid assessment id", 400));
        }

        // Check if assessment exists
        const assessment = await AssessmentModel.findById(
            req.params.id,
            "+password +fileURL",
        );
        if (!assessment) {
            return next(new ApiError("Assessment not found", 404));
        }

        // Verify password
        const isValid = await bcrypt.compare(password, assessment.password);
        if (!isValid) {
            return next(new ApiError("Incorrect password", 403));
        }

        // Stream file back to frontend
        https.get(assessment.fileURL, (stream) => {
            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${assessment.title}.pdf"`,
            );
            res.setHeader(
                "Content-Type",
                contentTypeMap[assessment.fileExtension],
            );

            stream.pipe(res);

            // TODO: handle https errors during stream
        });
    } catch (err) {
        return next(err);
    }
};

const editAssessment: RequestHandler = async (req, res, next) => {
    try {
        const assessment = (req as any).assessment;

        // Check if author matches
        if (String(assessment.author) !== String((req.user as any)._id)) {
            return next(new ApiError("You cannot edit this assessment", 403));
        }

        // Validate new changes
        editAssessmentValidator(req.body);

        // Update assessment
        const updated = await AssessmentModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true },
        );

        return res.status(200).json({
            ok: true,
            data: updated,
        });
    } catch (err) {
        return next(err);
    }
};

const deleteAssessment: RequestHandler = async (req, res, next) => {
    try {
        const assessment = (req as any).assessment;

        // Check if author matches
        if (String(assessment.author) !== String((req.user as any)._id)) {
            return next(new ApiError("You cannot delete this assessment", 403));
        }

        // Delete assessment
        await AssessmentModel.findByIdAndDelete(req.params.id);

        // Also delete file from cloudnary
        cloudinary.api
            .delete_resources([assessment.publicId], {
                type: "upload",
                resource_type:
                    assessment.fileExtension === "docx" ? "raw" : "image",
            })
            .then(console.log);

        return res.status(204).end();
    } catch (err) {
        return next(err);
    }
};

const getMyAssessments: RequestHandler = async (req, res, next) => {
    try {
        const { type } = req.params;

        // Validate type
        const validTypes = [
            "quiz",
            "assignment",
            "report",
            "proposal",
            "labtask",
        ];
        if (!validTypes.includes(type)) {
            return next(new ApiError("Invalid type", 400));
        }

        // Build query
        let queryFilter = { type };

        // Get subject from query
        if (req.query.subject) {
            queryFilter = Object.assign(queryFilter, {
                subject: req.query.subject,
            });
        }

        const assessments = await AssessmentModel.find(queryFilter).populate(
            "author",
            "fullname",
        );
        return res.status(200).json({
            ok: true,
            data: assessments,
        });
    } catch (error) {
        next(error);
    }
};

const getStudentAssessments: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validator.isMongoId(id)) {
            return next(new ApiError("Invalid mongo id", 400));
        }

        const student = await StudentModel.findById(id);
        if (!student) {
            return next(new ApiError("Student not found", 404));
        }

        const assessments = await AssessmentModel.find({ author: id }).populate(
            "author",
            "fullname",
        );
        return res.status(200).json({
            ok: true,
            data: assessments,
        });
    } catch (error) {
        next(error);
    }
};

const assessmentControllers = {
    getStudentAssessments,
    getMyAssessments,
    deleteAssessment,
    editAssessment,
    downloadFile,
    viewAssessmentFile,
    downvoteAssessment,
    upvoteAssessment,
    createAssessment,
    getAllAssessments,
    getOneAssessment,
};

export default assessmentControllers;
