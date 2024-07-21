import { describe, expect, test } from "@jest/globals";
import {
	Model,
	anthropicClaudeOcr,
	getClaudeMessages,
	validateMimeType,
} from "./claude";
import { PROMPT } from "../util/constants";
import Anthropic from "@anthropic-ai/sdk";
import { bmp, png } from "../../tests/test-image-files/imageFileData";
import { ImageBlockParam } from "@anthropic-ai/sdk/resources";
import { OcrTypes, OcrErrorType } from "../types/Ocr";

jest.mock("@anthropic-ai/sdk", () => {
	const mockCreate = jest.fn();
	return jest.fn().mockImplementation(() => ({
		messages: { create: mockCreate },
	}));
});

describe("claudeOcr", () => {
	let anthropic: jest.Mocked<Partial<Anthropic>>;
	let mockCreate: jest.Mock;

	beforeEach(() => {
		jest.clearAllMocks();
		const AnthropicMock = Anthropic as jest.MockedClass<typeof Anthropic>;
		anthropic = new AnthropicMock({ apiKey: "test-key" }) as jest.Mocked<
			Partial<Anthropic>
		>;
		mockCreate = anthropic.messages!.create as jest.Mock;
	});

	test("Should successfully use Anthropic SDK to OCR image", async () => {
		const mimeType = png.mimeType as ImageBlockParam.Source["media_type"];
		const mockResponse = {
			content: [{ text: "Mocked OCR result" }],
		};
		mockCreate.mockResolvedValueOnce(mockResponse);
		const result = await anthropicClaudeOcr(png.filePath);

		expect(anthropic!.messages!.create).toHaveBeenCalledWith({
			model: Model.HAIKU_3,
			messages: getClaudeMessages(png.content, mimeType),
			max_tokens: 1024,
		});

		expect(result).toEqual({
			ocrType: OcrTypes.ANTHROPIC_CLAUDE,
			success: true,
			text: "Mocked OCR result",
		});
	});

	test("Should gracefully handle out of credits error", async () => {
		const errorMessage =
			"Your credit balance is too low to access the Claude API. Please go to Plans & Billing to upgrade or purchase credits.";
		mockCreate.mockRejectedValueOnce({
			status: 400,
			type: "invalid_request_error",
			message: errorMessage,
		});
		expect(await anthropicClaudeOcr(png.filePath)).toEqual({
			ocrType: OcrTypes.ANTHROPIC_CLAUDE,
			success: false,
			error: {
				type: OcrErrorType.OUT_OF_CREDITS,
				message: "The project is out of Claude API credits.",
			},
		});
	});

	test("Should throw error on invalid file", async () => {
		const mockResponse = {
			content: [{ text: "Mocked OCR result" }],
		};
		mockCreate.mockResolvedValue(mockResponse);
		await expect(anthropicClaudeOcr(bmp.filePath)).rejects.toThrow(
			"Invalid mimeType",
		);
	});

	test("Should throw error on response with no text property", async () => {
		const mockResponse = {
			content: [{}],
		};
		mockCreate.mockResolvedValueOnce(mockResponse);
		expect(await anthropicClaudeOcr(png.filePath)).toEqual({
			ocrType: OcrTypes.ANTHROPIC_CLAUDE,
			success: false,
			error: {
				type: OcrErrorType.UNKNOWN,
				message: "Invalid response from Claude",
			},
		});
	});

	test("Should throw error on response with empty text property", async () => {
		const mockResponse = {
			content: [{ text: "" }],
		};
		mockCreate.mockResolvedValueOnce(mockResponse);
		expect(await anthropicClaudeOcr(png.filePath)).toEqual({
			ocrType: OcrTypes.ANTHROPIC_CLAUDE,
			success: false,
			error: {
				type: OcrErrorType.UNKNOWN,
				message: "Invalid response from Claude",
			},
		});
	});
});

describe("getClaudeMessages", () => {
	test("Generates correct request schema", async () => {
		const mimeType = png.mimeType as ImageBlockParam.Source["media_type"];
		expect(await getClaudeMessages(png.content, mimeType)).toStrictEqual([
			{
				role: "user",
				content: [
					{
						type: "image",
						source: {
							type: "base64",
							media_type: mimeType,
							data: png.content,
						},
					},
					{
						type: "text",
						text: PROMPT,
					},
				],
			},
		]);
	});
});

describe("validateMimeType", () => {
	test("gif should be valid", () => {
		expect(validateMimeType("image/gif")).toBe("image/gif");
	});

	test("jpeg should be valid", () => {
		expect(validateMimeType("image/jpeg")).toBe("image/jpeg");
	});

	test("png should be valid", () => {
		expect(validateMimeType("image/png")).toBe("image/png");
	});

	test("webp should be valid", () => {
		expect(validateMimeType("image/webp")).toBe("image/webp");
	});

	test("bmp should be valid", () => {
		expect(validateMimeType("image/bmp")).toBe(null);
	});
});
