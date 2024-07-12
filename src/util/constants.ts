export const defaultRenderObj = {
	id: null,
	title: "",
	errorMessage: null,
};

export const OCR_ERROR_IMAGE = "ERROR_NOT_HTML_INVALID_IMAGE";

export const PROMPT = `This is an image of a piece of paper with HTML code on it.	If there are any syntax errors, fix them with the most likely valid HTML.If there are no syntax errors don't make changes.  Be careful not to omit any of the tags in the image. Respond with just the HTML code properly formatted, not wrapped in markdown or any description of what is in the response. If the image does not contain HTML code respond with the exact string: ${OCR_ERROR_IMAGE}.`;
