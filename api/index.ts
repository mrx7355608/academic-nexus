import "dotenv/config";
import createExpressApp from "../src/app.js";

const port = process.env.PORT || 8000;

createExpressApp().listen(port, () => {
    console.log("Server started on port:", port);
});
