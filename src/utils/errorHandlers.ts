import { Request, Response, NextFunction } from "express";

export function catch404(_req: Request, res: Response, _next: NextFunction) {
    return res.status(404).json({
        ok: false,
        error: "Page not found",
    });
}

export function globalErrorHandler(
    err: any,
    _req: Request,
    res: Response,
    _next: NextFunction,
) {
    const message = err.message;
    const status = err.status || 500;

    if (process.env.NODE_ENV === "production") {
        return res.status(status).json({
            ok: false,
            error: status >= 500 ? "Something went wrong" : message,
        });
    }

    return res.status(status).json({
        ok: false,
        error: message,
        stack: err.stack,
    });
}
