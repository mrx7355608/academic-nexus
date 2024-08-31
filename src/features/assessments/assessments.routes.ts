import { Router } from "express";
import validateAssessment from "../../middlewares/validateAssessment.js";
import isAuth from "../../middlewares/isAuth.js";
import assessmentControllers from "./assessments.controllers";
import { defaultLimiter, passowrdLimiter } from "../../utils/rateLimiters.js";

const router = Router();

// GET ALL ASSESSMENTS
router.get("/", defaultLimiter, assessmentControllers.getAllAssessments);

// GET ONE ASSESSMENT BY ID
router.get(
    "/:id",
    defaultLimiter,
    validateAssessment,
    assessmentControllers.getOneAssessment,
);

// CREATE NEW ASSESSMENTS
router.post(
    "/",
    defaultLimiter,
    isAuth,
    assessmentControllers.createAssessment,
);

// UPVOTE ASSESSMENT
router.post(
    "/:id/upvote",
    defaultLimiter,
    isAuth,
    validateAssessment,
    assessmentControllers.upvoteAssessment,
);

// DOWNVOTE ASSESSMENTS
router.post(
    "/:id/downvote",
    defaultLimiter,
    isAuth,
    validateAssessment,
    assessmentControllers.downvoteAssessment,
);

// VIEW ASSESSMENT FILE
router.get(
    "/view-assessment/:id",
    defaultLimiter,
    assessmentControllers.viewAssessmentFile,
);

// DOWNLOAD ASSESSMENT FILE
router.post(
    "/download-file/:id",
    passowrdLimiter,
    assessmentControllers.downloadFile,
);

// EDIT ASSESSMENT
router.patch(
    "/:id",
    defaultLimiter,
    isAuth,
    validateAssessment,
    assessmentControllers.editAssessment,
);

// DELETE ASSESSMENT
router.delete(
    "/:id",
    defaultLimiter,
    isAuth,
    validateAssessment,
    assessmentControllers.deleteAssessment,
);

// GET ASSESSMETS BY TYPE
router.get(
    "/my/:type",
    defaultLimiter,
    isAuth,
    assessmentControllers.getMyAssessments,
);

// GET ASSESSMENTS OF A STUDENT
router.get(
    "/student/:id",
    defaultLimiter,
    assessmentControllers.getStudentAssessments,
);

export default router;
