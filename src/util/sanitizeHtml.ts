export function sanitizeHtml(html: string) {
	return html
		.replaceAll(/\<script\>/gim, `<code style="display: none">`)
		.replaceAll(/\<\/script\>/gim, "</code>");
}
