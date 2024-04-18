const fs = require("fs");
const Anthropic = require("@anthropic-ai/sdk");
const FileType = require("file-type");

async function claudeOcr(imagePath) {
  const image = fs.readFileSync(imagePath);
  const content = Buffer.from(image).toString("base64");
  const mimeType = (await FileType.fromFile(imagePath)).mime;
  console.log({ mimeType, imagePath });
  const anthropic = new Anthropic();
  const msg = await anthropic.messages.create({
    model: "claude-3-opus-20240229",
    max_tokens: 1024,
    messages: [
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
            text: "This is an image of a piece of paper with HTML code on it. Respond with just the HTML code property formatted.",
          },
        ],
      },
    ],
  });
  console.log({ msg });
  return msg;
}

module.exports = { claudeOcr };
