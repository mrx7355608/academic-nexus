import { Router } from "express";
import ApiError from "../../utils/ApiError";
import StudentModel from "./students.model";
import validator from "validator";
import { defaultLimiter } from "../../utils/rateLimiters";

const router = Router();

router.get("/me", defaultLimiter, async (req, res, next) => {
    if (req.isAuthenticated()) {
        return res.status(200).json({
            ok: true,
            data: req.user,
        });
    }

    return next(new ApiError("Not authenticated", 401));
});

router.get("/search", defaultLimiter, async (req, res, next) => {
    try {
        // If sname does not exist or is empty, handle that case
        if (!req.query.sname) {
            return next(
                new ApiError("Please enter a student name to search", 400),
            );
        }

        const students = await StudentModel.find(
            {
                fullname: {
                    $regex: new RegExp(req.query.sname as string),
                    $options: "i",
                },
            },
            "-googleId -__v -updatedAt",
        );
        res.status(200).json({
            ok: true,
            data: students,
        });
    } catch (err) {
        return next(err);
    }
});

router.get("/student-profile/:id", defaultLimiter, async (req, res, next) => {
    if (!validator.isMongoId(req.params.id)) {
        return next(new ApiError("Invalid student id", 400));
    }

    const student = await StudentModel.findById(req.params.id);
    if (!student) {
        return next(new ApiError("Student not found", 404));
    }

    return res.status(200).json({
        ok: true,
        data: student,
    });
});

export default router;
