import express, { Express } from "express";
import { AddressInfo } from "net";

import apiRoutes from "./routes/api";
import mainRoutes from "./routes/main";

const app: Express = express();
app.use(express.json({ limit: "15mb" }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "views");

app.use("/api", apiRoutes);
app.use("/", mainRoutes);

const listener = app.listen(process.env.PORT, function () {
	const { port } = listener.address() as AddressInfo;
	console.log("Your app is listening on port " + port);
});
