import FileServices from "../../src/features/files/files.services";
import { IFileDocument } from "../../src/features/files/files.type";

const mockCloudinaryServices = {
    deleteResource: jest.fn(async () => {}),
};

const authorId = "66e314b5e0528e4ad21ca94c";
const fileId = "66e314b5e0523e2ad16ca87c";

const mockFileObject = {
    title: "Mock title",
    fileURL: "https://mockUrl.com/file.ppt",
    fileExtension: "ppt",
    subject: "Programming Fundamentals",
    isPublic: true,
    publicId: "12320131sk12s12",
    author: authorId,
};

const mockFileDB = {
    findAll: jest.fn(async () => [] as IFileDocument[]),
    findOne: jest.fn(async () => null),
    findById: jest.fn(async (id: string) => {
        return id === fileId ? (mockFileObject as IFileDocument) : null;
    }),
    insert: jest.fn(async () => mockFileObject as IFileDocument),
    update: jest.fn(async () => mockFileObject as IFileDocument),
    remove: jest.fn(async () => {}),
};

const fileServices = FileServices(mockFileDB, mockCloudinaryServices);

describe("File services tests", () => {
    describe("validateFile() tests", () => {
        it("should throw error on invalid id", async () => {
            try {
                await fileServices.validateFile("some-id");
            } catch (err: any) {
                expect(err.message).toBe("Invalid file id");
            }
        });

        it("should throw error if file don't exist", async () => {
            try {
                mockFileDB.findById.mockReturnValueOnce(Promise.resolve(null));
                await fileServices.validateFile(fileId);
            } catch (err: any) {
                expect(mockFileDB.findById).toHaveBeenCalledWith(fileId);
                expect(mockFileDB.findById.mock.calls.length).toBe(1);
                expect(err.message).toBe("File not found");
            }
        });
    });

    describe("fileServices.create() tests", () => {
        it("should call filesDB.insert() function", async () => {
            await fileServices.create(mockFileObject);
            expect(mockFileDB.insert.mock.calls.length).toBe(1);
            expect(mockFileDB.insert).toHaveBeenCalledWith(mockFileObject);
        });

        it("should call validator function", async () => {
            try {
                await fileServices.create({ ...mockFileObject, title: "" });
            } catch (err: any) {
                expect(err.message).toBe("Title cannot be empty");
            }
        });
    });

    describe("fileServices.edit() tests", () => {
        const changes = {
            title: "New Mock File Title",
        };

        it("should call validateFile() function", async () => {
            try {
                await fileServices.edit("123412", authorId, changes);
            } catch (err: any) {
                expect(err.message).toBe("Invalid file id");
            }
        });

        it("should throw error if author does not match", async () => {
            try {
                await fileServices.edit(fileId, "anotherAuthorId", changes);
            } catch (err: any) {
                expect(err.message).toBe("You cannot edit this file");
            }
        });

        it("should call edit data validator function", async () => {
            try {
                await fileServices.edit(fileId, authorId, { title: "short" });
            } catch (err: any) {
                expect(err.message).toBe(
                    "Title should be 10 characters atleast",
                );
            }
        });

        it("should call fileDB.update() function", async () => {
            await fileServices.edit(fileId, authorId, changes);
            expect(mockFileDB.update.mock.calls.length).toBe(1);
            expect(mockFileDB.update).toHaveBeenCalledWith(fileId, changes);
        });

        it("should return updated file data", async () => {
            const updatedData = Object.assign(mockFileObject, changes);
            mockFileDB.update.mockReturnValueOnce(
                Promise.resolve(updatedData as IFileDocument),
            );
            const file = await fileServices.edit(fileId, authorId, changes);
            expect(file).toStrictEqual(updatedData);
        });
    });
});
