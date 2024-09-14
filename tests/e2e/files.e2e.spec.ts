import "dotenv/config";
import request from "supertest";
import TestAgent from "supertest/lib/agent";
import { connectDB, disconnectDB } from "../../src/utils/db";
import createExpressApp from "../../src/app";
import { IFileDocument } from "../../src/features/files/files.type";

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
        it("should return required fields only", async () => {
            const response = await agent.get("/api/files").expect(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data[0]).toStrictEqual({
                id: expect.any(String),
                title: expect.any(String),
                subject: expect.any(String),
                fileExtension: expect.any(String),
                isPublic: expect.any(Boolean),
                publicId: expect.any(String),
                fileURL: expect.any(String),
                createdAt: expect.any(String),
                author: {
                    id: expect.any(String),
                    fullname: expect.any(String),
                },
            });
        });

        it("should return paginated data", async () => {
            const response = await agent.get("/api/files?page=2").expect(200);
            expect(response.body.data).toBeInstanceOf(Array);
            expect(response.body.data.length).toBe(10);

            /*
             * There are 41 documents in total at the moment in database
             * So, 4 pages contains 40 documents and the 5th page contains only
             * one page that is the 41th document
             */
            const response2 = await agent.get("/api/files?page=5").expect(200);
            expect(response2.body.data).toBeInstanceOf(Array);
            expect(response2.body.data.length).toBe(1);
        });

        it("should sort data in descending order by default (sort=newest)", async () => {
            const response = await agent.get("/api/files").expect(200);

            // extract dates
            const dates = response.body.data.map(
                (file: IFileDocument) => new Date(file.createdAt),
            );

            // Test sorting
            for (let i = 0; i < dates.length - 1; i++) {
                const dateFirst = dates[i];
                const dateSecond = dates[i + 1];
                expect(dateFirst.getTime()).toBeGreaterThanOrEqual(
                    dateSecond.getTime(),
                );
            }
        });

        it("should sort data in ascending order (sort=oldest)", async () => {
            const response = await agent
                .get("/api/files?sort=oldest")
                .expect(200);

            // extract dates
            const dates = response.body.data.map(
                (file: IFileDocument) => new Date(file.createdAt),
            );

            // Test sorting
            for (let i = 0; i < dates.length - 1; i++) {
                const dateFirst = dates[i];
                const dateSecond = dates[i + 1];
                expect(dateFirst.getTime()).toBeLessThanOrEqual(
                    dateSecond.getTime(),
                );
            }
        });

        it.todo("should return filtered data");
        it.todo(
            "should return data with default values when no filter is provided",
        );
    });

    describe("GET /api/files/:id", () => {
        const unknownFileId = "66e53fa747652f3555e932e9";

        it("should return error if file does not exist", async () => {
            const response = await agent
                .get(`/api/files/${unknownFileId}`)
                .expect(404);
            expect(response.body.error).toBe("File not found");
            expect(response.body.ok).toBe(false);
        });

        it("should return file", async () => {
            const fileId = "66e53d77c4403a4647b536e0";
            const response = await agent
                .get(`/api/files/${fileId}`)
                .expect(200);
            expect(response.body.ok).toBe(true);
            expect(response.body.data).toStrictEqual({
                id: expect.any(String),
                title: expect.any(String),
                subject: expect.any(String),
                fileExtension: expect.any(String),
                isPublic: expect.any(Boolean),
                publicId: expect.any(String),
                fileURL: expect.any(String),
                createdAt: expect.any(String),
                author: {
                    id: expect.any(String),
                    fullname: expect.any(String),
                    profilePicture: expect.any(String),
                },
            });
        });
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
