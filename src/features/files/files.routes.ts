import { Router } from "express";
import validateAssessment from "../../middlewares/validateAssessment";
import isAuth from "../../middlewares/isAuth";
import fileControllers from "./files.controllers";
import { defaultLimiter } from "../../utils/rateLimiters";

const router = Router();

// GET ALL ASSESSMENTS
router.get("/", defaultLimiter, fileControllers.getAllFiles);

// GET ONE ASSESSMENT BY ID
router.get(
    "/:id",
    defaultLimiter,
    validateAssessment,
    fileControllers.getOneFile,
);

// CREATE NEW ASSESSMENTS
router.post("/", defaultLimiter, isAuth, fileControllers.createFile);

// EDIT ASSESSMENT
router.patch("/:id", defaultLimiter, isAuth, fileControllers.editFile);

// DELETE ASSESSMENT
router.delete("/:id", defaultLimiter, isAuth, fileControllers.deleteFile);

export default router;

// UPVOTE ASSESSMENT
// router.post(
//     "/:id/upvote",
//     defaultLimiter,
//     isAuth,
//     validateAssessment,
//     fileControllers.upvoteAssessment,
// );
//
// // DOWNVOTE ASSESSMENTS
// router.post(
//     "/:id/downvote",
//     defaultLimiter,
//     isAuth,
//     validateAssessment,
//     fileControllers.downvoteAssessment,
// );
