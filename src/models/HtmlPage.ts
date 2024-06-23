import { HtmlPage, HtmlPageDb } from "../types/HtmlPage";
import * as page from "../db/page";
import { getPageTitle } from "../routes/helpers";

export async function get(id: string): Promise<HtmlPage> {
	const data: HtmlPageDb = await page.get({ id });
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
	const title = getPageTitle(data);
	return {
		...data,
		title,
		date_created: new Date(data.date_created),
		date_updated: new Date(data.date_updated),
	};
}
