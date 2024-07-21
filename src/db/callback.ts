import { log } from "../util/log";
import DATABASE_PATH from "./dbPath";
export const successMessage = `SQLite Database at ${DATABASE_PATH} opened successfully.`;

export default (error: unknown) => {
	if (error) {
		log(String(error));
	} else {
		log(successMessage);
	}
};
