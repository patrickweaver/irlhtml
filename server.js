const fs = require('fs');
const express = require("express");
const multer  = require('multer')
const { v4: uuidv4 } = require("uuid");
const Database = require("better-sqlite3");

const db = require("./db");
const gvocr = require("./ocr").googleVisionTextDetection;

const BASE_URL = "https://irlhtml.glitch.me";

var app = express();
app.use(express.json({limit: '15mb'}));
app.use(express.static("public"));
var upload = multer({ dest: __dirname + '/.data/images/' });

app.post("/api/new", upload.single('image'), async (req, res) => {
  // console.log({ body: req.body });
  
  let imagePath = false;
  if (req.file && req.file.filename) {
    imagePath = './.data/images/' + req.file.filename;
  }
  
  
  const id = uuidv4();
  const timestamp = new Date().toISOString();

  const source_code = req.body?.source_code?.replaceAll('"', "'");
  // const image_url = req.body.image_url;
  
  const gvOcrGuess = await gvocr(imagePath);
  
  console.log('** **')
  console.log(source_code)
  console.log(gvOcrGuess)
  console.log('** **')
  
  if (imagePath) {
    try {
      fs.unlinkSync(imagePath);
    } catch (err) {
      console.log('error deleting ' +  imagePath + ': ' + err);
    }
  }

  const createQuery = `
    INSERT INTO Pages
    (
      id,
      source_code,
      date_created,
      date_updated
    ) VALUES (
      "${id}",
      "${gvOcrGuess.text}",
      "${timestamp}",
      "${timestamp}"
    );
  `;
  try {
    const success = await db.exec(createQuery);
  } catch (error) {
    console.log(error);
    res.json({ error: error });
    return;
  }

  try {
    const row = (await db.all(`SELECT * FROM Pages WHERE id = '${id}'`))[0];
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
    const rows = await db.all(`SELECT * FROM Pages ORDER BY date_created DESC`);
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
    const row = (
      await db.all(`
      SELECT * FROM Pages WHERE id = '${req.params.id}'
    `)
    )[0];
    console.log({ row });
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
    const status = await db.all(`
      DELETE FROM Pages WHERE id = '${req.params.id}'
    `);
    console.log({ status });
    res.status(200).json({ status: "deleted" });
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
});

app.get("/set-secret", async (req, res) => {
  const enabled = process.env?.ALLOW_SET_SECRET === "TRUE";
  if (!enabled) {
    res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>IRL HTML Set Secret</title></head>
      <body><h1>Setting Secret Disabled</h1></body>
    </html>
  `);
  }
  res.send(`
    <!DOCTYPE html>
    <html>
      <head><title>IRL HTML Set Secret</title></head>
      <body><h1>Setting Secret</h1><p id="status"></p></body>
      <script>
        console.log("Setting Secret");
        localStorage.setItem('secret', '${process.env?.SECRET ?? undefined}');
        console.log("Secret set:", localStorage.getItem('secret'))
        document.getElementById("status").innerHTML = 'Secret set:' + localStorage.getItem('secret');
      </script>
    </html>
  `);
});

var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
