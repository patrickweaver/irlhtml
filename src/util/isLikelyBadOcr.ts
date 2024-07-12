import englishWords from "an-array-of-english-words";

export function isLikelyBadOcr(html: string): boolean {
	const potentialWords = html
		.replaceAll(/\<\/?([a-z]+|[1-6])\>?/gim, " ")
		.split(" ")
		.map((i) => i.trim())
		.filter((i) => !i.includes(`="`));

	const potentialWordCount = potentialWords.length;
	const wordCount = potentialWords.filter((i) =>
		englishWords.includes(i),
	).length;

	if (process.env.NODE_ENV === "development") {
		console.log({ potentialWordCount, wordCount });
	}

	const likelyBad = wordCount / potentialWordCount < 0.2;
	return likelyBad;
}
