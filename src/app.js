import express from "express";
import cors from "cors";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";

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

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

export default app;
