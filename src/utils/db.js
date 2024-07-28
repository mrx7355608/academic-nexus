import mongoose from "mongoose";

let cachedDb = null;

export async function connectDB(url) {
    if (cachedDb) {
        console.log("Using cached db connection");
        return cachedDb;
    }

    const db = await mongoose.connect(url);
    console.log("New database connection established");

    cachedDb = db;
    return db;
}

export async function disconnectDB() {
    await mongoose.disconnect();
}
