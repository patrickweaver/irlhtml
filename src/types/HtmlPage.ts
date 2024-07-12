export type HtmlPage = {
	id: string;
	source_code: string;
	date_created: Date;
	date_updated: Date;
	title: string;
	slug: string;
	author: string | null;
};

export type HtmlPageDb = {
	id: string;
	source_code: string;
	date_created: string;
	date_updated: string;
	slug: string;
	author: string | null;
};
