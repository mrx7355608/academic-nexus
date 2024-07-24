import "dotenv/config";
import { connectDB, disconnectDB } from "../../src/utils/db.js";
import supertest from "supertest";
import createExpressApp from "../../src/app.js";

let request;
let cookie =
    "connect.sid=s%3AUTZcVczCRrIkTQkIazxYWC3__piLaokh.sd5bTdnk3lF9Fg28bOddkYEuTolwHS7cKKTfhN%2BSzuA";
let user;
const id = "669c4d898170a78748d06eaf";

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

    describe("Testing /download-file/:id", () => {
        it("should validate password before downloading file", async () => {
            const response = await request
                .post(`/api/assessments/download-file/${id}`)
                .send({
                    password: "wrong-password",
                })
                .expect(403);
            expect(response.body.error).toBe("Incorrect password");
        });

        it("should return limit exceeded error after 3 tries", async () => {
            // its 2 here, because a request is already made in the above test,
            // so total request count becomes 3 when this test runs
            for (let index = 0; index < 2; index++) {
                await request
                    .post(`/api/assessments/download-file/${id}`)
                    .send({
                        password: "wrong-password",
                    });
            }

            const response = await request
                .post(`/api/assessments/download-file/${id}`)
                .send({
                    password: "wrong-password",
                })
                .expect(429);

            expect(response.body.error).toBe(
                "Too many invalid password attempts, try again later",
            );
        });
    });

    describe("Testing edit post", () => {
        it.todo("should not allow a user other than author to edit post");
        it.todo("should edit post");
    });

    describe("Testing delete post", () => {
        it.todo("should not allow a user other than author to delete post");
        it.todo("should delete post");
    });
});
