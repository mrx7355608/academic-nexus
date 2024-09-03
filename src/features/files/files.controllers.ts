import FilesModel from "./files.model";
import { RequestHandler } from "express";
import { PipelineStage } from "mongoose";
import FileServices from "./files.services";

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
        const assessment = fileServices.listOne((req as any).assessment);
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
        const userId = (req as any).user._id;
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
        const userId = (req as any).user._id;
        const changes = req.body;

        const updated = await fileServices.edit(assessment, userId, changes);

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
        const userId = (req.user as any)._id;
        await fileServices.remove(assessment, userId);
        return res.status(204).end();
    } catch (err) {
        return next(err);
    }
};

const getMyFiles: RequestHandler = async (req, res, next) => {
    try {
        const { type } = req.params;
        const subject = req.query.subject as string | undefined;
        const files = await fileServices.listMyFiles(type, subject);
        return res.status(200).json({
            ok: true,
            data: files,
        });
    } catch (error) {
        return next(error);
    }
};

const getStudentFiles: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const files = await fileServices.listStudentFiles(id);
        return res.status(200).json({
            ok: true,
            data: files,
        });
    } catch (error) {
        return next(error);
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
