import mongoose from "mongoose";
import config from "../config/config";
declare global {
    var mongoose: any; // This must be a `var` and not a `let / const`
}

const MONGODB_URI = config.dbUrl;

if (!MONGODB_URI) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env",
    );
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
    console.log("Connecting...");

    if (cached.conn) {
        console.log("Using cached connection");
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose
            .connect(MONGODB_URI, opts)
            .then((mongoose) => {
                return mongoose;
            });
    }
    try {
        cached.conn = await cached.promise;
        console.log("Connected to database");
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}
