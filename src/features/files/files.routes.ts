import { Router } from "express";
import isAuth from "../../middlewares/isAuth";
import fileControllers from "./files.controllers";
import { defaultLimiter } from "../../utils/rateLimiters";

const router = Router();

// GET ALL ASSESSMENTS
router.get("/", defaultLimiter, fileControllers.getAllFiles);

// GET ONE ASSESSMENT BY ID
router.get("/:id", defaultLimiter, fileControllers.getOneFile);

// CREATE NEW ASSESSMENTS
router.post("/", defaultLimiter, isAuth, fileControllers.createFile);

// EDIT ASSESSMENT
router.patch("/:id", defaultLimiter, isAuth, fileControllers.editFile);

// DELETE ASSESSMENT
router.delete("/:id", defaultLimiter, isAuth, fileControllers.deleteFile);

// UPVOTE ASSESSMENT
router.patch(
    "/:id/upvote",
    defaultLimiter,
    isAuth,
    fileControllers.upvoteFiles,
);

// DOWN-VOTE ASSESSMENT
router.patch(
    "/:id/downvote",
    defaultLimiter,
    isAuth,
    fileControllers.downvoteFiles,
);

export default router;
