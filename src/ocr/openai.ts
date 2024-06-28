import OpenAI from "openai";
import { PROMPT } from "./prompt";
import base64ImageFromFile from "../util/base64ImageFromFile";

export enum Model {
	GPT_4_TURBO = "gpt-4-turbo",
	GPT_4_O = "gpt-4o",
}

const apiKey = process.env["OPENAI_API_KEY"];

export async function openAiOcr(imagePath: string, model = Model.GPT_4_O) {
	const { content, mimeType } = await base64ImageFromFile(imagePath);
	const openai = new OpenAI({ apiKey });
	const response = await openai.chat.completions.create({
		model,
		messages: getOpenAiMessages(content, mimeType),
		max_tokens: 300,
	});

	return response.choices[0].message.content;
}

export function getOpenAiMessages(
	content: string,
	mimeType: string,
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
	return [
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
	];
}
