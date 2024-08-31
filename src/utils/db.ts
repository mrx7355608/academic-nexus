import mongoose from "mongoose";

declare global {
    var mongoose: any; // This must be a `var` and not a `let / const`
}

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB(uri: string) {
    console.log("Connecting...");

    if (cached.conn) {
        console.log("Using cached connection");
        return cached.conn;
    }
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };
        cached.promise = mongoose.connect(uri, opts).then((mongoose) => {
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

export async function disconnectDB() {
    await mongoose.disconnect();
}
