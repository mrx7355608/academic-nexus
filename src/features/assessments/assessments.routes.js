import { Router } from "express";
import validateAssessment from "../../middlewares/validateAssessment.js";
import isAuth from "../../middlewares/isAuth.js";
import * as controllers from "./assessments.controllers.js";
import { defaultLimiter, passowrdLimiter } from "../../utils/rateLimiters.js";

const router = Router();

// GET ALL ASSESSMENTS
router.get("/", defaultLimiter, controllers.getAllAssessments);

// GET ONE ASSESSMENT BY ID
router.get(
    "/:id",
    defaultLimiter,
    validateAssessment,
    controllers.getOneAssessment,
);

// CREATE NEW ASSESSMENTS
router.post("/", defaultLimiter, isAuth, controllers.createAssessment);

// UPVOTE ASSESSMENT
router.post(
    "/:id/upvote",
    defaultLimiter,
    isAuth,
    validateAssessment,
    controllers.upvoteAssessment,
);

// DOWNVOTE ASSESSMENTS
router.post(
    "/:id/downvote",
    defaultLimiter,
    isAuth,
    validateAssessment,
    controllers.downvoteAssessment,
);

// VIEW ASSESSMENT FILE
router.get(
    "/view-assessment/:id",
    defaultLimiter,
    controllers.viewAssessmentFile,
);

// DOWNLOAD ASSESSMENT FILE
router.post("/download-file/:id", passowrdLimiter, controllers.downloadFile);

// EDIT ASSESSMENT
router.patch(
    "/:id",
    defaultLimiter,
    isAuth,
    validateAssessment,
    controllers.editAssessment,
);

// DELETE ASSESSMENT
router.delete(
    "/:id",
    defaultLimiter,
    isAuth,
    validateAssessment,
    controllers.deleteAssessment,
);

// GET ASSESSMETS BY TYPE
router.get("/my/:type", defaultLimiter, isAuth, controllers.getMyAssessments);

// GET ASSESSMENTS OF A STUDENT
router.get("/student/:id", defaultLimiter, controllers.getStudentAssessments);

export default router;
