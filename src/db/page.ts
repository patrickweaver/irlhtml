import * as db from "./";

export const insertQuery = `
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
export async function insert({
	id,
	htmlContent,
}: {
	id: string;
	htmlContent: string;
}) {
	const timestamp = new Date().toISOString();
	const success = await db.run(insertQuery, [
		id,
		htmlContent,
		timestamp,
		timestamp,
	]);
	return success;
}

export const getOneByIdOrSlugQuery = `
		SELECT *
		FROM Pages
		WHERE (
			id = ?
			OR slug = ?
		)
	`;
export async function getOne({ idOrSlug }: { idOrSlug: string }): Promise<{
	id: string;
	source_code: string;
	date_created: string;
	date_updated: string;
	slug: string;
	author: string | null;
} | null> {
	const rows = await db.all(getOneByIdOrSlugQuery, [idOrSlug, idOrSlug]);
	return rows?.[0] ?? null;
}

export const getAllQuery = `
		SELECT *
		FROM Pages
		ORDER BY date_created
		DESC
	`;
export async function getAll(): Promise<
	{
		id: string;
		source_code: string;
		date_created: string;
		date_updated: string;
		slug: string;
		author: string | null;
	}[]
> {
	return db.all(getAllQuery);
}

export const delQuery = `
			DELETE FROM Pages WHERE id = ?
		`;
export async function del({ id }: { id: string }) {
	await db.run(delQuery, [id]);
	return true;
}
