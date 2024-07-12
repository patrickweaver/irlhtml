export const defaultRenderObj = {
	id: null,
	title: "",
	errorMessage: null,
};

export const OCR_ERROR = "ERROR_NOT_HTML_INVALID_IMAGE";

export const PROMPT = `This is an image of a piece of paper with HTML code on it.	If there are any syntax errors, fix them with the most likely valid HTML. Respond with just the HTML code property formatted, not wrapped in markdown or any description of what is in the response. If the image does not contain HTML code respond with the exact string: ${OCR_ERROR}.`;
