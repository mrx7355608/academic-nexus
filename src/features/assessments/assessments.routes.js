import { Router } from "express";
import AssessmentModel from "./assessments.model.js";
import isAuth from "../../middlewares/isAuth.js";

const router = Router();

router.get("/", async (req, res, next) => {
    try {
        const assessments = await AssessmentModel.find({ isPublic: true })
            .sort("-createdAt")
            .populate("author", "fullname");
        return res.status(200).json({
            ok: true,
            data: assessments,
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

export default router;
