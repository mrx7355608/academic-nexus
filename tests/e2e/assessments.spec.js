import "dotenv/config";
import { connectDB, disconnectDB } from "../../src/utils/db.js";
import supertest from "supertest";
import createExpressApp from "../../src/app.js";

let request;

describe("Assessments tests", () => {
    beforeAll(async () => {
        await connectDB(process.env.DB_URL);
        request = supertest(createExpressApp());
    });

    afterAll(async () => await disconnectDB());

    describe("Testing GET /", () => {
        it("should only return necessary data", async () => {
            const response = await request.get("/api/assessments").expect(200);
            expect(response.body.data[0]).toStrictEqual({
                _id: expect.any(String),
                title: expect.any(String),
                subject: expect.any(String),
                type: expect.any(String),
                fileExtension: expect.any(String),
                isPublic: expect.any(Boolean),
                upvotes: expect.any(Array),
                downvotes: expect.any(Array),
                createdAt: expect.any(String),
                author: {
                    _id: expect.any(String),
                    fullname: expect.any(String),
                },
            });
        });
    });
});
