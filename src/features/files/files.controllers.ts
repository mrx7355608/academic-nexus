import FilesModel from "./files.model";
import { RequestHandler } from "express";
import { PipelineStage } from "mongoose";
import FileServices from "./files.services";
import FilesDB from "./files.data";
import CloudinaryService from "../../utils/cloudinaryService";
import ResponseFileDTO from "./files.dto/ResponseFileDTO";

const filesDB = FilesDB();
const cloudinaryServices = CloudinaryService();

const fileServices = FileServices(filesDB, cloudinaryServices);

const getAllFiles: RequestHandler = async (req, res, next) => {
    try {
        const aggregateStages: PipelineStage[] = [];

        // Only select public files
        aggregateStages.push({ $match: { isPublic: true } });

        // Filtering
        if (req.query.subjects) {
            const subjects = (req.query.subjects as string).split(",");
            console.log({ subjects });
            aggregateStages.push({ $match: { subject: { $in: subjects } } });
        }

        // Sorting
        if (req.query.sort === "oldest") {
            aggregateStages.push({ $sort: { createdAt: 1 } });
        } else {
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

        // Paginating
        const LIMIT = 10;
        let page = 1;
        if (req.query.page) {
            page = Number.parseInt(req.query.page as string);
        }
        const skip = (page - 1) * LIMIT;
        aggregateStages.push({ $skip: skip });
        aggregateStages.push({ $limit: LIMIT });

        // Fetch data from database
        const files = await FilesModel.aggregate(aggregateStages);
        await FilesModel.populate(files, {
            path: "author",
            select: "fullname",
        });
        const filesDTO = files.map((file) => new ResponseFileDTO(file));

        return res.status(200).json({
            ok: true,
            data: filesDTO,
        });
    } catch (err) {
        return next(err);
    }
};

const getOneFile: RequestHandler = async (req, res, next) => {
    try {
        const fileId = req.params.id;
        const file = await fileServices.listOne(fileId);
        return res.status(200).json({
            ok: true,
            data: new ResponseFileDTO(file),
        });
    } catch (err) {
        return next(err);
    }
};

const createFile: RequestHandler = async (req, res, next) => {
    try {
        const authorId = String((req as any).user._id);
        const data = { ...req.body, author: authorId };
        const file = await fileServices.create(data);

        return res.status(201).json({
            ok: true,
            data: new ResponseFileDTO(file),
        });
    } catch (err) {
        return next(err);
    }
};

const editFile: RequestHandler = async (req, res, next) => {
    try {
        const fileId = req.params.id;
        const userId = String((req as any).user._id);
        const changes = req.body;

        const updated = await fileServices.edit(fileId, userId, changes);
        const file = await updated.populate(
            "author",
            "fullname profilePicture",
        );

        return res.status(200).json({
            ok: true,
            data: new ResponseFileDTO(file),
        });
    } catch (err) {
        return next(err);
    }
};

const deleteFile: RequestHandler = async (req, res, next) => {
    try {
        const fileId = req.params.id;
        const userId = String((req.user as any)._id);
        await fileServices.remove(fileId, userId);
        return res.status(204).end();
    } catch (err) {
        return next(err);
    }
};

const upvoteFiles: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = String((req as any).user._id);
        const updatedFile = await fileServices.upvote(id, userId);

        return res.status(200).json({
            ok: true,
            data: {
                upvotes: updatedFile.upvotes,
                downvotes: updatedFile.downvotes,
            },
        });
    } catch (err) {
        return next(err);
    }
};

const downvoteFiles: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = String((req as any).user._id);
        const updatedFile = await fileServices.downvote(id, userId);

        return res.status(200).json({
            ok: true,
            data: {
                upvotes: updatedFile.upvotes,
                downvotes: updatedFile.downvotes,
            },
        });
    } catch (err) {
        return next(err);
    }
};

// const getMyFiles: RequestHandler = async (req, res, next) => {
//     try {
//         const { type } = req.params;
//         const subject = req.query.subject as string | undefined;
//         const files = await fileServices.listMyFiles(type, subject);
//         return res.status(200).json({
//             ok: true,
//             data: files,
//         });
//     } catch (error) {
//         return next(error);
//     }
// };
//
// const getStudentFiles: RequestHandler = async (req, res, next) => {
//     try {
//         const { id } = req.params;
//         const files = await fileServices.listStudentFiles(id);
//         return res.status(200).json({
//             ok: true,
//             data: files,
//         });
//     } catch (error) {
//         return next(error);
//     }
// };

const fileControllers = {
    deleteFile,
    editFile,
    createFile,
    getAllFiles,
    getOneFile,
    upvoteFiles,
    downvoteFiles,
};

export default fileControllers;
