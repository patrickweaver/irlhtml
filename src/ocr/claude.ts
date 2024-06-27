import Anthropic from "@anthropic-ai/sdk";
import { PROMPT } from "./prompt";
import { ImageBlockParam } from "@anthropic-ai/sdk/resources";
import core from "file-type/core";
import base64ImageFromFile from "../util/base64ImageFromFile";
import { z } from "zod";

enum MODELS {
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
	const msg = await anthropic.messages.create({
		model: MODELS.HAIKU_3,
		max_tokens: 1024,
		messages: getClaudeMessages(content, mimeType),
	});
	return msg;
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
