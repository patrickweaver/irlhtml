import { describe, expect, test } from "@jest/globals";
import { png } from "../../tests/test-image-files/imageFileData";
import { Model, getOpenAiMessages, openAiOcr } from "./openAi";
import { PROMPT } from "../util/constants";
import OpenAI from "openai";
import { OcrErrorType, OcrTypes } from "../types/Ocr";

jest.mock("openai", () => {
	const mockCreate = jest.fn();
	return jest.fn().mockImplementation(() => ({
		chat: { completions: { create: mockCreate } },
	}));
});

describe("openAiOcr", () => {
	let openAi: jest.Mocked<Partial<OpenAI>>;
	let mockCreate: jest.Mock;
	beforeEach(() => {
		jest.clearAllMocks();
		const OpenAIMock = OpenAI as jest.MockedClass<typeof OpenAI>;
		openAi = new OpenAIMock({ apiKey: "test-key" }) as jest.Mocked<
			Partial<OpenAI>
		>;
		mockCreate = openAi.chat!.completions.create as jest.Mock;
	});

	test("Should successfully use OpenAI SDK to OCR image with GPT-4o as default", async () => {
		const mimeType = png.mimeType;
		const mockResponse = {
			choices: [{ message: { content: "Mocked OCR result" } }],
		};
		mockCreate.mockResolvedValue(mockResponse);
		const ocrText = await openAiOcr(png.filePath);

		expect(openAi!.chat!.completions.create).toHaveBeenCalledWith({
			model: Model.GPT_4_O,
			messages: getOpenAiMessages(png.content, mimeType),
			max_tokens: 300,
		});

		expect(ocrText).toEqual({
			ocrType: OcrTypes.OPEN_AI_GPT_4_O,
			success: true,
			text: mockResponse.choices[0].message.content,
		});
	});

	test("Should successfully use OpenAI SDK to OCR image with GPT-4 Turbo", async () => {
		const mimeType = png.mimeType;
		const mockResponse = {
			choices: [{ message: { content: "Mocked OCR result" } }],
		};
		mockCreate.mockResolvedValue(mockResponse);
		const ocrText = await openAiOcr(png.filePath, OcrTypes.OPEN_AI_GPT_4_TURBO);

		expect(openAi!.chat!.completions.create).toHaveBeenCalledWith({
			model: Model.GPT_4_TURBO,
			messages: getOpenAiMessages(png.content, mimeType),
			max_tokens: 300,
		});

		expect(ocrText).toEqual({
			ocrType: OcrTypes.OPEN_AI_GPT_4_TURBO,
			success: true,
			text: mockResponse.choices[0].message.content,
		});
	});

	test("Should throw error on invalid model", async () => {
		await expect(
			openAiOcr(png.filePath, OcrTypes.GOOGLE_VISION),
		).rejects.toThrow("Invalid OCR type for OpenAI");
	});

	test("Should return not success when response does not contain tetx", async () => {
		const mimeType = png.mimeType;
		const mockResponse = {
			choices: [{ message: {} }],
		};
		mockCreate.mockResolvedValue(mockResponse);
		const ocrText = await openAiOcr(png.filePath);

		expect(openAi!.chat!.completions.create).toHaveBeenCalledWith({
			model: Model.GPT_4_O,
			messages: getOpenAiMessages(png.content, mimeType),
			max_tokens: 300,
		});

		expect(ocrText).toEqual({
			ocrType: OcrTypes.OPEN_AI_GPT_4_O,
			success: false,
			error: {
				type: OcrErrorType.EMPTY_RESULT,
				message: "No text found",
			},
		});
	});
});

describe("getOpenAiMessages", () => {
	test("Generates correct request schema", () => {
		const model = Model.GPT_4_O;
		const { content, mimeType } = png;
		expect(getOpenAiMessages(content, mimeType)).toStrictEqual([
			{
				role: "user",
				content: [
					{ type: "text", text: PROMPT },
					{
						type: "image_url",
						image_url: {
							url: `data:${mimeType};base64,${content}`,
							detail: "low",
						},
					},
				],
			},
		]);
	});
});
