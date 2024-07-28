import mongoose from "mongoose";

let cached = global.mongoose;

export async function connectDB(url) {
    if (cached && cached.conn && cached.conn.readyState === 1) {
        console.log("Using cached connection");
        return cached.conn;
    }

    if (cached && cached.conn) {
        await cached.conn.close();
    }

    cached.conn = await mongoose.connect(url);
    console.log("Connected to database");
    return cached.conn;
}

export async function disconnectDB() {
    await mongoose.disconnect();
}
