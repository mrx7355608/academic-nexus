import { Request, Response, NextFunction } from "express";

export default function isAuth(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({
        ok: false,
        error: "Not authenticated",
    });
}
