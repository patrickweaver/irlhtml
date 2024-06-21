const fs = require("fs");
const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const { runOcr, OCR_TYPES } = require("./ocr");
const page = require("./db/page");
const getPageTitleFromSource = require("./util/getPageTitleFromSource");
const { defaultRenderObj: _r } = require("./util/render");

const BASE_URL = process.env.BASE_URL;

var app = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.static("public"));
app.set("view engine", "ejs");
var upload = multer({ dest: __dirname + "/.data/images/" });

app.get("/", async function (req, res) {
  try {
    const rows = await page.getAll();
    const rowsWithTitles = rows.map(getRowWithTitle);
    res.render("pages/index", { ..._r, pages: rowsWithTitles, title: "home" });
  } catch (error) {
    return errorHandler(req, res, error, { ..._r });
  }
});

app.get("/pages", (req, res) => {
  return res.redirect("/");
});

app.get("/pages/:id", async (req, res) => {
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

app.get("/new", async function (req, res) {
  try {
    res.render("pages/new", { ..._r, title: "new" });
  } catch (error) {
    return errorHandler(req, res, error, { ..._r });
  }
});

app.post("/new", upload.single("html-image"), async (req, res) => {
  const ocrType = OCR_TYPES?.[req.body?.["ocr-method"]];

  let imagePath = false;
  if (req.file && req.file.filename) {
    imagePath = "./.data/images/" + req.file.filename;
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

app.post("/api/new", upload.single("image"), async (req, res) => {
  const ocrType = OCR_TYPES?.[req.query?.ocrType];

  let imagePath = false;
  if (req.file && req.file.filename) {
    imagePath = "./.data/images/" + req.file.filename;
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
    await page.insert({ id, htmlContent });
    const row = await page.get({ id });
    res.json({ ...row, url: `${BASE_URL}/pages/${row.id}` });
  } catch (error) {
    return errorHandler(req, res, error);
  }
});

app.get("/api/pages", async (req, res) => {
  try {
    const rows = await page.getAll();
    const rowsWithTitles = rows.map(getRowWithTitle);
    res.json(rowsWithTitles);
  } catch (error) {
    return errorHandler(req, res, error);
  }
});

app.get("/api/pages/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const row = await page.get({ id });
    const rowWithTitle = getRowWithTitle(row);
    res.json(rowWithTitle);
  } catch (error) {
    return errorHandler(req, res, error, { ..._r, id });
  }
});

app.delete("/api/pages/:id", async (req, res) => {
  const secret = req.query?.secret;
  try {
    if (secret !== process.env.SECRET) throw new Error("Invalid Secret");
    const status = await page.del(req.params.id);
    res.status(200).json({ status: "deleted" });
  } catch (error) {
    errorHandler(req, res, error);
  }
});

app.get("/set-secret", async (req, res) => {
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
  const body = `<h1>Setting Secret</h1><p id="status"></p>`;
  const secret = process.env?.SECRET ?? undefined;
  const script = `
    console.log("Setting Secret");
    localStorage.setItem('secret', '${secret}');
    console.log("Secret set:", localStorage.getItem('secret'))
    document.getElementById("status").innerHTML = 'Secret set:' + localStorage.getItem('secret');
  `;
  res.send(render(title, body, script));
});

var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});

function errorHandler(req, res, error, params = {}) {
  console.log(error);
  console.log({ url: req.url.slice(0, 5) });
  const apiRequest = req.url.slice(0, 5).toLowerCase() === "/api/";
  res.status(500);
  if (apiRequest) return res.json({ error: "Server error" });
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
