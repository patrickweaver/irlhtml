import { describe, expect, test } from "@jest/globals";
import {
	getGcpRequestOptions,
	googleVisionTextDetection,
} from "./googleVision";
import { png } from "../../tests/test-image-files/imageFileData";
import axios from "axios";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("getGcpRequestOptions", () => {
	test("Should generate correct options", async () => {
		const options = await getGcpRequestOptions(png.filePath);

		expect(options).toEqual({
			url: "https://vision.googleapis.com/v1/images:annotate?key=abcdefghijklmnopqrstuvwxyz_gcp",
			data: {
				requests: [
					{
						image: { content: png.content },
						features: [{ type: "TEXT_DETECTION" }],
					},
				],
			},
		});
	});
});

describe("googleVisionTextDetection", () => {
	test("Should successfully use Google Vision API to OCR image", async () => {
		const mockResolvedResponse = {
			data: {
				responses: [{ fullTextAnnotation: { text: "Mocked OCRed text" } }],
			},
		};
		mockedAxios.post.mockResolvedValue(mockResolvedResponse);
		const result = await googleVisionTextDetection(png.filePath);
		expect(result.text).toEqual("Mocked OCRed text");
	});

	test("Should throw on invalid OCR", async () => {
		const mockResolvedResponse = {
			data: {
				responses: [{ fullTextAnnotation: { text: "" } }],
			},
		};
		mockedAxios.post.mockResolvedValue(mockResolvedResponse);
		await expect(googleVisionTextDetection(png.filePath)).rejects.toThrow(
			"No response from Google Vision",
		);
	});

	test("Should throw on invalid response", async () => {
		const mockResolvedResponse = {
			data: {
				responses: [{ fullTextAnnotation: {} }],
			},
		};
		mockedAxios.post.mockResolvedValue(mockResolvedResponse);
		await expect(googleVisionTextDetection(png.filePath)).rejects.toThrow(
			"No response from Google Vision",
		);
	});

	test("Should handle Axios error", async () => {
		mockedAxios.post.mockImplementationOnce(() =>
			Promise.reject(new Error("Network error")),
		);
		await expect(googleVisionTextDetection(png.filePath)).rejects.toThrow(
			"Error making request to Google Vision",
		);
	});
});
