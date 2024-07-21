import fs from "fs";
import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { apiErrorHandler } from "./errorHandlers";
import { runOcr } from "../ocr";
import * as page from "../db/page";
import * as HtmlPage from "../models/HtmlPage";
import { OcrTypes } from "../types/Ocr";
import getPageTitleFromSource from "../util/getPageTitleFromSource";
import { log } from "../util/log";

if (!process.env.IMAGES_PATH) process.exit(1);

const BASE_URL = process.env.BASE_URL;

const router = express.Router();
const upload = multer({ dest: process.env.IMAGES_PATH });

router.post("/new", upload.single("html-image"), async (req, res) => {
	try {
		const ocrTypeKey = req.query?.ocrType ?? req.body?.ocrType;
		if (
			!ocrTypeKey ||
			typeof ocrTypeKey !== "string" ||
			!(ocrTypeKey in OcrTypes)
		)
			return apiErrorHandler(req, res, "Invalid ocrType", 400);
		const ocrType = OcrTypes[ocrTypeKey as keyof typeof OcrTypes];
		const author = req.query?.author ?? req.body?.author ?? null;
		let imagePath = "";
		if (req.file && req.file.filename) {
			imagePath = process.env.IMAGES_PATH + req.file.filename;
		}

		const id = uuidv4();
		const result = await runOcr(imagePath, ocrType);

		if (!result.success) {
			throw new Error("OCR Failed");
		}

		if (imagePath) {
			try {
				fs.unlinkSync(imagePath);
			} catch (err) {
				log("error deleting " + imagePath + ": " + err);
			}
		}

		const htmlContent = result.text;
		const title = getPageTitleFromSource(htmlContent);
		const slug = await HtmlPage.getSlug(id, title);

		await page.insert({ id, htmlContent, slug, author });
		const row = await page.getOne({ idOrSlug: id });
		if (!row?.id) throw new Error("Upload failed");
		return res.json({ ...row, url: `${BASE_URL}/pages/${row.slug}` });
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

router.get("/pages/:idOrSlug", async (req, res) => {
	const { idOrSlug } = req.params;
	try {
		const page = await HtmlPage.getOne(idOrSlug);
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
		await page.del({ idOrSlug: req.params.id });
		return res.status(200).json({ status: "deleted" });
	} catch (error) {
		return apiErrorHandler(req, res, error);
	}
});

export default router;
