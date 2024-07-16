import { Router } from "express";
import ApiError from "../../utils/ApiError.js";
import StudentModel from "./students.model.js";

const router = Router();

router.get("/me", async (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.status(200).json({
            ok: true,
            data: req.user,
        });
    }

    return next(new ApiError("Not authenticated", 401));
});

router.get("/search", async (req, res, next) => {
    try {
        const students = await StudentModel.find(
            {
                fullname: {
                    $regex: new RegExp(req.query.sname),
                    $options: "i",
                },
            },
            "-googleId -email",
        );
        res.status(200).json({
            ok: true,
            data: students,
        });
    } catch (err) {
        return next(err);
    }
});

export default router;
