import sqlite3 from "sqlite3";
import { v4 as uuidv4 } from "uuid";
import { HtmlPageDb } from "../../src/types/HtmlPage";

export const testData1: HtmlPageDb = {
	id: "10000000-0000-0000-0000-000000000000",
	source_code: "<h1>Test</h1>",
	date_created: "2024-01-01T12:34:56.789Z",
	date_updated: "2024-01-01T12:34:56.789Z",
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
};

export async function createPagesData(
	db: sqlite3.Database,
	{
		id = uuidv4(),
		source_code,
		date_created = new Date().toISOString(),
		date_updated = new Date().toISOString(),
	}: HtmlPageDb,
) {
	const testData: HtmlPageDb = { id, source_code, date_created, date_updated };
	db.run(`
    INSERT INTO Pages (
      id,
      source_code,
      date_created,
      date_updated
    ) VALUES  (
      "${testData.id}",
      "${testData.source_code}",
      "${testData.date_created}",
      "${testData.date_updated}"
    )
    ;
  `);
	await new Promise((r) => setTimeout(r, 5));
}
