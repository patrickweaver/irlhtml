import fs from "fs";
import Anthropic from "@anthropic-ai/sdk";
import FileType from "file-type";
import { PROMPT } from "./prompt";
import { ImageBlockParam } from "@anthropic-ai/sdk/resources";
import core from "file-type/core";

enum MODELS {
	HAIKU_3 = "claude-3-haiku-20240307",
	SONNET_3 = "claude-3-sonnet-20240229",
	OPUS_3 = "claude-3-opus-20240229",
	SONNET_3_5 = "claude-3-5-sonnet-20240620",
}

type Extends<T, U extends T> = U;
type ClaudeValidMimeTypes = Extends<
	core.MimeType,
	"image/jpeg" | "image/png" | "image/gif" | "image/webp"
>;

export async function claudeOcr(imagePath: string) {
	const image = fs.readFileSync(imagePath);
	const content = Buffer.from(image).toString("base64");
	const _mimeType: core.MimeType | null =
		(await FileType.fromFile(imagePath))?.mime ?? null;
	if (!_mimeType) throw new Error("Invalid mimeType");
	const mimeType: ImageBlockParam.Source["media_type"] =
		_mimeType as ClaudeValidMimeTypes;
	const anthropic = new Anthropic();
	const msg = await anthropic.messages.create({
		model: MODELS.HAIKU_3,
		max_tokens: 1024,
		messages: getClaudeMessages(content, mimeType),
	});
	return msg;
}

function getClaudeMessages(
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
