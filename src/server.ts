import { AddressInfo } from "net";
import app from "./app";

const listener = app.listen(process.env.PORT, function () {
	const { port } = listener.address() as AddressInfo;
	console.log("Your app is listening on port " + port);
});
