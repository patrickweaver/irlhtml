const fs = require("fs");
const Anthropic = require("@anthropic-ai/sdk");
const FileType = require("file-type");
const { PROMPT } = require("./prompt");

const MODELS = {
	HAIKU_3: "claude-3-haiku-20240307",
	SONNET_3: "claude-3-sonnet-20240229",
	OPUS_3: "claude-3-opus-20240229",
	SONNET_3_5: "claude-3-5-sonnet-20240620",
};

async function claudeOcr(imagePath) {
	const image = fs.readFileSync(imagePath);
	const content = Buffer.from(image).toString("base64");
	const mimeType = (await FileType.fromFile(imagePath)).mime;
	const anthropic = new Anthropic();
	const msg = await anthropic.messages.create({
		model: MODELS.HAIKU_3,
		max_tokens: 1024,
		messages: getClaudeMessages(content, mimeType),
	});
	return msg;
}

function getClaudeMessages(content, mimeType) {
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

module.exports = { claudeOcr };
