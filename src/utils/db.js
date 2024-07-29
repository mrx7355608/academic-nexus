import mongoose from "mongoose";

export async function connectDB(url) {
    await mongoose.connect(url);
    console.log("Database connected");
}

export async function disconnectDB() {
    await mongoose.disconnect();
}
