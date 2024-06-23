import express, { Express } from "express";
import { AddressInfo } from "net";

var app: Express = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "views");

const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);
const mainRoutes = require("./routes/main");
app.use("/", mainRoutes);

var listener = app.listen(process.env.PORT, function () {
	const { port } = listener.address() as AddressInfo;
	console.log("Your app is listening on port " + port);
});
