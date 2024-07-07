import { describe, expect, test } from "@jest/globals";
import { insertQuery, getAllQuery } from "./page";
import { run, all } from "./";
import _sqlite3 from "sqlite3";
import callback from "./callback";

jest.mock("sqlite3", () => {
	const mockRun = jest.fn();
	const mockAll = jest.fn();
	return {
		verbose: jest.fn().mockImplementation(() => ({
			Database: jest.fn().mockImplementation(() => ({
				run: mockRun,
				all: mockAll,
			})),
		})),
	};
});

describe("index", () => {
	let mockRun: jest.Mock;
	let mockAll: jest.Mock;
	beforeEach(() => {
		jest.clearAllMocks();
		const sqlite3 = _sqlite3.verbose();
		const db = new sqlite3.Database("", callback);
		mockRun = db.run as jest.Mock;
		mockAll = db.all as jest.Mock;
	});

	const time = new Date().toISOString();
	const testData1 = {
		id: "abc-123",
		htmlContent: "<h1>Test</h1>",
		created_at: time,
		updated_at: time,
	};
	const insertParams = [testData1];

	test("run query runs successfully", async () => {
		mockRun.mockImplementationOnce((_query, _params, cb) => cb());
		const result = await run(insertQuery, insertParams);
		expect(result).toBe(true);
	});

	test("run query throws error", async () => {
		const error = "test error";
		mockRun.mockImplementationOnce((_query, _params, cb) => cb(error));
		const result = run(insertQuery, insertParams);
		await expect(result).rejects.toEqual(error);
	});

	test("all query runs successfully", async () => {
		mockAll.mockImplementationOnce((_query, _params, cb) =>
			cb(null, [testData1]),
		);
		const result = await all(getAllQuery);
		expect(result).toStrictEqual([testData1]);
	});

	test("run query throws error", async () => {
		const error = "test error";
		mockAll.mockImplementationOnce((_query, _params, cb) => cb(error));
		const result = all(getAllQuery);
		await expect(result).rejects.toEqual(error);
	});
});
