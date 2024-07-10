import { describe, expect, test } from "@jest/globals";
import { googleVisionOcr } from "./googleVision";
import { openAiOcr } from "./openAi";
import { anthropicClaudeOcr } from "./claude";
import { runOcr } from ".";
import { png } from "../../tests/test-image-files/imageFileData";
import { OcrComments, OcrErrorType, OcrResponse, OcrTypes } from "../types/Ocr";
import { tesseractOcr } from "./tesseract";

const mockedOcrText = "Mocked OCR result";
function getMockedSuccessfulOcrResult(ocrType: OcrTypes): OcrResponse {
	return {
		ocrType,
		success: true,
		text: mockedOcrText,
	};
}

jest.mock("./tesseract", () => ({ tesseractOcr: jest.fn() }));
jest.mock("./googleVision", () => ({ googleVisionOcr: jest.fn() }));
jest.mock("./openAi", () => ({ openAiOcr: jest.fn() }));
jest.mock("./claude", () => ({ anthropicClaudeOcr: jest.fn() }));

const mockedTesseractOcr = tesseractOcr as jest.Mock;
const mockedGoogleVisionOcr = googleVisionOcr as jest.Mock;
const mockedOpenAiOcr = openAiOcr as jest.Mock;
const mockedAnthropicClaudeOcr = anthropicClaudeOcr as jest.Mock;

describe("runOcr", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		mockedTesseractOcr.mockResolvedValue(
			getMockedSuccessfulOcrResult(OcrTypes.TESSERACT),
		);
		mockedGoogleVisionOcr.mockResolvedValue(
			getMockedSuccessfulOcrResult(OcrTypes.GOOGLE_VISION),
		);
		mockedOpenAiOcr.mockResolvedValue(
			getMockedSuccessfulOcrResult(OcrTypes.OPEN_AI_GPT_4_O),
		);
		mockedAnthropicClaudeOcr.mockResolvedValue(
			getMockedSuccessfulOcrResult(OcrTypes.ANTHROPIC_CLAUDE),
		);
	});

	test("Should use Tesseract OCR as default", async () => {
		const result = await runOcr(png.filePath);
		expect(result).toEqual({
			ocrType: OcrTypes.TESSERACT,
			success: true,
			text: OcrComments.TESSERACT + mockedOcrText,
		});

		expect(mockedTesseractOcr).toHaveBeenCalled();
		expect(googleVisionOcr).not.toHaveBeenCalled();
		expect(openAiOcr).not.toHaveBeenCalled();
		expect(anthropicClaudeOcr).not.toHaveBeenCalled();
	});

	test("Should use GoogleVision OCR when passed option", async () => {
		const result = await runOcr(png.filePath, OcrTypes.GOOGLE_VISION);
		expect(result).toEqual({
			ocrType: OcrTypes.GOOGLE_VISION,
			success: true,
			text: OcrComments.GOOGLE_VISION + mockedOcrText,
		});

		expect(mockedTesseractOcr).not.toHaveBeenCalled();
		expect(googleVisionOcr).toHaveBeenCalled();
		expect(openAiOcr).not.toHaveBeenCalled();
		expect(anthropicClaudeOcr).not.toHaveBeenCalled();
	});

	test("Should use OpenAI OCR GPT-4o when passed option", async () => {
		const result = await runOcr(png.filePath, OcrTypes.OPEN_AI_GPT_4_O);
		expect(result).toEqual({
			ocrType: OcrTypes.OPEN_AI_GPT_4_O,
			success: true,
			text: OcrComments.OPEN_AI_GPT_4_O + mockedOcrText,
		});

		expect(mockedTesseractOcr).not.toHaveBeenCalled();
		expect(googleVisionOcr).not.toHaveBeenCalled();
		expect(openAiOcr).toHaveBeenCalled();
		expect(anthropicClaudeOcr).not.toHaveBeenCalled();
	});

	test("Should use OpenAI OCR GPT-4 Turbo when passed option", async () => {
		mockedOpenAiOcr.mockResolvedValueOnce(
			getMockedSuccessfulOcrResult(OcrTypes.OPEN_AI_GPT_4_TURBO),
		);
		const result = await runOcr(png.filePath, OcrTypes.OPEN_AI_GPT_4_TURBO);
		expect(result).toEqual({
			ocrType: OcrTypes.OPEN_AI_GPT_4_TURBO,
			success: true,
			text: OcrComments.OPEN_AI_GPT_4_TURBO + mockedOcrText,
		});

		expect(mockedTesseractOcr).not.toHaveBeenCalled();
		expect(googleVisionOcr).not.toHaveBeenCalled();
		expect(openAiOcr).toHaveBeenCalled();
		expect(anthropicClaudeOcr).not.toHaveBeenCalled();
	});

	test("Should handle empty OpenAI OCR response", async () => {
		const errorResponse = {
			ocrType: OcrTypes.OPEN_AI_GPT_4_O,
			success: false,
			error: {
				type: OcrErrorType.EMPTY_RESULT,
				message: "No text found",
			},
		};
		mockedOpenAiOcr.mockResolvedValueOnce(errorResponse);
		const result = await runOcr(png.filePath, OcrTypes.OPEN_AI_GPT_4_O);
		expect(result).toEqual({
			...errorResponse,
			text: "<h1>OCR Error</h1><p>No text found</p>",
		});
	});

	test("Should use Claude OCR when passed option", async () => {
		const result = await runOcr(png.filePath, OcrTypes.ANTHROPIC_CLAUDE);
		expect(result).toEqual({
			ocrType: OcrTypes.ANTHROPIC_CLAUDE,
			success: true,
			text: OcrComments.ANTHROPIC_CLAUDE + mockedOcrText,
		});

		expect(mockedTesseractOcr).not.toHaveBeenCalled();
		expect(googleVisionOcr).not.toHaveBeenCalled();
		expect(openAiOcr).not.toHaveBeenCalled();
		expect(anthropicClaudeOcr).toHaveBeenCalled();
	});

	test("Should handle Claude no credits error", async () => {
		const errorResponse = {
			ocrType: OcrTypes.ANTHROPIC_CLAUDE,
			success: false,
			error: {
				type: OcrErrorType.OUT_OF_CREDITS,
				message: "The project is out of Claude API credits.",
			},
		};
		mockedAnthropicClaudeOcr.mockResolvedValueOnce(errorResponse);
		const result = await runOcr(png.filePath, OcrTypes.ANTHROPIC_CLAUDE);
		expect(result).toEqual({
			...errorResponse,
			text: "<h1>OCR Error</h1><p>The project is out of Claude API credits.</p>",
		});
	});

	test("Should handle empty Claude response", async () => {
		const errorResponse = {
			ocrType: OcrTypes.ANTHROPIC_CLAUDE,
			success: false,
			error: {
				type: OcrErrorType.UNKNOWN,
				message: "Invalid response from Claude",
			},
		};
		mockedAnthropicClaudeOcr.mockResolvedValueOnce(errorResponse);
		const result = await runOcr(png.filePath, OcrTypes.ANTHROPIC_CLAUDE);
		expect(result).toEqual({
			...errorResponse,
			text: "<h1>OCR Error</h1><p>Invalid response from Claude</p>",
		});
	});
});
