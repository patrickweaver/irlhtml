import { Request, Response } from "express";
import { defaultRenderObj as _r } from "../util/constants";

export function apiErrorHandler(
	req: Request,
	res: Response,
	error: unknown,
	status?: number,
) {
	if (process.env.NODE_ENV === "development") {
		console.log(error);
		console.log({ url: req.url.slice(0, 5) });
	}
	if (status && status >= 400 && status < 500) {
		return res.status(status).json({ error: String(error) });
	}
	res.status(500);
	return res.json({ error: "Server error" });
}

export function errorHandler(
	req: Request,
	res: Response,
	error: unknown,
	status: number,
	/* eslint-disable  @typescript-eslint/no-explicit-any */
	params: any = {},
) {
	if (process.env.NODE_ENV === "development") {
		console.log(error);
		console.log({ url: req.url.slice(0, 5) });
	}
	res.status(status);
	return res.render("pages/error", params);
}

export function error404(req: Request, res: Response, id: string) {
	res.status(404);
	return res.render("pages/error404", { ..._r, id });
}
