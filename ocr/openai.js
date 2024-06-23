const fs = require("fs");
const FileType = require("file-type");
const OpenAI = require("openai");
const { PROMPT } = require("./prompt");

const models = {
	GPT_4_TURBO: "gpt-4-turbo",
	GPT_4_O: "gpt-4o",
};

async function openaiOcr(imagePath, model = models.GPT_4_O) {
	const image = fs.readFileSync(imagePath);
	const content = Buffer.from(image).toString("base64");
	const mimeType = (await FileType.fromFile(imagePath)).mime;
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

module.exports = { models, openaiOcr };
