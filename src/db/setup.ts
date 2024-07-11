import { run } from "./index";
const checkClear = () => process.env.CLEAR_ALL_ROWS === "TRUE";
console.log("Clear:", checkClear(), `(${process.env.CLEAR_ALL_ROWS})`);

export const successMessage = "Tables created successfully";

export const schema = `
CREATE TABLE IF NOT EXISTS Pages (
	id text NOT NULL PRIMARY KEY,
	source_code text NOT NULL,
	date_created text NOT NULL,
	date_updated text NOT NULL,
	slug text,
	author text
);
`;

export const clearQuery = `
	DROP TABLE Pages;
`;

export default async (dbExec: typeof run) => {
	if (process.env.ENVIRONMENT === "production") return;
	console.log(
		`Running db setup on ${process.env?.ENVIRONMENT ?? "unknown"} environment`,
	);
	try {
		if (checkClear()) await dbExec(clearQuery);
		await dbExec(schema);
		console.log(successMessage);
	} catch (error) {
		console.log(String(error));
	}
};
