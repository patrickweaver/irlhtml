const fs = require("fs");
const express = require("express");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const { runOcr, OCR_TYPES } = require("./ocr");
const page = require("./db/page");

const BASE_URL = process.env.BASE_URL;

var app = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.static("public"));
var upload = multer({ dest: __dirname + "/.data/images/" });

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
    await page.insert({ id, htmlContent });
  } catch (error) {
    console.log(error);
    res.json({ error: error });
    return;
  }

  try {
    const row = await page.get({ id });
    res.redirect(`/pages/${row.id}`);
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
});

app.post("/api/new", upload.single("image"), async (req, res) => {
  console.log({ query: req.query, body: req.body });
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
  } catch (error) {
    console.log(error);
    res.json({ error: error });
    return;
  }

  try {
    const row = await page.get({ id });
    res.json({ ...row, url: `${BASE_URL}/pages/${row.id}` });
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
});

app.get("/api/pages", async (req, res) => {
  function getPageTitleFromSource(_source) {
    if (!_source) return;
    const source = _source.toLowerCase();
    const splitOnTitleOpen = source.split("<title>");
    if (splitOnTitleOpen?.length !== 2) return;
    const splitOnTitleClose = splitOnTitleOpen[1].split("</title>");
    if (splitOnTitleClose?.length !== 2) return;
    return splitOnTitleClose[0];
  }

  try {
    const rows = await page.getAll();
    console.log({ pages_count: rows.length });
    const rowsWithTitles = rows.map((row) => {
      const source = row?.source_code;
      const title = getPageTitleFromSource(source);
      const rowWithTitle = { ...row, title };
      return rowWithTitle;
    });
    res.json(rowsWithTitles);
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
});

app.get("/pages/:id", async (req, res) => {
  try {
    const row = await page.get({ id: req.params.id });
    res.send(row.source_code);
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
});

app.delete("/api/pages/:id", async (req, res) => {
  const secret = req.query?.secret;
  try {
    if (secret !== process.env.SECRET) throw new Error("Invalid Secret");
    const status = await page.del(req.params.id);
    console.log({ status });
    res.status(200).json({ status: "deleted" });
  } catch (error) {
    console.log(error);
    res.json({ error: error });
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
