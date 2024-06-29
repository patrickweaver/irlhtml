import { claudeOcr } from "./claude";
import { googleVisionTextDetection as gvOcr } from "./googleVision";
import { createWorker } from "tesseract.js";
import { openAiOcr, Model } from "./openAi";
import { ContentBlock } from "@anthropic-ai/sdk/resources";

export enum OCR_TYPES {
	GOOGLE_VISION = "GOOGLE_VISION",
	ANTHROPIC_CLAUDE = "ANTHROPIC_CLAUDE",
	OPEN_AI_GPT_4_TURBO = "OPEN_AI_GPT_4_TURBO",
	OPEN_AI_GPT_4_O = "OPEN_AI_GPT_4_O",
	TESSERACT = "TESSERACT",
}

export enum OCR_COMMENTS {
	GOOGLE_VISION = "<!-- Image OCRed with Google Vision API -->\n",
	ANTHROPIC_CLAUDE = "<!-- Image OCRed with Anthropic Claude LLM -->\n",
	OPEN_AI_GPT_4_TURBO = "<!-- Image OCRed with OpenAI GPT-4 Turbo -->\n",
	OPEN_AI_GPT_4_O = "<!-- Image OCRed with OpenAI GPT-4o -->\n",
	TESSERACT = "<!-- Image OCRed with Tesseract, https://tesseract-ocr.github.io/ -->\n",
}

const DEFAULT_OCR_TYPE = OCR_TYPES.TESSERACT;
const OCR_FAILURE_TEXT = "<h1>OCR Error</h1><p>Image processing failed</p>";

export async function runOcr(imagePath: string, ocrType = DEFAULT_OCR_TYPE) {
	let htmlContent: string = OCR_COMMENTS[ocrType as keyof typeof OCR_COMMENTS];

	switch (ocrType) {
		case OCR_TYPES.GOOGLE_VISION:
			await googleVisionOcr();
			break;

		case OCR_TYPES.ANTHROPIC_CLAUDE:
			await anthropicClaudeOcr();
			break;

		case OCR_TYPES.OPEN_AI_GPT_4_TURBO:
		case OCR_TYPES.OPEN_AI_GPT_4_O:
			await runOpenAiOcr(ocrType);
			break;

		case OCR_TYPES.TESSERACT:
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
		const claudeContent: ContentBlock = claudeOcrMsg?.content?.[0];
		if ("text" in claudeContent) {
			const claudeHtml = claudeContent?.text ?? OCR_FAILURE_TEXT;
			htmlContent += claudeHtml;
		} else {
			throw new Error("Invalid response from Claude");
		}
	}

	async function runOpenAiOcr(ocrType = OCR_TYPES.OPEN_AI_GPT_4_O) {
		const ocrMessage = await openAiOcr(imagePath, ocrType);
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
