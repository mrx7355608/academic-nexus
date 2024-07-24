import "dotenv/config";
import { connectDB, disconnectDB } from "../../src/utils/db.js";
import supertest from "supertest";
import createExpressApp from "../../src/app.js";

let request;
let cookie =
    "connect.sid=s%3AUTZcVczCRrIkTQkIazxYWC3__piLaokh.sd5bTdnk3lF9Fg28bOddkYEuTolwHS7cKKTfhN%2BSzuA";
let user;

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

    it("Get user", async () => {
        const response = await request
            .get("/api/students/me")
            .set("Cookie", cookie)
            .expect(200);
        user = response.body.data;
    });

    describe("Testing Upvotes & Downvotes", () => {
        const id = "669c4d898170a78748d06eaf";

        it("should upvote", async () => {
            const response = await request
                .post(`/api/assessments/${id}/upvote`)
                .set("Cookie", cookie)
                .expect(200);
            const { upvotes, downvotes } = response.body.data;
            expect(upvotes).toContain(user._id);
            expect(downvotes).not.toContain(user._id);
        });
        it("should downvote", async () => {
            const response = await request
                .post(`/api/assessments/${id}/downvote`)
                .set("Cookie", cookie)
                .expect(200);
            const { upvotes, downvotes } = response.body.data;
            expect(downvotes).toContain(user._id);
            expect(upvotes).not.toContain(user._id);
        });
    });

    describe("Testing rate limits on /download-file/:id", () => {
        it.todo("should validate password before downloading file");
        it.todo("should return limit exceeded error after 3 tries");
    });

    describe("Testing edit post", () => {});

    describe("Testing delete post", () => {});
});
