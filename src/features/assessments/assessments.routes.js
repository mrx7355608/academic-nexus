import { Router } from "express";
import AssessmentModel from "./assessments.model.js";
import isAuth from "../../middlewares/isAuth.js";

const router = Router();

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

        // Fetch data from database
        const assessments = await AssessmentModel.aggregate(aggregateStages);
        return res.status(200).json({
            ok: true,
            data: assessments,
        });
    } catch (err) {
        console.log(err);
        return next(err);
    }
});

router.get("/:id", async (req, res, next) => {
    try {
        const assessment = await AssessmentModel.findById(
            req.params.id,
        ).populate("author", "fullname profilePicture");
        return res.status(200).json({
            ok: true,
            data: assessment,
        });
    } catch (err) {
        return next(err);
    }
});

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

export default router;
