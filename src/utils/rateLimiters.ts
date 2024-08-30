import { rateLimit } from "express-rate-limit";

export const defaultLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res, _next, options) => {
        return res.status(options.statusCode).json({
            ok: false,
            error: "Calm down my friend.",
        });
    },
});

export const passowrdLimiter = rateLimit({
    windowMs: 180 * 60 * 1000, // 3 hours in milliseconds
    limit: 3,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    handler: (_req, res, _next, options) => {
        return res.status(options.statusCode).json({
            ok: false,
            error: "Too many invalid password attempts, try again later",
        });
    },
});
