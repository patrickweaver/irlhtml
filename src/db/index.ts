import DATABASE_PATH from "./dbPath";
import callback from "./callback";
import setup from "./setup";
import _sqlite3 from "sqlite3";
const sqlite3 = _sqlite3.verbose();
const db = new sqlite3.Database(DATABASE_PATH, callback);

/* eslint-disable  @typescript-eslint/no-explicit-any */
export const run = async (query: string, params: Array<any> = []) => {
	return await new Promise((resolve, reject) => {
		db.run(query, params, (err) => {
			if (err) {
				reject(err);
			}
			resolve(true);
		});
	});
};

export const all = async (
	query: string,
	/* eslint-disable  @typescript-eslint/no-explicit-any */
	params: Array<any> = [],
	/* eslint-disable  @typescript-eslint/no-explicit-any */
): Promise<Array<any>> => {
	return await new Promise((resolve, reject) => {
		db.all(query, params, (err, rows) => {
			if (err) {
				reject(err);
			}
			resolve(rows);
		});
	});
};

setup(run);
