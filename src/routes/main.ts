import fs from "fs";
import express from "express";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

import { runOcr, OCR_TYPES } from "../ocr";
import * as page from "../db/page";
import { defaultRenderObj as _r } from "../util/constants";
import { error404, errorHandler } from "./errorHandlers";
import * as HtmlPage from "../models/HtmlPage";

const router = express.Router();
const upload = multer({ dest: "./../../.data/images/" });

router.get("/", async function (req, res) {
	try {
		const pages = await HtmlPage.index();
		res.render("pages/index", { ..._r, pages, title: "Home" });
	} catch (error) {
		return errorHandler(req, res, error, { ..._r });
	}
});

router.get("/pages", (req, res) => {
	return res.redirect("/");
});

router.get("/pages/:id", async (req, res) => {
	const { id } = req.params;
	try {
		const page = await HtmlPage.getOne(id);
		if (!page?.id) return error404(req, res, id);
		const sourceCode = page?.source_code;
		if (!sourceCode) throw new Error("Invalid page");
		res.send(sourceCode);
	} catch (error) {
		return errorHandler(req, res, error, { ..._r, id });
	}
});

router.get("/new", async function (req, res) {
	try {
		res.render("pages/new", { ..._r, title: "New Page" });
	} catch (error) {
		return errorHandler(req, res, error, { ..._r });
	}
});

router.post("/new", upload.single("html-image"), async (req, res) => {
	const ocrTypeKey = req.body?.["ocr-method"];
	if (!ocrTypeKey || typeof ocrTypeKey !== "string")
		throw new Error("Invalid ocrType");
	const ocrType = OCR_TYPES?.[ocrTypeKey as keyof typeof OCR_TYPES];

	let imagePath: string = "";
	if (req.file && req.file.filename) {
		imagePath = "./../../.data/images/" + req.file.filename;
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
	} catch (error) {
		return errorHandler(req, res, error, { ..._r });
	}

	try {
		const row = await page.getOne({ id });
		res.redirect(`/pages/${row.id}`);
	} catch (error) {
		return errorHandler(req, res, error, { ..._r });
	}
});

router.get("/set-secret", async (req, res) => {
	const render = (title: string, body: string, script: string = "") => {
		return `
		<!DOCTYPE html>
		<html>
			<head><title>${title}</title></head>
			<body>${body}</body>
			<script>${script}</script>
		</html>
	`;
	};

	const enabled = process.env?.ALLOW_SET_SECRET === "TRUE";
	const title = "IRL HTML Set Secret";
	if (!enabled) {
		const body = "<h1>Setting Secret Disabled</h1>";
		res.send(render(title, body));
		return;
	}
	const body = '<h1>Setting Secret</h1><p id="status"></p>';
	const secret = process.env?.SECRET ?? undefined;
	const script = `
		console.log("Setting Secret");
		localStorage.setItem('secret', '${secret}');
		console.log("Secret set:", localStorage.getItem('secret'))
		document.getElementById("status").innerHTML = 'Secret set:' + localStorage.getItem('secret');
	`;
	res.send(render(title, body, script));
});

export = router;
