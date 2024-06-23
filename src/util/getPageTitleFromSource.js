function getPageTitleFromSource(source) {
	const openTag = "<title>";
	const closeTag = "</title>";
	if (!source) return;
	const sourceLowercase = source.toLowerCase();
	const titleOpenIndex = sourceLowercase.indexOf(openTag);
	if (titleOpenIndex === -1) return;
	const titleCloseIndex = sourceLowercase.indexOf(closeTag);
	if (titleCloseIndex === -1) return;
	const title = source.slice(titleOpenIndex + openTag.length, titleCloseIndex);
	return title.trim().replace("  ", " ").replace("	", " ");
}

module.exports = getPageTitleFromSource;
