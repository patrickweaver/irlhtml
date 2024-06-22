const fs = require("fs");
const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { apiErrorHandler, getRowWithTitle } = require("./helpers");
const { runOcr, OCR_TYPES } = require("../ocr");
const page = require("../db/page");
const { defaultRenderObj: _r } = require("../util/render");

const BASE_URL = process.env.BASE_URL;

const router = express.Router();
var upload = multer({ dest: __dirname + "/../.data/images/" });

router.post("/new", upload.single("html-image"), async (req, res) => {
	const ocrType = OCR_TYPES?.[req.query?.ocrType];

	let imagePath = false;
	if (req.file && req.file.filename) {
		imagePath = __dirname + "/../.data/images/" + req.file.filename;
	}

	const id = uuidv4();
	const htmlContent = await runOcr(imagePath, ocrType);

	if (imagePath) {
		try {
			fs.unlinkSync(imagePath);
		} catch (err) {
			console.log("error deleting " + imagePath + ": " + err);
		}
	}

	try {
		await page.insert({ id, htmlContent });
		const row = await page.get({ id });
		res.json({ ...row, url: `${BASE_URL}/pages/${row.id}` });
	} catch (error) {
		return apiErrorHandler(req, res, error);
	}
});

router.get("/pages", async (req, res) => {
	try {
		const rows = await page.getAll();
		const rowsWithTitles = rows.map(getRowWithTitle);
		res.json(rowsWithTitles);
	} catch (error) {
		return apiErrorHandler(req, res, error);
	}
});

router.get("/pages/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const row = await page.get({ id });
		const rowWithTitle = getRowWithTitle(row);
		res.json(rowWithTitle);
	} catch (error) {
		return apiErrorHandler(req, res, error, { ..._r, id });
	}
});

router.delete("/pages/:id", async (req, res) => {
	const secret = req.query?.secret;
	try {
		if (secret !== process.env.SECRET) throw new Error("Invalid Secret");
		await page.del(req.params.id);
		res.status(200).json({ status: "deleted" });
	} catch (error) {
		apiErrorHandler(req, res, error);
	}
});

module.exports = router;
