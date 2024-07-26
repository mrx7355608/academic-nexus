import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import session from "express-session";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";
import passportSetup from "./passportSetup.js";
import { catch404, globalErrorHandler } from "./utils/errorHandlers.js";
import passport from "passport";
import compression from "compression";

// ROUTERS
import authRouter from "./features/auth/auth.routes.js";
import studentRouter from "./features/students/students.routes.js";
import assessmentRouter from "./features/assessments/assessments.routes.js";

export default function createExpressApp() {
    const app = express();

    // app.use(helmet());
    app.use(hpp());
    app.use(morgan("dev"));
    app.use(compression());
    app.use(
        cors({
            origin: [
                process.env.CLIENT_URL,
                "https://view.officeapps.live.com",
            ],
            credentials: true,
        }),
    );

    app.use(
        session({
            secret: process.env.SESSIONS_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 24 * 3600 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production" ? true : false,
                sameSite:
                    process.env.NODE_ENV === "production" ? "none" : "lax",
            },
            store: MongoStore.create({
                client: mongoose.connection.getClient(),
                ttl: 24 * 60 * 60, // 1 day in seconds
                autoRemove: "native", // Automatically remove expired sessions
            }),
            proxy: process.env.NODE_ENV === "production" ? true : false,
            name: "nvm",
        }),
    );

    if (process.env.NODE_ENV === "production") {
        app.set("trust proxy", true);
    }

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(passport.initialize());
    app.use(passport.session());
    passportSetup();

    app.use((req, res, next) => {
        console.log("Cookies:", req.cookies);
        console.log("Session:", req.session);
        next();
    });

    // ROUTES
    app.use("/api/auth", authRouter);
    app.use("/api/students", studentRouter);
    app.use("/api/assessments", assessmentRouter);

    // ERROR HANDLERS
    app.use(catch404);
    app.use(globalErrorHandler);

    return app;
}
