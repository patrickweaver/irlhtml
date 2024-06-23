import fs from "fs";
import FileType from "file-type";
import OpenAI from "openai";
import { PROMPT } from "./prompt";

export enum Models {
	GPT_4_TURBO = "gpt-4-turbo",
	GPT_4_O = "gpt-4o",
}

export async function openaiOcr(imagePath: string, model = Models.GPT_4_O) {
	const image = fs.readFileSync(imagePath);
	const content = Buffer.from(image).toString("base64");
	const mimeType = (await FileType.fromFile(imagePath))?.mime;
	const openai = new OpenAI({
		apiKey: process.env["OPENAI_API_KEY"],
	});

	const response = await openai.chat.completions.create({
		model: model,
		messages: [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: PROMPT,
					},
					{
						type: "image_url",
						image_url: {
							url: `data:${mimeType};base64,${content}`,
							detail: "low",
						},
					},
				],
			},
		],
		max_tokens: 300,
	});

	return response.choices[0].message.content;
}
