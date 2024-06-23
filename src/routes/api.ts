import fs from "fs";
import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { apiErrorHandler } from "./helpers";
import { runOcr, OCR_TYPES } from "../ocr";
import * as page from "../db/page";
import * as HtmlPage from "../models/HtmlPage";

const BASE_URL = process.env.BASE_URL;

const router = express.Router();
const upload = multer({ dest: __dirname + "/../../.data/images/" });

router.post("/new", upload.single("html-image"), async (req, res) => {
	const ocrTypeKey = req.query?.ocrType;
	if (!ocrTypeKey || typeof ocrTypeKey !== "string")
		throw new Error("Invalid ocrType");
	const ocrType = OCR_TYPES[ocrTypeKey as keyof typeof OCR_TYPES];

	let imagePath = "";
	if (req.file && req.file.filename) {
		imagePath = __dirname + "/../../.data/images/" + req.file.filename;
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
		const pages = await HtmlPage.index();
		res.json(pages);
	} catch (error) {
		return apiErrorHandler(req, res, error);
	}
});

router.get("/pages/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const page = await HtmlPage.get(id);
		if (!page?.id) throw new Error("Page not found");
		res.json(page);
	} catch (error) {
		return apiErrorHandler(req, res, error);
	}
});

router.delete("/pages/:id", async (req, res) => {
	const secret = req.query?.secret;
	try {
		if (secret !== process.env.SECRET) throw new Error("Invalid Secret");
		await page.del({ id: req.params.id });
		res.status(200).json({ status: "deleted" });
	} catch (error) {
		apiErrorHandler(req, res, error);
	}
});

export = router;
