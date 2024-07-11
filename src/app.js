import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import session from "express-session";
import mongoose from "mongoose";
import MongoStore from "connect-mongo";

const app = express();

app.use(helmet());
app.use(hpp());
app.use(morgan("dev"));
app.use(
    cors({
        origin: process.env.CLIENT_URL,
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
        },
        store: MongoStore.create({
            client: mongoose.connection.getClient(),
        }),
    }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

export default app;
