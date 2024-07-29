import mongoose from "mongoose";

let cachedConnection = null;

export async function connectDB(url) {
    if (cachedConnection == null) {
        cachedConnection = mongoose
            .connect(url, {
                serverSelectionTimeoutMS: 5000,
            })
            .then(() => mongoose);
        await cachedConnection;
    }

    return cachedConnection;
}

export async function disconnectDB() {
    await mongoose.disconnect();
}
