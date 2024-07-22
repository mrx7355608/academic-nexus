import { Router } from "express";
import validateAssessment from "../../middlewares/validateAssessment.js";
import isAuth from "../../middlewares/isAuth.js";
import * as controllers from "./assessments.controllers.js";

const router = Router();

// GET ALL ASSESSMENTS
router.get("/", controllers.getAllAssessments);

// GET ONE ASSESSMENT BY ID
router.get("/:id", validateAssessment, controllers.getOneAssessment);

// CREATE NEW ASSESSMENTS
router.post("/", isAuth, controllers.createAssessment);

// UPVOTE ASSESSMENT
router.post(
    "/:id/upvote",
    isAuth,
    validateAssessment,
    controllers.upvoteAssessment,
);

// DOWNVOTE ASSESSMENTS
router.post(
    "/:id/downvote",
    isAuth,
    validateAssessment,
    controllers.downvoteAssessment,
);

// VIEW ASSESSMENT FILE
router.get("/view-assessment-file/:id", controllers.viewAssessmentFile);

// DOWNLOAD ASSESSMENT FILE
router.post("/download-file/:id", controllers.downloadFile);

// EDIT ASSESSMENT
router.patch("/:id", isAuth, validateAssessment, controllers.editAssessment);

// DELETE ASSESSMENT
router.delete("/:id", isAuth, validateAssessment, controllers.deleteAssessment);

// GET ASSESSMETS BY TYPE
router.get("/my/:type", isAuth, controllers.getMyAssessments);

// GET ASSESSMENTS OF A STUDENT
router.get("/student/:id", controllers.getStudentAssessments);
export default router;
