import { HtmlPage, HtmlPageDb } from "../types/HtmlPage";
import * as page from "../db/page";
import { getRowWithTitle } from "../routes/helpers";

export async function get(id: string): Promise<HtmlPage> {
	const data: HtmlPageDb = await page.get({ id });
	return render(data);
}

function render(data: HtmlPageDb): HtmlPage {
	const { title } = getRowWithTitle(data);
	return {
		...data,
		title,
		date_created: new Date(data.date_created),
		date_updated: new Date(data.date_updated),
	};
}
