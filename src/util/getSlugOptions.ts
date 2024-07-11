import slugify from "slugify";
import { MAX_SLUG_LENGTH } from "./constants";

export function getSlugOptions(title: string | null): string[] {
	if (title === null) return [];
	const sluggedTitle = slugify(title, {
		lower: true,
		strict: true,
	});
	const titleWords = sluggedTitle.split("-");
	const options = titleWords
		.map((_i, index) => titleWords.slice(0, index + 1).join("-"))
		.filter((i, index) => index === 0 || i.length <= MAX_SLUG_LENGTH)
		.map((i) => i.slice(0, 20));
	return options;
}
