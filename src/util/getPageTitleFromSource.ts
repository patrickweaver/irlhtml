export default function getPageTitleFromSource(source: string): string | null {
	const openTag = "<title>";
	const closeTag = "</title>";
	if (!source) return null;
	const sourceLowercase = source.toLowerCase();
	const titleOpenIndex = sourceLowercase.indexOf(openTag);
	if (titleOpenIndex === -1) return null;
	const titleCloseIndex = sourceLowercase.indexOf(closeTag);
	if (titleCloseIndex === -1) return null;
	const title = source.slice(titleOpenIndex + openTag.length, titleCloseIndex);
	return title.trim().replace("  ", " ").replace("	", " ");
}
