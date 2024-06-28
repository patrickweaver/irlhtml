import { describe, expect, test } from "@jest/globals";
import base64ImageFromFile from "./base64ImageFromFile";
import {
	txt,
	png,
	jpg,
	jpeg,
	bmp,
} from "../../tests/test-image-files/imageFileData";

describe("base64ImageFromFile", () => {
	test("Throws for invalid file", async () => {
		const filePath = txt.filePath;
		await expect(base64ImageFromFile(filePath)).rejects.toThrow(
			"Invalid mimeType",
		);
	});

	test("Gets base64 and mimeType for .png", async () => {
		const filePath = "tests/test-image-files/test.png";
		expect(await base64ImageFromFile(filePath)).toStrictEqual({
			content: png.content,
			mimeType: png.mimeType,
		});
	});

	test("Gets base64 and mimeType for .jpg", async () => {
		const filePath = jpg.filePath;
		expect(await base64ImageFromFile(filePath)).toStrictEqual({
			content: jpg.content,
			mimeType: jpg.mimeType,
		});
	});

	test("Gets base64 and mimeType for .jpeg", async () => {
		const filePath = jpeg.filePath;
		expect(await base64ImageFromFile(filePath)).toStrictEqual({
			content: jpeg.content,
			mimeType: jpeg.mimeType,
		});
	});
});
