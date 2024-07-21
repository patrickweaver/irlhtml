import { describe, expect, test } from "@jest/globals";
import callback, { successMessage } from "./callback";
import * as Log from "../util/log";

describe("callback", () => {
	const logSpy = jest.spyOn(Log, "log");
	test("Should log success message", () => {
		callback(undefined);
		expect(logSpy).toHaveBeenCalledWith(successMessage);
		expect(logSpy).toHaveBeenCalledTimes(1);
	});

	test("Should log error message", () => {
		const errorMessage = "Test error";
		callback(new Error(errorMessage));
		expect(logSpy).toHaveBeenCalledWith(`Error: ${errorMessage}`);
		expect(logSpy).toHaveBeenCalledTimes(1);
	});
});
