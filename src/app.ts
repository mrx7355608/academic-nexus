import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import passportSetup from "./passportSetup";
import { catch404, globalErrorHandler } from "./utils/errorHandlers";
import passport from "passport";
import compression from "compression";
import path from "node:path";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import config from "./config/config";

// ROUTERS
import authRouter from "./features/auth/auth.routes";
import studentRouter from "./features/students/students.routes";
import filesRouter from "./features/files/files.routes";

export default function createExpressApp() {
    const app = express();

    app.use(
        helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    scriptSrc: [
                        "'self'",
                        "https://upload-widget.cloudinary.com",
                    ],
                    styleSrc: ["'self'", "'unsafe-inline'"],
                    imgSrc: ["'self'", "https://lh3.googleusercontent.com"],
                    upgradeInsecureRequests: [],
                    frameSrc: [
                        "'self'",
                        "https://upload-widget.cloudinary.com",
                    ],
                },
            },
        }),
    );
    app.use(hpp());
    app.use(morgan("dev"));
    app.use(compression());
    app.set("trust proxy", false);
    app.use(
        cors({
            origin: "https://view.officeapps.live.com",
        }),
    );

    app.use(
        session({
            secret: config.sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 24 * 3600 * 1000,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
            },
            store: MongoStore.create({
                client: mongoose.connection.getClient(),
            }),
            name: "nvm",
            proxy: true,
        }),
    );

    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(
        express.static(path.resolve("dist"), {
            setHeaders: (res, path) => {
                if (path.endsWith(".js") || path.endsWith(".css")) {
                    res.setHeader("Cache-Control", "max-age=31536000"); // cache css and js files for 1 year
                } else {
                    res.setHeader(
                        "Cache-Control",
                        "no-store, no-cache, must-revalidate",
                    );
                }
            },
        }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
    passportSetup();

    // ROUTES
    app.use("/api/auth", authRouter);
    app.use("/api/students", studentRouter);
    app.use("/api/files", filesRouter);

    // SERVE REACT APP
    app.get("/*", (_req, res) => {
        res.sendFile(path.resolve("dist", "index.html"));
    });

    // ERROR HANDLERS
    app.use(catch404);
    app.use(globalErrorHandler);

    return app;
}
