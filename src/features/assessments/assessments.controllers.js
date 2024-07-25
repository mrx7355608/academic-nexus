import AssessmentModel from "./assessments.model.js";
import validator from "validator";
import bcrypt from "bcryptjs";
import ApiError from "../../utils/ApiError.js";
import https from "https";
import {
    createAssessmentValidator,
    editAssessmentValidator,
} from "./assessments.validators.js";
import cloudinary from "cloudinary";
import StudentModel from "../students/students.model.js";
import apicache from "apicache";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function getAllAssessments(req, res, next) {
    try {
        const aggregateStages = [];
        aggregateStages.push({ $match: { isPublic: true } });

        // Filtering
        if (req.query.subjects) {
            const subjects = req.query.subjects.split(",");
            aggregateStages.push({ $match: { subject: { $in: subjects } } });
        }

        if (req.query.types) {
            const types = req.query.types.split(",");
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
                    title: { $regex: new RegExp(req.query.s), $options: "i" },
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
}

export async function getOneAssessment(req, res, next) {
    try {
        const assessment = await req.assessment.populate(
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
}

export async function createAssessment(req, res, next) {
    try {
        const data = req.body;

        // Validate data
        createAssessmentValidator(data);

        await AssessmentModel.create({ ...data, author: req.user });

        // Clear cache
        apicache.clear("/api/assessments");
        apicache.clear("/api/assessments/me");

        return res.status(201).json({
            ok: true,
            data: null,
        });
    } catch (err) {
        return next(err);
    }
}

export async function upvoteAssessment(req, res, next) {
    try {
        const { id } = req.params;

        const updated = await AssessmentModel.findByIdAndUpdate(
            id,
            {
                $push: { upvotes: req.user._id },
                $pull: { downvotes: req.user._id },
            },
            { new: true },
        );

        // Clear cache
        apicache.clear("/api/assessments");
        apicache.clear("/api/assessments/me");

        return res.status(200).json({
            ok: true,
            data: {
                upvotes: updated.upvotes,
                downvotes: updated.downvotes,
            },
        });
    } catch (err) {
        return next(err);
    }
}

export async function downvoteAssessment(req, res, next) {
    try {
        const { id } = req.params;

        const updated = await AssessmentModel.findByIdAndUpdate(
            id,
            {
                $pull: { upvotes: req.user._id },
                $push: { downvotes: req.user._id },
            },
            { new: true },
        );

        // Clear cache
        apicache.clear("/api/assessments");
        apicache.clear("/api/assessments/me");

        return res.status(200).json({
            ok: true,
            data: {
                upvotes: updated.upvotes,
                downvotes: updated.downvotes,
            },
        });
    } catch (err) {
        return next(err);
    }
}

export async function viewAssessmentFile(req, res, next) {
    try {
        const contentTypeMap = {
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
}

export async function downloadFile(req, res, next) {
    try {
        const contentTypeMap = {
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
}

export async function editAssessment(req, res, next) {
    try {
        const assessment = req.assessment;

        // Check if author matches
        if (String(assessment.author) !== String(req.user._id)) {
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

        // Hide sensitive fields
        updated.fileURL = undefined;
        updated.password = undefined;

        // Clear cache
        apicache.clear("/api/assessments");
        apicache.clear("/api/assessments/me");

        return res.status(200).json({
            ok: true,
            data: updated,
        });
    } catch (err) {
        return next(err);
    }
}

export async function deleteAssessment(req, res, next) {
    try {
        const assessment = req.assessment;

        // Check if author matches
        if (String(assessment.author) !== String(req.user._id)) {
            return next(new ApiError("You cannot delete this assessment", 403));
        }

        // Delete assessment
        await AssessmentModel.findByIdAndDelete(req.params.id);

        // Also delete file from cloudnary
        cloudinary.v2.api
            .delete_resources([assessment.publicId], {
                type: "upload",
                resource_type:
                    assessment.fileExtension === "docx" ? "raw" : "image",
            })
            .then(console.log);

        // Clear cache
        apicache.clear("/api/assessments");
        apicache.clear("/api/assessments/me");

        return res.status(204).end();
    } catch (err) {
        return next(err);
    }
}

export async function getMyAssessments(req, res, next) {
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
            queryFilter.subject = req.query.subject;
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
}

export async function getStudentAssessments(req, res, next) {
    try {
        const { id } = req.params;

        if (!validator.isMongoId(id)) {
            return next(new ApiError("Invalid mongo id"), 400);
        }

        const student = await StudentModel.findById(id);
        if (!student) {
            return next(new ApiError("Student not found"), 404);
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
}
