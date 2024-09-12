import { IFile } from "../../src/features/files/files.type";
import validators from "../../src/features/files/files.validators";

const data: Partial<IFile> = {
    fileExtension: "ppt",
    fileURL: "https://example.com/switch.ppt",
    subject: "Data Communication & Computer Networks",
    isPublic: false,
};

describe("Edit validators test", () => {
    it("should not allow un-necessary fields", () => {
        expect(() =>
            validators.editValidator({ ...data, author: "some-user" } as any),
        ).toThrow('"author" is not allowed');
    });

    it("should validate file title", () => {
        expect(() => validators.editValidator({ ...data, title: "" })).toThrow(
            "Title cannot be empty",
        );
        expect(() =>
            validators.editValidator({ ...data, title: "Hel" }),
        ).toThrow("Title should be 10 characters atleast");
        expect(() =>
            validators.editValidator({ ...data, title: null } as any),
        ).toThrow("Invalid title");
    });
    it("should validate file url", () => {
        expect(() =>
            validators.editValidator({
                ...data,
                fileURL: "invalid-url.//sa",
            }),
        ).toThrow("Invalid file url");
        expect(() =>
            validators.editValidator({ ...data, fileURL: "" }),
        ).toThrow("File URL cannot be empty");
    });
    it("should validate file extension", () => {
        expect(() =>
            validators.editValidator({ ...data, fileExtension: "txt" }),
        ).toThrow("The file extension is not allowed");
    });
    it("should validate file subject", () => {
        expect(() =>
            validators.editValidator({ ...data, subject: null } as any),
        ).toThrow("Unknown subject");
        expect(() =>
            validators.editValidator({ ...data, subject: "" }),
        ).toThrow("Unknown subject");
        expect(() =>
            validators.editValidator({ ...data, subject: "jungle-king" }),
        ).toThrow("Unknown subject");
    });
    it("should validate file status", () => {
        expect(() =>
            validators.editValidator({ ...data, isPublic: null } as any),
        ).toThrow("File status should be public or private");
    });
});
