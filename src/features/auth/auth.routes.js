import { Router } from "express";
import passport from "passport";

const router = Router();

router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] }),
);
router.get(
    "/google/callback",
    passport.authenticate("google", {
        failureRedirect: `${process.env.CLIENT_URL}/login`,
        successRedirect: `${process.env.CLIENT_URL}`,
    }),
);
router.post("/logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        // TODO: cookie is not being cleared in the browser fix it
        return res.status(200).json({ ok: true, data: null });
    });
});

export default router;
