export function fixCommonOcrErrors(html: string) {
	return html
		.replaceAll(/\<hl\>/gim, "<h1>")
		.replaceAll(/\<n([1-6])\>/gim, (_match, p1) => `<h${p1}>`);
}
