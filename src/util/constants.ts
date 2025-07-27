export const defaultRenderObj = {
	idOrSlug: null,
	title: "",
	errorMessage: null,
	publishingEnabled: process.env.PUBLISHING_ENABLED ?? 'false'
};

// Only constraint is less than 36 so it is unique from any UUID
export const MAX_SLUG_LENGTH = 20;

export const OCR_ERROR_IMAGE = "ERROR_NOT_HTML_INVALID_IMAGE";
