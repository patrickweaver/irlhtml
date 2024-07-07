import { describe, expect, test } from "@jest/globals";
import { googleVisionTextDetection } from "./googleVision";
import { openAiOcr } from "./openAi_2";
import { claudeOcr } from "./claude";
import { createWorker } from "tesseract.js";
import { OCR_COMMENTS, OCR_TYPES, runOcr } from ".";
import { png } from "../../tests/test-image-files/imageFileData";

const mockedOcrResult = "Mocked OCR result";

jest.mock("tesseract.js", () => ({ createWorker: jest.fn() }));

jest.mock("./googleVision", () => ({ googleVisionTextDetection: jest.fn() }));

jest.mock("./openAi_2", () => ({ openAiOcr: jest.fn() }));
jest.mock("./claude", () => ({ claudeOcr: jest.fn() }));

const mockedCreateWorker = createWorker as jest.Mock;
const mockedGoogleVisionTextDetection = googleVisionTextDetection as jest.Mock;
const mockedOpenAiOcr = openAiOcr as jest.Mock;
const mockedClaudeOcr = claudeOcr as jest.Mock;

describe("runOcr", () => {
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
		mockedGoogleVisionTextDetection.mockResolvedValue({
			text: mockedOcrResult,
		});
		mockedOpenAiOcr.mockResolvedValue(mockedOcrResult);
		mockedClaudeOcr.mockResolvedValue({ content: [{ text: mockedOcrResult }] });
	});

	test("Should use Tesseract OCR as default", async () => {
		const result = await runOcr(png.filePath);
		expect(result).toBe(OCR_COMMENTS.TESSERACT + mockedOcrResult);

		expect(mockedCreateWorker).toHaveBeenCalled();
		expect(mockWorker.recognize).toHaveBeenCalledWith(png.filePath);
		expect(mockWorker.terminate).toHaveBeenCalled();
		expect(googleVisionTextDetection).not.toHaveBeenCalled();
		expect(openAiOcr).not.toHaveBeenCalled();
		expect(claudeOcr).not.toHaveBeenCalled();
	});

	test("Should use GoogleVision OCR when passed option", async () => {
		const result = await runOcr(png.filePath, OCR_TYPES.GOOGLE_VISION);
		expect(result).toBe(OCR_COMMENTS.GOOGLE_VISION + mockedOcrResult);

		expect(mockedCreateWorker).not.toHaveBeenCalled();
		expect(googleVisionTextDetection).toHaveBeenCalled();
		expect(openAiOcr).not.toHaveBeenCalled();
		expect(claudeOcr).not.toHaveBeenCalled();
	});

	test("Should use OpenAI OCR GPT-4o when passed option", async () => {
		const result = await runOcr(png.filePath, OCR_TYPES.OPEN_AI_GPT_4_O);
		expect(result).toBe(OCR_COMMENTS.OPEN_AI_GPT_4_O + mockedOcrResult);

		expect(mockedCreateWorker).not.toHaveBeenCalled();
		expect(googleVisionTextDetection).not.toHaveBeenCalled();
		expect(openAiOcr).toHaveBeenCalled();
		expect(claudeOcr).not.toHaveBeenCalled();
	});

	test("Should use OpenAI OCR GPT-4 Turbo when passed option", async () => {
		const result = await runOcr(png.filePath, OCR_TYPES.OPEN_AI_GPT_4_TURBO);
		expect(result).toBe(OCR_COMMENTS.OPEN_AI_GPT_4_TURBO + mockedOcrResult);

		expect(mockedCreateWorker).not.toHaveBeenCalled();
		expect(googleVisionTextDetection).not.toHaveBeenCalled();
		expect(openAiOcr).toHaveBeenCalled();
		expect(claudeOcr).not.toHaveBeenCalled();
	});

	test("Should handle empty OpenAI OCR response", async () => {
		mockedOpenAiOcr.mockResolvedValueOnce(null);
		const result = await runOcr(png.filePath, OCR_TYPES.OPEN_AI_GPT_4_O);
		expect(result).toBe(
			OCR_COMMENTS.OPEN_AI_GPT_4_O +
				"<h1>OCR Error</h1><p>Image processing failed</p>",
		);
	});

	test("Should use Claude OCR when passed option", async () => {
		const result = await runOcr(png.filePath, OCR_TYPES.ANTHROPIC_CLAUDE);
		expect(result).toBe(OCR_COMMENTS.ANTHROPIC_CLAUDE + mockedOcrResult);

		expect(mockedCreateWorker).not.toHaveBeenCalled();
		expect(googleVisionTextDetection).not.toHaveBeenCalled();
		expect(openAiOcr).not.toHaveBeenCalled();
		expect(claudeOcr).toHaveBeenCalled();
	});

	test("Should handle Claude OCR error", async () => {
		mockedClaudeOcr.mockResolvedValueOnce({ content: [{}] });
		await expect(
			runOcr(png.filePath, OCR_TYPES.ANTHROPIC_CLAUDE),
		).rejects.toThrow("Invalid response from Claude");
		mockedClaudeOcr.mockResolvedValue({ content: [] });
		await expect(
			runOcr(png.filePath, OCR_TYPES.ANTHROPIC_CLAUDE),
		).rejects.toThrow("Invalid response from Claude");
	});

	test("Should handle empty Claude response", async () => {
		mockedClaudeOcr.mockResolvedValueOnce({ content: [{ text: null }] });
		const result = await runOcr(png.filePath, OCR_TYPES.ANTHROPIC_CLAUDE);
		expect(result).toBe(
			OCR_COMMENTS.ANTHROPIC_CLAUDE +
				"<h1>OCR Error</h1><p>Image processing failed</p>",
		);

		expect(mockedCreateWorker).not.toHaveBeenCalled();
		expect(googleVisionTextDetection).not.toHaveBeenCalled();
		expect(openAiOcr).not.toHaveBeenCalled();
		expect(claudeOcr).toHaveBeenCalled();
	});
});
