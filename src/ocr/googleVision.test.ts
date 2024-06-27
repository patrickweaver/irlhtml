import { describe, expect, test } from "@jest/globals";
import { getGcpRequestOptions } from "./googleVision";

describe("getGcpRequestOptions", () => {
	test("Should generate correct options", async () => {
		const content =
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+L+U4T8ABu8CpCYJ1DQAAAAASUVORK5CYII=";
		const mimeType = "image/png";
		const filePath = "tests/test-image-files/test.png";
		const options = await getGcpRequestOptions(filePath);

		expect(options).toEqual({
			url: "https://vision.googleapis.com/v1/images:annotate?key=abcdefghijklmnopqrstuvwxyz_gcp",
			data: {
				requests: [
					{
						image: { content },
						features: [{ type: "TEXT_DETECTION" }],
					},
				],
			},
		});
	});
});
