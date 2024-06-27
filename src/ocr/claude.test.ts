import { describe, expect, test } from "@jest/globals";
import { claudeOcr, getClaudeMessages, validateMimeType } from "./claude";
import { PROMPT } from "./prompt";
import Anthropic from "@anthropic-ai/sdk";

jest.mock("@anthropic-ai/sdk", () => {
	const mockCreate = jest.fn();
	return jest.fn().mockImplementation(() => ({
		messages: { create: mockCreate },
	}));
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

	test("Should use Anthropic SDK to OCR image", async () => {
		const content =
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+L+U4T8ABu8CpCYJ1DQAAAAASUVORK5CYII=";
		const mimeType = "image/png";
		const mockResponse = {
			content: [{ text: "Mocked OCR result" }],
		};
		mockCreate.mockResolvedValue(mockResponse);

		const filePath = "tests/test-image-files/test.png";
		const ocrText = await claudeOcr(filePath);

		expect(anthropic!.messages!.create).toHaveBeenCalledWith({
			model: "claude-3-haiku-20240307",
			max_tokens: 1024,
			messages: getClaudeMessages(content, mimeType),
		});

		expect(ocrText).toEqual(mockResponse);
	});

	test("Should throw error on invalid file", async () => {
		const mockResponse = {
			content: [{ text: "Mocked OCR result" }],
		};
		mockCreate.mockResolvedValue(mockResponse);

		const filePath = "tests/test-image-files/test.bmp";
		await expect(claudeOcr(filePath)).rejects.toThrow("Invalid mimeType");
	});
});

describe("getClaudeMessages", () => {
	test("Generates correct request schema", async () => {
		const content =
			"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAA1JREFUGFdj+L+U4T8ABu8CpCYJ1DQAAAAASUVORK5CYII=";
		const mimeType = "image/png";
		expect(await getClaudeMessages(content, mimeType)).toStrictEqual([
			{
				role: "user",
				content: [
					{
						type: "image",
						source: {
							type: "base64",
							media_type: mimeType,
							data: content,
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
