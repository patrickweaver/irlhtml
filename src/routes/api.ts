import fs from "fs";
import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { apiErrorHandler } from "./errorHandlers";
import { runOcr, OCR_TYPES } from "../ocr";
import * as page from "../db/page";
import * as HtmlPage from "../models/HtmlPage";
import { insufficientCreditMessage } from "../util/constants";

if (!process.env.IMAGES_PATH) process.exit(1);

const BASE_URL = process.env.BASE_URL;

const router = express.Router();
const upload = multer({ dest: process.env.IMAGES_PATH });

router.post("/new", upload.single("html-image"), async (req, res) => {
	try {
		const ocrTypeKey = req.query?.ocrType;
		if (
			!ocrTypeKey ||
			typeof ocrTypeKey !== "string" ||
			!(ocrTypeKey in OCR_TYPES)
		)
			return apiErrorHandler(req, res, "Invalid ocrType", 400);
		const ocrType = OCR_TYPES[ocrTypeKey as keyof typeof OCR_TYPES];

		let imagePath = "";
		if (req.file && req.file.filename) {
			imagePath = process.env.IMAGES_PATH + req.file.filename;
		}

		const id = uuidv4();
		const result = await runOcr(imagePath, ocrType);

		if (typeof result === "object") {
			if (result?.handledError) {
				throw new Error(insufficientCreditMessage);
			}
			throw new Error("Invalid OCR response");
		}

		const htmlContent = result;

		if (imagePath) {
			try {
				fs.unlinkSync(imagePath);
			} catch (err) {
				console.log("error deleting " + imagePath + ": " + err);
			}
		}

		await page.insert({ id, htmlContent });
		const row = await page.getOne({ id });
		if (!row?.id) throw new Error("Upload failed");
		return res.json({ ...row, url: `${BASE_URL}/pages/${row.id}` });
	} catch (error) {
		return apiErrorHandler(req, res, error);
	}
});

router.get("/pages", async (req, res) => {
	try {
		const pages = await HtmlPage.index();
		return res.json(pages);
	} catch (error) {
		return apiErrorHandler(req, res, error);
	}
});

router.get("/pages/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const page = await HtmlPage.getOne(id);
		if (!page?.id) return apiErrorHandler(req, res, "Page not found", 404);
		return res.json(page);
	} catch (error) {
		return apiErrorHandler(req, res, error);
	}
});

router.delete("/pages/:id", async (req, res) => {
	try {
		const secret = req.query?.secret;
		if (secret !== process.env.SECRET)
			return apiErrorHandler(req, res, "Invalid secret", 401);
		await page.del({ id: req.params.id });
		return res.status(200).json({ status: "deleted" });
	} catch (error) {
		return apiErrorHandler(req, res, error);
	}
});

export default router;
