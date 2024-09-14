import "dotenv/config";
import config from "../config/config";
import FileModel from "../features/files/files.model";
import { connectDB, disconnectDB } from "./db";

async function populate() {
    const files = [];

    // Create 20 file objects and save them in "files"
    // array
    console.log("Creating file objects array");
    for (let index = 1; index <= 20; index++) {
        const file = {
            title: `DSA Stack - Class 0${index}`,
            subject: "Data Structures & Algorithms",
            fileExtension: "ppt",
            fileURL: "https://www.example.com/stack.ppt",
            isPublic: true,
            publicId: "some-public-id",
            author: "66e45ff437b1977f8bfbc65e",
        };
        files.push(file);
    }

    // Connect to database
    await connectDB(config.dbUrl);

    // Save in database
    console.log("Saving in database");
    await FileModel.insertMany(files);

    // Close database connection
    console.log("Closing database connection");
    await disconnectDB();
}

populate();
