import { describe, expect, test } from "@jest/globals";
import dbPath from "./dbPath";

describe("dbPath", () => {
	test("should use test db path in tests", () => {
		expect(dbPath).toEqual("./.data/test-db.sqlite3");
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

		test("should log in development env", async () => {
			const overrideDbPath = "./.data/test-db-override.sqlite3";
			process.env.DATABASE_PATH = overrideDbPath;
			dbPath = (await import("./dbPath")).default;
			expect(dbPath).toEqual(overrideDbPath);
		});
	});
});
