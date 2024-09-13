import "dotenv/config";
import request from "supertest";
import TestAgent from "supertest/lib/agent";
import { connectDB, disconnectDB } from "../../src/utils/db";
import createExpressApp from "../../src/app";

let agent: TestAgent;

describe("File E2E tests", () => {
    let fileId: string;
    let cookie =
        "nvm=s%3Ax1S-lpCZV3_CntMj7CDTsceUBvDkjYd1.jkVf4LfeKrHKVDe9RYBjzWaFAnks%2FHH6suaGxPAW8Ko";

    beforeAll(async () => {
        await connectDB(process.env.DB_URL as string);
        agent = request(createExpressApp());
    });
    afterAll(async () => {
        await disconnectDB();
    });

    describe("GET /api/files", () => {
        // it("should return required data only", async () => {
        //     const response = await agent.get("/api/files").expect(200);
        //     expect(response.body.data).toBeInstanceOf(Array);
        //     expect(response.body.data[0]).toStrictEqual({});
        // });
        it.todo("should return paginated data");
        it.todo("should return sorted data");
        it.todo("should return filtered data");
        it.todo(
            "should return data with default values when no filter is provided",
        );
    });

    describe("GET /api/files/:id", () => {
        it.todo("should return error if file does not exist");
        it.todo("should return file");
    });

    describe("POST /api/files", () => {
        it("should create file", async () => {
            const data = {
                title: "DSA Stack - Class 01",
                subject: "Data Structures & Algorithms",
                fileExtension: "ppt",
                fileURL: "https://www.example.com/stack.ppt",
                isPublic: true,
                publicId: "some-public-id",
            };

            const response = await agent
                .post("/api/files")
                .set("Cookie", cookie)
                .send(data)
                .expect(201);

            expect(response.body.data).toStrictEqual({
                id: expect.any(String),
                title: data.title,
                subject: data.subject,
                fileExtension: data.fileExtension,
                isPublic: data.isPublic,
                publicId: data.publicId,
                fileURL: data.fileURL,
                createdAt: expect.any(String),
                author: {
                    id: expect.any(String),
                    fullname: expect.any(String),
                    profilePicture: expect.any(String),
                },
            });
            fileId = String(response.body.data.id);
        });
    });

    describe("PATCH /api/files/:id", () => {
        it("should edit file", async () => {
            const response = await agent
                .patch(`/api/files/${fileId}`)
                .set("Cookie", cookie)
                .send({
                    title: "New file title",
                })
                .expect(200);
            expect(response.body.data.title).toBe("New file title");
        });
    });

    describe("DEL /api/files/:id", () => {
        it("should delete file", async () => {
            await agent
                .delete(`/api/files/${fileId}`)
                .set("Cookie", cookie)
                .expect(204);
        });
    });
});
