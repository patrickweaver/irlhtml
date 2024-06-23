import { Request, Response } from "express";
import { defaultRenderObj as _r } from "../util/render";
import getPageTitleFromSource from "../util/getPageTitleFromSource";

export function apiErrorHandler(req: Request, res: Response, error: unknown) {
	if (process.env.NODE_ENV === "development") {
		console.log(error);
		console.log({ url: req.url.slice(0, 5) });
	}
	res.status(500);
	return res.json({ error: "Server error" });
}

export function errorHandler(
	req: Request,
	res: Response,
	error: unknown,
	/* eslint-disable  @typescript-eslint/no-explicit-any */
	params: any = {},
) {
	if (process.env.NODE_ENV === "development") {
		console.log(error);
		console.log({ url: req.url.slice(0, 5) });
	}
	res.status(500);
	return res.render("pages/error", params);
}

export function error404(req: Request, res: Response, id: string) {
	res.status(404);
	return res.render("pages/error404", { ..._r, id });
}

/* eslint-disable  @typescript-eslint/no-explicit-any */
export function getRowWithTitle(row: any) {
	const source = row?.source_code;
	const title = getPageTitleFromSource(source);
	const rowWithTitle = { ...row, title };
	return rowWithTitle;
}
