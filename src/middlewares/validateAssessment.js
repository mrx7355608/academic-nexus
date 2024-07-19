import validator from "validator";
import ApiError from "../utils/ApiError.js";
import AssessmentModel from "../features/assessments/assessments.model.js";

export default async function validateAssessment(req, res, next) {
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
