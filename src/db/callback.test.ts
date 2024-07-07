import { describe, expect, test } from "@jest/globals";
import callback, { successMessage } from "./callback";

describe("callback", () => {
	console.log = jest.fn();

	test("Should log success message", () => {
		callback(undefined);
		expect(console.log).toHaveBeenCalledWith(successMessage);
		expect(console.log).toHaveBeenCalledTimes(1);
	});

	test("Should log error message", () => {
		const errorMessage = "Test error";
		callback(new Error(errorMessage));
		expect(console.log).toHaveBeenCalledWith(`Error: ${errorMessage}`);
		expect(console.log).toHaveBeenCalledTimes(1);
	});
});
