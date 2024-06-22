const express = require("express");

var app = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.static("public"));
app.set("view engine", "ejs");

const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);
const mainRoutes = require("./routes/main");
app.use("/", mainRoutes);

var listener = app.listen(process.env.PORT, function () {
  console.log("Your app is listening on port " + listener.address().port);
});
