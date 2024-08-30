import validator from "validator";
import ApiError from "../utils/ApiError";
import AssessmentModel from "../features/assessments/assessments.model";
import { Request, Response, NextFunction } from "express";

interface IMyRequest extends Request {
    // TODO: update assessment type here
    assessment: any;
}

export default async function validateAssessment(
    req: IMyRequest,
    _res: Response,
    next: NextFunction,
) {
    try {
        // Validate assessment id
        if (!validator.isMongoId(req.params.id)) {
            return next(new ApiError("Invalid assessment id", 400));
        }

        // Check if assessment exists
        const assessment = await AssessmentModel.findById(req.params.id);
        if (!assessment) {
            return next(new ApiError("Assessment not found", 404));
        }

        req.assessment = assessment;
        return next();
    } catch (err) {
        return next(err);
    }
}
