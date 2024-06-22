const getPageTitleFromSource = require("../util/getPageTitleFromSource");

function apiErrorHandler(req, res, error, params = {}) {
	if (process.env.NODE_ENV === "development") {
		console.log(error);
		console.log({ url: req.url.slice(0, 5) });
	}
	res.status(500);
	return res.json({ error: "Server error" });
}

function errorHandler(req, res, error, params = {}) {
	if (process.env.NODE_ENV === "development") {
		console.log(error);
		console.log({ url: req.url.slice(0, 5) });
	}
	res.status(500);
	return res.render("pages/error", params);
}

function error404(req, res, id) {
	res.status(404);
	return res.render("pages/error404", { ..._r, id });
}

function getRowWithTitle(row) {
	const source = row?.source_code;
	const title = getPageTitleFromSource(source);
	const rowWithTitle = { ...row, title };
	return rowWithTitle;
}

module.exports = {
	apiErrorHandler,
	errorHandler,
	error404,
	getRowWithTitle,
};
