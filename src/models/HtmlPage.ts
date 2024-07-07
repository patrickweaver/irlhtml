import { HtmlPage, HtmlPageDb } from "../types/HtmlPage";
import * as page from "../db/page";
import getPageTitleFromSource from "../util/getPageTitleFromSource";

export async function getOne(id: string): Promise<HtmlPage | null> {
	const data: HtmlPageDb | null = await page.getOne({ id });
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

function render(data: HtmlPageDb): HtmlPage {
	const title = getPageTitleFromSource(data?.source_code) ?? "";
	return {
		...data,
		title,
		date_created: new Date(data.date_created),
		date_updated: new Date(data.date_updated),
	};
}
