export default function isAuth(req, res, next) {
    if (req.isAuthenticated()) return next();
    return res.status(401).json({
        ok: false,
        error: "Not authenticated",
    });
}
