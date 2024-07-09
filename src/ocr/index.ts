import { claudeOcr } from "./claude";
import { googleVisionTextDetection as gvOcr } from "./googleVision";
import { createWorker } from "tesseract.js";
import { openAiOcr } from "./openAi";

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

const OCR_FAILURE_TEXT = "<h1>OCR Error</h1><p>Image processing failed</p>";

const DEFAULT_OCR_TYPE = OCR_TYPES.TESSERACT;

export async function runOcr(imagePath: string, ocrType = DEFAULT_OCR_TYPE) {
	let htmlContent: string = OCR_COMMENTS[ocrType as keyof typeof OCR_COMMENTS];

	const ocrTypeFunctions = {
		[OCR_TYPES.GOOGLE_VISION]: googleVisionOcr,
		[OCR_TYPES.ANTHROPIC_CLAUDE]: anthropicClaudeOcr,
		[OCR_TYPES.OPEN_AI_GPT_4_O]: () => runOpenAiOcr(OCR_TYPES.OPEN_AI_GPT_4_O),
		[OCR_TYPES.OPEN_AI_GPT_4_TURBO]: () =>
			runOpenAiOcr(OCR_TYPES.OPEN_AI_GPT_4_TURBO),
		[OCR_TYPES.TESSERACT]: tesseractOcr,
	};

	const ocrFunction = ocrTypeFunctions[ocrType];

	const result = await ocrFunction();

	if (typeof result === "object") {
		if (result?.handledError) {
			return result;
		}
	}

	return htmlContent + result;

	async function googleVisionOcr() {
		const gvOcrGuess = await gvOcr(imagePath);
		const googleHtml = gvOcrGuess.text;
		return googleHtml;
	}

	async function anthropicClaudeOcr() {
		const result = await claudeOcr(imagePath);
		return result;
	}

	async function runOpenAiOcr(ocrType = OCR_TYPES.OPEN_AI_GPT_4_O) {
		const ocrMessage = await openAiOcr(imagePath, ocrType);
		const openaiHtml = ocrMessage ?? OCR_FAILURE_TEXT;
		return openaiHtml;
	}

	async function tesseractOcr() {
		const worker = await createWorker("eng");
		const ret = await worker.recognize(imagePath);
		await worker.terminate();
		return ret.data.text;
	}
}
