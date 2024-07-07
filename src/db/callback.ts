import DATABASE_PATH from "./dbPath";
export const successMessage = `SQLite Database at ${DATABASE_PATH} opened successfully.`;

export default (error: unknown) => {
	if (error) {
		console.log(String(error));
		return;
	}
	console.log(successMessage);
};
