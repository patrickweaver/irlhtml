import { describe, expect, test } from "@jest/globals";
import {
	Model,
	claudeOcr,
	getClaudeMessages,
	validateMimeType,
} from "./claude";
import { PROMPT } from "./prompt";
import Anthropic from "@anthropic-ai/sdk";
import { bmp, png } from "../../tests/test-image-files/imageFileData";
import { ImageBlockParam } from "@anthropic-ai/sdk/resources";

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
		mockCreate.mockResolvedValue(mockResponse);
		const ocrText = await claudeOcr(png.filePath);

		expect(anthropic!.messages!.create).toHaveBeenCalledWith({
			model: Model.HAIKU_3,
			messages: getClaudeMessages(png.content, mimeType),
			max_tokens: 1024,
		});

		expect(ocrText).toEqual(mockResponse);
	});

	test("Should throw error on invalid file", async () => {
		const mockResponse = {
			content: [{ text: "Mocked OCR result" }],
		};
		mockCreate.mockResolvedValue(mockResponse);
		await expect(claudeOcr(bmp.filePath)).rejects.toThrow("Invalid mimeType");
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
