import FilesModel from "./files.model";
import validator from "validator";
import ApiError from "../../utils/ApiError";
import { v2 as cloudinary } from "cloudinary";
import StudentModel from "../students/students.model";
import config from "../../config/config";
import { RequestHandler } from "express";
import { PipelineStage } from "mongoose";
import fileValidators from "./files.validators"
import FileServices from "./files.services";

cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
});

const fileServices = FileServices();

const getAllFiles: RequestHandler = async (req, res, next) => {
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
        const assessments = await FilesModel.aggregate(aggregateStages);
        await FilesModel.populate(assessments, {
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

const getOneFile: RequestHandler = async (req, res, next) => {
    try {
        const assessment = fileServices.listOne((req as any).assessment)
        return res.status(200).json({
            ok: true,
            data: assessment,
        });
    } catch (err) {
        return next(err);
    }
};

const createFile: RequestHandler = async (req, res, next) => {
    try {
        const data = req.body;
        const userId= (req as any).user._id
        await fileServices.create(data, userId);

        return res.status(201).json({
            ok: true,
            data: null,
        });
    } catch (err) {
        return next(err);
    }
};

// const upvoteFiles: RequestHandler = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//
//         const updated = await FilesModel.findByIdAndUpdate(
//             id,
//             {
//                 $push: { upvotes: (req.user as any)._id },
//                 $pull: { downvotes: (req.user as any)._id },
//             },
//             { new: true },
//         );
//
//         return res.status(200).json({
//             ok: true,
//             data: {
//                 upvotes: updated!.upvotes,
//                 downvotes: updated!.downvotes,
//             },
//         });
//     } catch (err) {
//         return next(err);
//     }
// };

// const downvoteFiles: RequestHandler = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//
//         const updated = await FilesModel.findByIdAndUpdate(
//             id,
//             {
//                 $pull: { upvotes: (req.user as any)._id },
//                 $push: { downvotes: (req.user as any)._id },
//             },
//             { new: true },
//         );
//
//         return res.status(200).json({
//             ok: true,
//             data: {
//                 upvotes: updated!.upvotes,
//                 downvotes: updated!.downvotes,
//             },
//         });
//     } catch (err) {
//         return next(err);
//     }
// };

const editFile: RequestHandler = async (req, res, next) => {
    try {
        const assessment = (req as any).assessment;
        const assessmentId = (req as any).assessment._id;
        const userId = (req as any).user._id;
        const changes = req.body;
        const updated = await fileServices.edit(assessmentId, userId, assessment, changes);
        return res.status(200).json({
            ok: true,
            data: updated,
        });
    } catch (err) {
        return next(err);
    }
};

const deleteFile: RequestHandler = async (req, res, next) => {
    try {
        const assessment = (req as any).assessment;

        // Check if author matches
        if (String(assessment.author) !== String((req.user as any)._id)) {
            return next(new ApiError("You cannot delete this assessment", 403));
        }

        // Delete assessment
        await FilesModel.findByIdAndDelete(req.params.id);

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

const getMyFiles: RequestHandler = async (req, res, next) => {
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

        const assessments = await FilesModel.find(queryFilter).populate(
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

const getStudentFiles: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!validator.isMongoId(id)) {
            return next(new ApiError("Invalid mongo id", 400));
        }

        const student = await StudentModel.findById(id);
        if (!student) {
            return next(new ApiError("Student not found", 404));
        }

        const assessments = await FilesModel.find({ author: id }).populate(
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

const fileControllers = {
    getStudentFiles,
    getMyFiles,
    deleteFile,
    editFile,
    createFile,
    getAllFiles,
    getOneFile,
};

export default fileControllers;
