import { Router } from "express";
import ApiError from "../../utils/ApiError.js";

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

export default router;
