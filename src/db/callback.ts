import DATABASE_PATH from "./dbPath";
const successMessage = `SQLite Database at ${DATABASE_PATH} opened successfully.`;

export default (error: unknown) => {
	if (error) {
		console.log(`Error:\n${error}`);
		return;
	}
	console.log(successMessage);
};
