import { describe, expect, test } from "@jest/globals";
import { getSlugOptions } from "./getSlugOptions";

describe("getSlugOptions", () => {
	test("should suggest correct options for one word title", () => {
		const result = getSlugOptions("Website");
		expect(result).toEqual(["website"]);
	});

	test("should suggest correct options for multi word title", () => {
		const result = getSlugOptions("My Fun Website");
		expect(result).toEqual(["my", "my-fun", "my-fun-website"]);
	});

	test("should suggest correct options for multi word title up to limit", () => {
		const result = getSlugOptions("My Fun Website Foryou");
		expect(result).toEqual(["my", "my-fun", "my-fun-website"]);
	});

	test("should suggest first word trimmed even if too long", () => {
		const result = getSlugOptions("012345678901234567891 Website");
		expect(result).toEqual(["01234567890123456789"]);
	});
});
