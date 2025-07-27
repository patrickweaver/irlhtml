import { OCR_ERROR_IMAGE } from "./constants";

export const PROMPT = `\
This is an image of a piece of paper with HTML code on it. If there are any \
syntax errors, fix them with the most likely valid HTML. If there are no \
syntax errors don't make changes. Do not add a <title> tag if one is not \
present in the image, but if it is there include it. Be careful not to omit \
any of the tags in the image. Respond with just the HTML code properly \
formatted, not wrapped in markdown or any description of what is in the \
response. If the image does not contain HTML code respond with the exact \
string: ${OCR_ERROR_IMAGE}.\
`;
