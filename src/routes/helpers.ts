import { Request, Response } from "express";
import { defaultRenderObj as _r } from "../util/constants";
import getPageTitleFromSource from "../util/getPageTitleFromSource";
import { HtmlPageDb } from "../types/HtmlPage";

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

export function getPageTitle(pageData: HtmlPageDb): string {
	const source = pageData?.source_code;
	const title = getPageTitleFromSource(source) ?? "";
	return title;
}
