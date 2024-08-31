import "dotenv/config";
import createExpressApp from "../src/app";
import config from "../src/config/config";
import { connectDB } from "../src/utils/db";

const port = (config.port as number) || 8000;

async function start() {
    await connectDB(config.dbUrl);
    createExpressApp().listen(port, () => {
        console.log("Server started on port:", port);
    });
}

start();
