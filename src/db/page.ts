import * as db from "./";

export const insertQuery = `
		INSERT INTO Pages
		(
			id,
			source_code,
			date_created,
			date_updated,
			slug,
			author
		) VALUES (
			?,
			?,
			?,
			?,
			?,
			?
		);
	`;
export async function insert({
	id,
	htmlContent,
	slug,
	author,
}: {
	id: string;
	htmlContent: string;
	slug: string;
	author: string | null;
}) {
	const timestamp = new Date().toISOString();
	const success = await db.run(insertQuery, [
		id,
		htmlContent,
		timestamp,
		timestamp,
		slug,
		author,
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
		;
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
		;
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
			DELETE FROM Pages
			WHERE id = ?
			OR slug = ?
			;
		`;
export async function del({ idOrSlug }: { idOrSlug: string }) {
	const row = await getOne({ idOrSlug });
	if (!row) throw new Error("Not found");
	await db.run(delQuery, [idOrSlug, idOrSlug]);
	return true;
}
