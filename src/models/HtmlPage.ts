import { HtmlPage, HtmlPageDb } from "../types/HtmlPage";
import * as page from "../db/page";
import getPageTitleFromSource from "../util/getPageTitleFromSource";
import { getSlugOptions } from "../util/getSlugOptions";

export async function getOne(idOrSlug: string): Promise<HtmlPage | null> {
	const data: HtmlPageDb | null = await page.getOne({ idOrSlug });
	if (!data) return null;
	return render(data);
}

export async function index(
	{
		count,
		offset,
	}: {
		count?: number;
		offset: number;
	} = { offset: 0 },
): Promise<HtmlPage[]> {
	const data: HtmlPageDb[] = await page.getAll();
	return data.map(render);
}

export async function getSlug(id: string, title: string | null) {
	const slugOptions = getSlugOptions(title);
	let slug: string | null = null;
	let optionIndex = 0;
	while (slug === null && slugOptions?.[optionIndex]) {
		const slugCandidate = slugOptions[optionIndex];
		const duplicateSlug = await page.getOne({ idOrSlug: slugCandidate });
		if (duplicateSlug) {
			optionIndex += 1;
		} else {
			slug = slugCandidate;
		}
	}

	let slugLength = 4;
	while (!slug) {
		const slugCandidate = id.slice(0, slugLength);
		if (slugCandidate[slugCandidate.length - 1] === "-") {
			slugLength += 1;
			continue;
		}
		const duplicateSlug = await page.getOne({ idOrSlug: slugCandidate });
		if (duplicateSlug) {
			slugLength += 1;
		} else {
			slug = slugCandidate;
		}
	}
	return slug;
}

export function render(data: HtmlPageDb): HtmlPage {
	const title = getPageTitleFromSource(data?.source_code) ?? "";
	return {
		...data,
		title,
		date_created: new Date(data.date_created),
		date_updated: new Date(data.date_updated),
		slug: data.slug,
		author: data?.author ?? null,
	};
}
