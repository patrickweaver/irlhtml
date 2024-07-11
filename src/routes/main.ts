import fs from "fs";
import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import { runOcr } from "../ocr";
import * as page from "../db/page";
import { defaultRenderObj as _r } from "../util/constants";
import { error404, errorHandler } from "./errorHandlers";
import * as HtmlPage from "../models/HtmlPage";
import { PROMPT } from "../ocr/prompt";
import { OcrTypes } from "../types/Ocr";

const router = express.Router();
const upload = multer({ dest: process.env.IMAGES_PATH });

if (!process.env.IMAGES_PATH) process.exit(1);

router.get("/", async function (req, res) {
	try {
		const pages = await HtmlPage.index();
		res.render("pages/index", { ..._r, pages, title: "Home" });
	} catch (error) {
		return errorHandler(req, res, error, 500, { ..._r });
	}
});

router.get("/pages", (req, res) => {
	return res.redirect("/");
});

router.get("/pages/new", (req, res) => {
	return res.redirect("/new");
});

router.get("/pages/:idOrSlug", async (req, res) => {
	const { idOrSlug } = req.params;
	try {
		const page = await HtmlPage.getOne(idOrSlug);
		if (!page?.id) return error404(req, res, idOrSlug);
		const sourceCode = page?.source_code;
		if (!sourceCode) throw new Error("Invalid page");
		res.send(sourceCode);
	} catch (error) {
		return errorHandler(req, res, error, 500, { ..._r, idOrSlug });
	}
});

router.get("/new", async function (req, res) {
	try {
		res.render("pages/new", {
			..._r,
			title: "New Page",
			llmPrompt: PROMPT,
			contactEmail:
				process.env.CONTACT_EMAIL ?? "[Error: Email not configured]",
		});
	} catch (error) {
		return errorHandler(req, res, error, 500, { ..._r });
	}
});

router.post("/new", upload.single("html-image"), async (req, res) => {
	try {
		const ocrTypeKey = req.body?.["ocr-method"];
		console.log(ocrTypeKey);
		if (
			!ocrTypeKey ||
			typeof ocrTypeKey !== "string" ||
			!(ocrTypeKey in OcrTypes)
		)
			return errorHandler(req, res, "Invalid ocr-method", 400, { ..._r });
		const ocrType = OcrTypes?.[ocrTypeKey as keyof typeof OcrTypes];

		let imagePath: string = "";
		if (req.file && req.file.filename) {
			imagePath = process.env.IMAGES_PATH + req.file.filename;
		}

		const id = uuidv4();

		const result = await runOcr(imagePath, ocrType);

		if (!result.success) {
			return errorHandler(req, res, null, 503, {
				..._r,
				errorMessage: ocrType + " " + result.error?.message ?? "OCR failed",
			});
		}

		if (imagePath) {
			try {
				fs.unlinkSync(imagePath);
			} catch (err) {
				console.log("error deleting " + imagePath + ": " + err);
			}
		}
		await page.insert({ id, htmlContent: result.text });
		const row = await page.getOne({ idOrSlug: id });
		if (!row?.id) throw new Error("Upload failed");
		res.redirect(`/pages/${row.id}`);
	} catch (error) {
		return errorHandler(req, res, error, 500, { ..._r });
	}
});

export default router;
