const fs = require("fs");
const Anthropic = require("@anthropic-ai/sdk");
const FileType = require("file-type");

const MODELS = {
  HAIKU: "claude-3-haiku-20240307",
  SONNET: "claude-3-sonnet-20240229",
  OPUS: "claude-3-opus-20240229",
};

const PROMPT =
  "This is an image of a piece of paper with HTML code on it.  If there are any syntax errors, fix them with the most likely valid HTML. Respond with just the HTML code property formatted.";

async function claudeOcr(imagePath) {
  const image = fs.readFileSync(imagePath);
  const content = Buffer.from(image).toString("base64");
  const mimeType = (await FileType.fromFile(imagePath)).mime;
  console.log({ mimeType, imagePath });
  const anthropic = new Anthropic();
  const msg = await anthropic.messages.create({
    model: MODELS.HAIKU,
    max_tokens: 1024,
    messages: getClaudeMessages(content, mimeType),
  });
  console.log({ msg });
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
