import validator from "validator";
import ApiError from "../utils/ApiError";
import FileModel from "../features/files/files.model";
import { Request, Response, NextFunction } from "express";

export default async function validateAssessment(
    req: Request,
    _res: Response,
    next: NextFunction,
) {
    try {
        // Validate assessment id
        if (!validator.isMongoId(req.params.id)) {
            return next(new ApiError("Invalid assessment id", 400));
        }

        // Check if assessment exists
        const assessment = await FileModel.findById(req.params.id);
        if (!assessment) {
            return next(new ApiError("Assessment not found", 404));
        }

        (req as any).assessment = assessment;
        return next();
    } catch (err) {
        return next(err);
    }
}
