import Anthropic from "@anthropic-ai/sdk";
import { PROMPT } from "./prompt";
import { ContentBlock, ImageBlockParam } from "@anthropic-ai/sdk/resources";
import base64ImageFromFile from "../util/base64ImageFromFile";
import { z } from "zod";

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
const OCR_FAILURE_TEXT = "<h1>OCR Error</h1><p>Image processing failed</p>";

export function validateMimeType(mimeType: string): ClaudeValidMimeType | null {
	const result = ClaudeValidMimeTypesEnum.safeParse(mimeType);
	if (result.success) {
		return result.data;
	} else {
		return null;
	}
}

export async function claudeOcr(imagePath: string) {
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
	} catch (error: any) {
		if (error?.message.includes(noCreditSubstring)) {
			return {
				handledError: true,
				error: "The project is out of Claude API credits.",
			};
		} else {
			throw error;
		}
	}
	const claudeContent: ContentBlock = msg?.content?.[0];
	if (claudeContent && "text" in claudeContent) {
		const claudeHtml = claudeContent?.text ?? OCR_FAILURE_TEXT;
		return claudeHtml;
	} else {
		throw new Error("Invalid response from Claude");
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
