const db = require("./");

async function insert({ id, htmlContent }) {
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

async function get({ id }) {
	const query = `
		SELECT *
		FROM Pages
		WHERE id = ?
	`;
	const rows = await db.all(query, [id]);
	return rows[0];
}

async function getAll() {
	const query = `
		SELECT *
		FROM Pages
		ORDER BY date_created
		DESC
	`;
	return db.all(query);
}

async function del({ id }) {
	const query = `
			DELETE FROM Pages WHERE id = '?'
		`;
	return db.run(query, [id]);
}

module.exports = { insert, get, getAll, del };
