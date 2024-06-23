import * as db from "./";

export async function insert({
	id,
	htmlContent,
}: {
	id: string;
	htmlContent: string;
}) {
	const timestamp = new Date().toISOString();
	const query = `
		INSERT INTO Pages
		(
			id,
			source_code,
			date_created,
			date_updated
		) VALUES (
			?,
			?,
			?,
			?
		);
	`;
	const success = await db.run(query, [id, htmlContent, timestamp, timestamp]);
	return success;
}

export async function get({ id }: { id: string }) {
	const query = `
		SELECT *
		FROM Pages
		WHERE id = ?
	`;
	const rows = await db.all(query, [id]);
	return rows[0];
}

export async function getAll() {
	const query = `
		SELECT *
		FROM Pages
		ORDER BY date_created
		DESC
	`;
	return db.all(query);
}

export async function del({ id }: { id: string }) {
	const query = `
			DELETE FROM Pages WHERE id = '?'
		`;
	return db.run(query, [id]);
}
