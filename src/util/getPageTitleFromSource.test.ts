import { describe, expect, test } from "@jest/globals";
import getPageTitleFromSource from "./getPageTitleFromSource";

describe("getPageTitleFromSource", () => {
	test("Returns undefined with empty source", () => {
		expect(getPageTitleFromSource("")).toBe(undefined);
	});

	test("Returns undefined with empty string source", () => {
		const source = "";
		expect(getPageTitleFromSource(source)).toBe(undefined);
	});

	test("Returns undefined when no open title tag in source", () => {
		const source = "<html><h1>Website</h1></html>";
		expect(getPageTitleFromSource(source)).toBe(undefined);
	});

	test("Returns undefined when no close title tag in source", () => {
		const source =
			"<html><head><title>My Website</head><h1>Website</h1></html>";
		expect(getPageTitleFromSource(source)).toBe(undefined);
	});

	test("Returns title with correct casing when included in source", () => {
		const source =
			"<html><head><title>MY WEBSITE</title></head><h1>Website</h1></html>";
		expect(getPageTitleFromSource(source)).toBe("MY WEBSITE");
	});

	test("Returns title with trimmed whitespace when included in source", () => {
		const source =
			"<html><head><title> MY  WEBSITE </title></head><h1>Website</h1></html>";
		expect(getPageTitleFromSource(source)).toBe("MY WEBSITE");
		const source2 =
			"<html><head><title> MY	WEBSITE </title></head><h1>Website</h1></html>";
		expect(getPageTitleFromSource(source2)).toBe("MY WEBSITE");
	});

	test("Returns only first title in source", () => {
		const source =
			"<html><head><title>First Title</title><title>Second Title</title></head><h1>Website</h1></html>";
		expect(getPageTitleFromSource(source)).toBe("First Title");
	});
});
