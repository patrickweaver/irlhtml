export function log(...params: any) {
	if (process.env.DEBUG?.toUpperCase() === "TRUE") {
		console.log(...params);
	}
}
