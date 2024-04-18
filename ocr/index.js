const { claudeOcr } = require("./claude");
const gvOcr = require("./googleVision").googleVisionTextDetection;
const { createWorker } = require("tesseract.js");

const OCR_TYPES = {
  GOOGLE_VISION: "GOOGLE_VISION",
  ANTHROPIC_CLAUDE: "ANTHROPIC_CLAUDE",
  OPEN_AI_GPT_3: "OPEN_AI_GPT_3",
  TESSERACT: "TESSERACT",
};

const OCR_COMMENTS = {
  GOOGLE_VISION: `<!-- Image OCRed with Google Vision API -->`,
  ANTHROPIC_CLAUDE: `<!-- Image OCRed with Anthropic Claude LLM -->`,
  OPEN_AI_GPT_3: `<!-- Image OCRed with OpenAI GPT-3 -->`,
  TESSERACT: `<!-- Image OCRed with Tesseract, https://tesseract-ocr.github.io/ -->`,
};

const DEFAULT_OCR_TYPE = OCR_TYPES.TESSERACT;

async function runOcr(imagePath, ocrType = DEFAULT_OCR_TYPE) {
  let htmlContent = OCR_COMMENTS[ocrType];

  switch (ocrType) {
    case OCR_TYPES.GOOGLE_VISION:
      const gvOcrGuess = await gvOcr(imagePath);
      const googleHtml = gvOcrGuess.text;
      htmlContent += googleHtml;
      break;

    case OCR_TYPES.ANTHROPIC_CLAUDE:
      const claudeOcrMsg = await claudeOcr(imagePath);
      const claudeHtml =
        claudeOcrMsg?.content?.[0]?.text ??
        `<h1>OCR Error</h1><p>Image processing failed</p>`;
      htmlContent += claudeHtml;
      break;

    case OCR_TYPES.TESSERACT:
      const worker = await createWorker("eng");
      const ret = await worker.recognize(imagePath);
      console.log(ret.data.text);
      await worker.terminate();
      htmlContent += ret.data.text;
  }

  return htmlContent;
}

module.exports = {
  OCR_TYPES,
  runOcr,
};
