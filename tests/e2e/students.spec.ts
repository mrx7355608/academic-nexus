import "dotenv/config";
import { connectDB, disconnectDB } from "../../src/utils/db";
import supertest from "supertest";
import createExpressApp from "../../src/app";
import config from "../../src/config/config";
import TestAgent from "supertest/lib/agent";

let request: TestAgent;

describe("Students tests", () => {
    beforeAll(async () => {
        await connectDB(config.testDbUrl);
        request = supertest(createExpressApp());
    });

    afterAll(async () => await disconnectDB());

    it("should return error when an un-authenticated req is made", async () => {
        const response = await request.get("/api/students/me").expect(401);
        expect(response.body.error).toBe("Not authenticated");
    });

    describe("Testing /student-profile/:id", () => {
        it("it should validate id on /student-profile/:id", async () => {
            const response = await request
                .get("/api/students/student-profile/lmao")
                .expect(400);
            expect(response.body.error).toBe("Invalid student id");
        });

        it("it should return error if student does not exist", async () => {
            const response = await request
                .get("/api/students/student-profile/66a0f25482132e5d79728e7c")
                .expect(404);
            expect(response.body.error).toBe("Student not found");
        });
    });

    describe("Testing /search", () => {
        it("it should return error if 'sname' query is empty", async () => {
            const response = await request
                .get("/api/students/search?sname=")
                .expect(400);
            expect(response.body.error).toBe(
                "Please enter a student name to search",
            );
        });

        it("it should return error if 'sname' query does not exist", async () => {
            const response = await request
                .get("/api/students/search")
                .expect(400);
            expect(response.body.error).toBe(
                "Please enter a student name to search",
            );
        });

        it("it should only return necessary data", async () => {
            const response = await request
                .get("/api/students/search?sname=fawad")
                .expect(200);
            expect(response.body.data[0]).toStrictEqual({
                _id: expect.any(String),
                profilePicture: expect.any(String),
                fullname: expect.any(String),
                degree: expect.any(String),
                email: expect.any(String),
                createdAt: expect.any(String),
            });
        });
    });
});
