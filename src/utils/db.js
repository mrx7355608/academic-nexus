import mongoose from "mongoose";

let cachedConnection = null;

export async function connectDB(url) {
    if (cachedConnection) {
        return;
    }

    cachedConnection = await mongoose.connect(url);
    console.log("Connected to database");
}
