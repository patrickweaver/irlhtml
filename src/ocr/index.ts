import { claudeOcr } from "./claude";
import { googleVisionTextDetection as gvOcr } from "./googleVision";
import { createWorker } from "tesseract.js";
import { openaiOcr, models } from "./openai";

export enum OCR_TYPES {
	GOOGLE_VISION = "GOOGLE_VISION",
	ANTHROPIC_CLAUDE = "ANTHROPIC_CLAUDE",
	OPEN_AI_GPT_4_TURBO = "OPEN_AI_GPT_4_TURBO",
	OPEN_AI_GPT_4_O = "OPEN_AI_GPT_4_O",
	TESSERACT = "TESSERACT",
}

export const OCR_TYPES_JS = {
	GOOGLE_VISION: "GOOGLE_VISION",
	ANTHROPIC_CLAUDE: "ANTHROPIC_CLAUDE",
	OPEN_AI_GPT_4_TURBO: "OPEN_AI_GPT_4_TURBO",
	OPEN_AI_GPT_4_O: "OPEN_AI_GPT_4_O",
	TESSERACT: "TESSERACT",
};

enum OCR_COMMENTS {
	GOOGLE_VISION = "<!-- Image OCRed with Google Vision API -->\n",
	ANTHROPIC_CLAUDE = "<!-- Image OCRed with Anthropic Claude LLM -->\n",
	OPEN_AI_GPT_4_TURBO = "<!-- Image OCRed with OpenAI GPT-4 Turbo -->\n",
	OPEN_AI_GPT_4_O = "<!-- Image OCRed with OpenAI GPT-4o -->\n",
	TESSERACT = "<!-- Image OCRed with Tesseract, https://tesseract-ocr.github.io/ -->\n",
}

const DEFAULT_OCR_TYPE = OCR_TYPES_JS.TESSERACT;
const OCR_FAILURE_TEXT = "<h1>OCR Error</h1><p>Image processing failed</p>";

export async function runOcr(imagePath: string, ocrType = DEFAULT_OCR_TYPE) {
	let htmlContent: string = OCR_COMMENTS[ocrType as keyof typeof OCR_COMMENTS];

	switch (ocrType) {
		case OCR_TYPES_JS.GOOGLE_VISION:
			await googleVisionOcr();
			break;

		case OCR_TYPES_JS.ANTHROPIC_CLAUDE:
			await anthropicClaudeOcr();
			break;

		case OCR_TYPES_JS.OPEN_AI_GPT_4_TURBO:
			await openAiOcr(models.GPT_4_TURBO);
			break;

		case OCR_TYPES_JS.OPEN_AI_GPT_4_O:
			await openAiOcr(models.GPT_4_O);
			break;

		case OCR_TYPES_JS.TESSERACT:
			await tesseractOcr();
			break;
	}

	return htmlContent;

	async function googleVisionOcr() {
		const gvOcrGuess = await gvOcr(imagePath);
		const googleHtml = gvOcrGuess.text;
		htmlContent += googleHtml;
	}

	async function anthropicClaudeOcr() {
		const claudeOcrMsg = await claudeOcr(imagePath);
		const claudeHtml = claudeOcrMsg?.content?.[0]?.text ?? OCR_FAILURE_TEXT;
		htmlContent += claudeHtml;
	}

	async function openAiOcr(model = models.GPT_4_O) {
		const ocrMessage = await openaiOcr(imagePath, model);
		const openaiHtml = ocrMessage ?? OCR_FAILURE_TEXT;
		htmlContent += openaiHtml;
	}

	async function tesseractOcr() {
		const worker = await createWorker("eng");
		const ret = await worker.recognize(imagePath);
		await worker.terminate();
		htmlContent += ret.data.text;
	}
}
