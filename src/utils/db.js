import mongoose from "mongoose";

let cachedConnection = null;

export async function connectDB() {
    if (cachedConnection) {
        return;
    }

    cachedConnection = await mongoose.connect(process.env.DB_URL);
    console.log("Connected to database");
}
