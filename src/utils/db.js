import mongoose from "mongoose";

const global = {
    mongoose: null,
};

//https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/lib/dbConnect.js
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB(url) {
    if (cached.conn) {
        console.log("Using cached connection");
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            maxPoolSize: 2,
            maxIdleTimeMS: 60000,
            bufferCommands: false,
            serverSelectionTimeoutMS: 8000, //Stay within Vercel's 10 second function limit
            heartbeatFrequencyMS: 10000, //Attempting to see if this reduces query timeouts
        };

        console.log("---Connecting to MongoDB---");

        try {
            cached.promise = mongoose
                .connect(url || "", opts)
                .then((mongoose) => {
                    console.log("---Connected!---");
                    return mongoose;
                });
        } catch (e) {
            console.log("---Error connecting to MongoDB---", e);
            throw new Error("Error connecting to database");
        }
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

export async function disconnectDB() {
    await mongoose.disconnect();
}
