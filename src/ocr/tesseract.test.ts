import { describe, expect, test } from "@jest/globals";
import { createWorker } from "tesseract.js";
import { png } from "../../tests/test-image-files/imageFileData";
import { tesseractOcr } from "./tesseract";
import { OcrTypes } from "../types/Ocr";

const mockedOcrResult = "Mocked OCR result";

jest.mock("tesseract.js", () => ({ createWorker: jest.fn() }));

const mockedCreateWorker = createWorker as jest.Mock;

describe("tesseractOcr", () => {
	let mockWorker: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockWorker = {
			recognize: jest
				.fn()
				.mockResolvedValue({ data: { text: mockedOcrResult } }),
			terminate: jest.fn().mockResolvedValue(undefined),
		};

		mockedCreateWorker.mockResolvedValue(mockWorker);
	});

	test("should successfully use Tesseract.js to OCR image", async () => {
		const result = await tesseractOcr(png.filePath);
		expect(result).toEqual({
			ocrType: OcrTypes.TESSERACT,
			success: true,
			text: mockedOcrResult,
		});
		expect(mockedCreateWorker).toHaveBeenCalled();
		expect(mockWorker.recognize).toHaveBeenCalledWith(png.filePath);
		expect(mockWorker.terminate).toHaveBeenCalled();
	});
});
