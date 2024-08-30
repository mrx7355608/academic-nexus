import "dotenv/config";
import createExpressApp from "../src/app.js";
import config from "../src/config/config";

const port = (config.port as number) || 8000;

createExpressApp().listen(port, () => {
    console.log("Server started on port:", port);
});
