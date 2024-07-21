import { AddressInfo } from "net";
import app from "./app";
import { log } from "./util/log";

const listener = app.listen(process.env.PORT, function () {
	const { port } = listener.address() as AddressInfo;
	log("Your app is listening on port " + port);
});
