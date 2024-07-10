import { createWorker } from "tesseract.js";
import { OcrResponse, OcrTypes } from "../types/Ocr";

export async function tesseractOcr(imagePath: string): Promise<OcrResponse> {
	const worker = await createWorker("eng");
	const ret = await worker.recognize(imagePath);
	await worker.terminate();
	return {
		ocrType: OcrTypes.TESSERACT,
		success: true,
		text: ret.data.text,
	};
}
