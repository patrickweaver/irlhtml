import { anthropicClaudeOcr } from "./claude";
import { googleVisionOcr } from "./googleVision";
import { openAiOcr } from "./openAi";
import { OcrComments, OcrTypes } from "../types/Ocr";
import { tesseractOcr } from "./tesseract";
import { sanitizeHtml } from "../util/sanitizeHtml";
import { fixCommonOcrErrors } from "../util/fixCommonOcrErrors";
import { OCR_ERROR_IMAGE } from "../util/constants";

const DEFAULT_OCR_TYPE = OcrTypes.TESSERACT;

export async function runOcr(imagePath: string, ocrType = DEFAULT_OCR_TYPE) {
	const ocrTypeFunctions = {
		[OcrTypes.GOOGLE_VISION]: googleVisionOcr,
		[OcrTypes.ANTHROPIC_CLAUDE]: anthropicClaudeOcr,
		[OcrTypes.OPEN_AI_GPT_4_O]: (imagePath: string) =>
			openAiOcr(imagePath, OcrTypes.OPEN_AI_GPT_4_O),
		[OcrTypes.OPEN_AI_GPT_4_TURBO]: () =>
			openAiOcr(imagePath, OcrTypes.OPEN_AI_GPT_4_TURBO),
		[OcrTypes.TESSERACT]: tesseractOcr,
	};

	const ocrFunction = ocrTypeFunctions[ocrType];
	const result = await ocrFunction(imagePath);

	if (!result.success) {
		return {
			...result,
			text: getOcrFailureHtml(result.error?.message ?? "Error running OCR"),
		};
	}

	const ocrHtml = result?.text ?? OCR_ERROR_IMAGE;
	if (ocrHtml === OCR_ERROR_IMAGE) throw new Error(OCR_ERROR_IMAGE);
	const modifiedHtml = fixCommonOcrErrors(result?.text ?? "");
	const sanitizedHtml = sanitizeHtml(modifiedHtml);

	return {
		...result,
		text: OcrComments[ocrType] + sanitizedHtml,
	};
}

function getOcrFailureHtml(errorMessage: string) {
	return `<h1>OCR Error</h1><p>${errorMessage}</p>`;
}
