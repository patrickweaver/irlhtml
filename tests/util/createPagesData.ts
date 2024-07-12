import sqlite3 from "sqlite3";
import { HtmlPageDb } from "../../src/types/HtmlPage";

export const testData1: HtmlPageDb = {
	id: "10000000-0000-0000-0000-000000000000",
	source_code: "<h1>Test</h1>",
	date_created: "2024-01-01T12:34:56.789Z",
	date_updated: "2024-01-01T12:34:56.789Z",
	slug: "1000",
	author: null,
};
export const testData2: HtmlPageDb = {
	id: "20000000-0000-0000-0000-000000000000",
	source_code: `
    <html>
      <head><title>Test Title</title></head>
      <body><h1>Test Again</h1></body>
    </html>
  `,
	date_created: "2024-02-02T00:00:00.000Z",
	date_updated: "2024-02-02T02:02:02.002Z",
	slug: "test-title",
	author: "Patrick",
};
export const testData3: HtmlPageDb = {
	id: "30000000-0000-0000-0000-000000000000",
	source_code: `
    <html>
      <head><title>Test</title></head>
      <body><h1>Test 3</h1></body>
    </html>
  `,
	date_created: "2024-03-03T00:00:00.000Z",
	date_updated: "2024-03-03T03:03:03.003Z",
	slug: "test",
	author: "Patrick",
};

export async function createPagesData(
	db: sqlite3.Database,
	{ id, source_code, date_created, date_updated, slug, author }: HtmlPageDb,
) {
	return await new Promise((resolve, reject) => {
		db.run(
			`
    INSERT INTO Pages (
      id,
      source_code,
      date_created,
      date_updated,
			slug,
			author
    ) VALUES  (
      ?,
      ?,
      ?,
      ?,
			?,
			?
    )
    ;
  `,
			[id, source_code, date_created, date_updated, slug, author],
			async (err) => {
				if (err) {
					reject(err);
				}
				resolve(true);
			},
		);
	});
}
