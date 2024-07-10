export enum OcrErrorType {
	INVALID_MIME_TYPE,
	OUT_OF_CREDITS,
	EMPTY_RESULT,
	UNKNOWN,
}

export type OcrResponse = {
	ocrType: string;
	success: boolean;
	text?: string;
	error?: {
		type: OcrErrorType;
		message: string;
	};
};

export enum OcrTypes {
	GOOGLE_VISION = "GOOGLE_VISION",
	ANTHROPIC_CLAUDE = "ANTHROPIC_CLAUDE",
	OPEN_AI_GPT_4_TURBO = "OPEN_AI_GPT_4_TURBO",
	OPEN_AI_GPT_4_O = "OPEN_AI_GPT_4_O",
	TESSERACT = "TESSERACT",
}

export enum OcrComments {
	GOOGLE_VISION = "<!-- Image OCRed with Google Vision API -->\n",
	ANTHROPIC_CLAUDE = "<!-- Image OCRed with Anthropic Claude LLM -->\n",
	OPEN_AI_GPT_4_TURBO = "<!-- Image OCRed with OpenAI GPT-4 Turbo -->\n",
	OPEN_AI_GPT_4_O = "<!-- Image OCRed with OpenAI GPT-4o -->\n",
	TESSERACT = "<!-- Image OCRed with Tesseract, https://tesseract-ocr.github.io/ -->\n",
}
