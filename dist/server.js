"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
var app = (0, express_1.default)();
app.use(express_1.default.json({ limit: "15mb" }));
app.use(express_1.default.static("src/public"));
app.set("view engine", "ejs");
app.set("views", "src/views");
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);
const mainRoutes = require("./routes/main");
app.use("/", mainRoutes);
var listener = app.listen(process.env.PORT, function () {
    const { port } = listener.address();
    console.log("Your app is listening on port " + port);
});
