const fs = require("fs");
const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const { runOcr, OCR_TYPES } = require("../ocr");
const page = require("../db/page");
const { defaultRenderObj: _r } = require("../util/render");
const { error404, errorHandler, getRowWithTitle } = require("./helpers");

const router = express.Router();
var upload = multer({ dest: __dirname + "/../.data/images/" });

router.get("/", async function (req, res) {
  try {
    const rows = await page.getAll();
    const rowsWithTitles = rows.map(getRowWithTitle);
    res.render("pages/index", { ..._r, pages: rowsWithTitles, title: "home" });
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
    const row = await page.get({ id });
    if (!row) return error404(req, res, id);
    const sourceCode = row?.source_code;
    if (!sourceCode) throw new Error("Invalid page");
    res.send(sourceCode);
  } catch (error) {
    return errorHandler(req, res, error, { ..._r, id });
  }
});

router.get("/new", async function (req, res) {
  try {
    res.render("pages/new", { ..._r, title: "new" });
  } catch (error) {
    return errorHandler(req, res, error, { ..._r });
  }
});

router.post("/new", upload.single("html-image"), async (req, res) => {
  const ocrType = OCR_TYPES?.[req.body?.["ocr-method"]];

  let imagePath = false;
  if (req.file && req.file.filename) {
    imagePath = __dirname + "/../.data/images/" + req.file.filename;
  }

  const id = uuidv4();

  const source_code = req.body?.source_code?.replaceAll('"', "'");
  // const image_url = req.body.image_url;

  const htmlContent = await runOcr(imagePath, ocrType);

  if (imagePath) {
    try {
      fs.unlinkSync(imagePath);
    } catch (err) {
      console.log("error deleting " + imagePath + ": " + err);
    }
  }

  try {
    const success = await page.insert({ id, htmlContent });
  } catch (error) {
    return errorHandler(req, res, error, { ..._r });
  }

  try {
    const row = await page.get({ id });
    res.redirect(`/pages/${row.id}`);
  } catch (error) {
    return errorHandler(req, res, error, { ..._r });
  }
});

router.get("/set-secret", async (req, res) => {
  const render = (title, body, script = "") => {
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

module.exports = router;
