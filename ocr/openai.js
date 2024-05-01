const fs = require("fs");
const FileType = require("file-type");
const OpenAI = require("openai");
const { PROMPT } = require("./prompt");

async function openaiOcr(imagePath) {
  const image = fs.readFileSync(imagePath);
  const content = Buffer.from(image).toString("base64");
  const mimeType = (await FileType.fromFile(imagePath)).mime;
  const openai = new OpenAI({
    apiKey: process.env["OPENAI_API_KEY"],
  });

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
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

module.exports = { openaiOcr };
