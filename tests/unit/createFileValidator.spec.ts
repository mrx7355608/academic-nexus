import { IFileInput } from "../../src/features/files/files.type";
import validators from "../../src/features/files/files.validators";

const data: IFileInput = {
    title: "Switch (DCCN) - Miss Mahrose",
    fileExtension: "ppt",
    fileURL: "https://example.com/switch.ppt",
    subject: "Data Communication & Computer Networks",
    isPublic: false,
    publicId: "z2e2-1x12-412c412xe12e-0xe",
};

describe("Create file validation tests", () => {
    it("should validate file title", () => {
        expect(() =>
            validators.createValidator({ ...data, title: "" }),
        ).toThrow("Title cannot be empty");
        expect(() =>
            validators.createValidator({ ...data, title: "Hel" }),
        ).toThrow("Title should be 10 characters atleast");
        expect(() =>
            validators.createValidator({ ...data, title: null } as any),
        ).toThrow("Invalid title");

        const copy = { ...data };
        delete (copy as any).title;
        expect(() => validators.createValidator(copy)).toThrow(
            "Title is required",
        );
    });
    it("should validate file url", () => {
        expect(() =>
            validators.createValidator({ ...data, fileURL: null } as any),
        ).toThrow("Invalid file url");
        expect(() =>
            validators.createValidator({
                ...data,
                fileURL: "invalid-url.//sa",
            }),
        ).toThrow("Invalid file url");
        expect(() =>
            validators.createValidator({ ...data, fileURL: "" }),
        ).toThrow("File URL cannot be empty");
    });
    it("should validate file extension", () => {
        expect(() =>
            validators.createValidator({ ...data, fileExtension: "txt" }),
        ).toThrow("The file extension is not allowed");

        const copy = { ...data };
        delete (copy as any).fileExtension;
        expect(() => validators.createValidator(copy)).toThrow(
            "File extension is required",
        );
    });
    it.todo("should validate file subject");
    it.todo("should validate file status");
});
