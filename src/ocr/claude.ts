import Anthropic from "@anthropic-ai/sdk";
import { PROMPT } from "../util/prompt";
import { ContentBlock, ImageBlockParam } from "@anthropic-ai/sdk/resources";
import base64ImageFromFile from "../util/base64ImageFromFile";
import { z } from "zod";
import { OcrErrorType, OcrResponse, OcrTypes } from "../types/Ocr";

export enum Model {
	HAIKU_3 = "claude-3-haiku-20240307",
	SONNET_3 = "claude-3-sonnet-20240229",
	OPUS_3 = "claude-3-opus-20240229",
	SONNET_3_5 = "claude-3-5-sonnet-20240620",
}

const ClaudeValidMimeTypesEnum = z.enum([
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
]);
type ClaudeValidMimeType = z.infer<typeof ClaudeValidMimeTypesEnum>;

const noCreditSubstring = "Your credit balance is too low";
const OCR_FAILURE_TEXT: string =
	"<h1>OCR Error</h1><p>Image processing failed</p>";

export function validateMimeType(mimeType: string): ClaudeValidMimeType | null {
	const result = ClaudeValidMimeTypesEnum.safeParse(mimeType);
	if (result.success) {
		return result.data;
	} else {
		return null;
	}
}

export async function anthropicClaudeOcr(
	imagePath: string,
): Promise<OcrResponse> {
	const { content, mimeType: _mimeType } = await base64ImageFromFile(imagePath);
	const mimeType: ImageBlockParam.Source["media_type"] | null =
		validateMimeType(_mimeType);
	if (!mimeType) throw new Error("Invalid mimeType");
	const anthropic = new Anthropic();
	let msg: Anthropic.Messages.Message;
	try {
		msg = await anthropic.messages.create({
			model: Model.HAIKU_3,
			max_tokens: 1024,
			messages: getClaudeMessages(content, mimeType),
		});
		const claudeContent: ContentBlock = msg?.content?.[0];
		if (claudeContent && "text" in claudeContent && !!claudeContent.text) {
			const claudeHtml = claudeContent.text;
			return {
				ocrType: OcrTypes.ANTHROPIC_CLAUDE,
				success: true,
				text: claudeHtml,
			};
		} else {
			throw new Error("Invalid response from Claude");
		}
	} catch (error: any) {
		let errorMessage = "Invalid response from Claude";
		let errorType = OcrErrorType.UNKNOWN;
		if (error?.message.includes(noCreditSubstring)) {
			errorMessage = "The project is out of Claude API credits.";
			errorType = OcrErrorType.OUT_OF_CREDITS;
		}
		return {
			ocrType: OcrTypes.ANTHROPIC_CLAUDE,
			success: false,
			error: {
				type: errorType,
				message: errorMessage,
			},
		};
	}
}

export function getClaudeMessages(
	content: string,
	mimeType: ImageBlockParam.Source["media_type"],
): Anthropic.Messages.MessageParam[] {
	return [
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
	];
}
