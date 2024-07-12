import { describe, expect, test } from "@jest/globals";
import { fixCommonOcrErrors } from "./fixCommonOcrErrors";

describe("fixCommonOcrErrors", () => {
	test("Fixes 1 mistaken for L", () => {
		expect(fixCommonOcrErrors("<hl>")).toBe("<h1>");
	});

	test("Only fixes within tags", () => {
		expect(fixCommonOcrErrors("hl")).toBe("hl");
	});

	test("Fixes h mistaken for n", () => {
		expect(fixCommonOcrErrors("<n1>")).toBe("<h1>");
		expect(fixCommonOcrErrors("<n2>")).toBe("<h2>");
		expect(fixCommonOcrErrors("<n3>")).toBe("<h3>");
		expect(fixCommonOcrErrors("<n4>")).toBe("<h4>");
		expect(fixCommonOcrErrors("<n5>")).toBe("<h5>");
		expect(fixCommonOcrErrors("<n6>")).toBe("<h6>");
	});
});
