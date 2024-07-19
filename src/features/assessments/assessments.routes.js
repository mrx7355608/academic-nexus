import { Router } from "express";
import AssessmentModel from "./assessments.model.js";
import isAuth from "../../middlewares/isAuth.js";
import https from "https";
import bcrypt from "bcryptjs";
import ApiError from "../../utils/ApiError.js";

const router = Router();

// GET ALL ASSESSMENTS
router.get("/", async (req, res, next) => {
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
            $project: { fileURL: 0 },
        });

        // Fetch data from database
        const assessments = await AssessmentModel.aggregate(aggregateStages);
        await AssessmentModel.populate(assessments, { path: "author" });
        return res.status(200).json({
            ok: true,
            data: assessments,
        });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

// GET SINGLE ASSESSMENT BY ID
router.get("/:id", async (req, res, next) => {
    try {
        const assessment = await AssessmentModel.findById(
            req.params.id,
            "-fileURL",
        ).populate("author", "fullname profilePicture");
        return res.status(200).json({
            ok: true,
            data: assessment,
        });
    } catch (err) {
        return next(err);
    }
});

// CREATE NEW ASSESSMENT
router.post("/", isAuth, async (req, res, next) => {
    try {
        const data = req.body;

        // TODO: validate data

        await AssessmentModel.create({ ...data, author: req.user });
        return res.status(201).json({
            ok: true,
            data: null,
        });
    } catch (err) {
        return next(err);
    }
});

// UPVOTE ASSESSMENT
router.post("/:id/upvote", async (req, res, next) => {
    try {
        const { id } = req.params;

        // TODO: validate id and assessment existence

        const updated = await AssessmentModel.findByIdAndUpdate(
            id,
            {
                $push: { upvotes: req.user._id },
                $pull: { downvotes: req.user._id },
            },
            { new: true },
        );
        return res.status(201).json({
            ok: true,
            data: {
                upvotes: updated.upvotes,
                downvotes: updated.downvotes,
            },
        });
    } catch (err) {
        return next(err);
    }
});

// DOWNVOTE ASSESSMENT
router.post("/:id/downvote", async (req, res, next) => {
    try {
        const { id } = req.params;

        // TODO: validate id and assessment existence

        const updated = await AssessmentModel.findByIdAndUpdate(
            id,
            {
                $pull: { upvotes: req.user._id },
                $push: { downvotes: req.user._id },
            },
            { new: true },
        );
        return res.status(201).json({
            ok: true,
            data: {
                upvotes: updated.upvotes,
                downvotes: updated.downvotes,
            },
        });
    } catch (err) {
        return next(err);
    }
});

// VIEW ASSESSMENT FILE
router.get("/view-assessment-file/:id", async (req, res, next) => {
    try {
        const contentTypeMap = {
            pdf: "application/pdf",
            doc: "application/msword",
            docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            png: "image/png",
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
        };
        // Get public id from database using the assessment id
        const assessment = await AssessmentModel.findById(req.params.id);

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
});

// DOWNLOAD ASSESSMENT FILE
router.post("/download-file/:id", async (req, res, next) => {
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

        // Get public id from database using the assessment id
        const assessment = await AssessmentModel.findById(
            req.params.id,
            "+password",
        );

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
});

export default router;
