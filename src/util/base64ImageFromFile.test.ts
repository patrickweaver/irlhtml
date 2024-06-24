import { describe, expect, test } from "@jest/globals";
import base64ImageFromFile from "./base64ImageFromFile";

describe("base64ImageFromFile", () => {
	test("Throws for invalid file", async () => {
		const filePath = "tests/test-image-files/test.txt";
		await expect(base64ImageFromFile(filePath)).rejects.toThrow(
			"Invalid mimeType",
		);
	});

	test("Gets base64 and mimeType for .png", async () => {
		const filePath = "tests/test-image-files/test.png";
		expect(await base64ImageFromFile(filePath)).toStrictEqual({
			content:
				"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+L+U4T8ABu8CpCYJ1DQAAAAASUVORK5CYII=",
			mimeType: "image/png",
		});
	});
});
