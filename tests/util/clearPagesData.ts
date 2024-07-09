import sqlite3 from "sqlite3";

export async function clearPagesData(db: sqlite3.Database) {
	await new Promise((resolve, reject) => {
		db.run("DELETE FROM Pages;", {}, (err: unknown) =>
			err ? reject(err) : resolve(true),
		);
	});
}
