import { OCR_ERROR } from "../util/constants";

export const PROMPT = `This is an image of a piece of paper with HTML code on it.	If there are any syntax errors, fix them with the most likely valid HTML. Respond with just the HTML code property formatted, not wrapped in markdown or any description of what is in the response. If the image does not contain HTML code respond with the exact string: ${OCR_ERROR}.`;
