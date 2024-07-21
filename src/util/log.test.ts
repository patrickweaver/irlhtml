import { describe, expect, test } from "@jest/globals";
import { log } from "./log";

describe("base64ImageFromFile", () => {
	console.log = jest.fn();

	test("No logs in NOT debug", async () => {
		log("1");
		expect(console.log).toHaveBeenCalledTimes(0);
	});

	describe("With mocked process.env", () => {
		const originalEnv = process.env;
		let dbPath;

		beforeEach(() => {
			jest.resetModules();
			process.env = { ...originalEnv };
			require("../../.jest/setEnvVars");
		});

		afterEach(() => {
			process.env = originalEnv;
		});

		test("should log in when debug = TRUE", async () => {
			process.env.DEBUG = "TRUE";
			log("1");
			expect(console.log).toHaveBeenLastCalledWith("1");
			expect(console.log).toHaveBeenCalledTimes(1);
		});

		test("should log multiple items when debug = TRUE", async () => {
			process.env.DEBUG = "TRUE";
			log("1", "2");
			expect(console.log).toHaveBeenLastCalledWith("1", "2");
			expect(console.log).toHaveBeenCalledTimes(1);
		});
	});
});
