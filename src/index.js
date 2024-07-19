import "dotenv/config";
import { connectDB } from "./utils/db.js";
import createExpressApp from "./app.js";

const port = process.env.PORT || 8000;

async function start() {
    await connectDB(process.env.DB_URL);

    createExpressApp().listen(port, () => {
        console.log("Server started on port:", port);
    });
}

start();
