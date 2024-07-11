export function catch404(_req, res, _next) {
    return res.status(404).json({
        ok: false,
        error: "Page not found",
    });
}

export function globalErrorHandler(err, _req, res, _next) {
    const message = err.message;
    const status = err.status || 500;

    if (process.env.NODE_ENV === "production") {
        return res.status(status).json({
            ok: false,
            error: message,
        });
    }

    return res.status(status).json({
        ok: false,
        error: message,
        stack: err.stack,
    });
}
