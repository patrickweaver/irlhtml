jest.useFakeTimers();
import { describe, expect, test } from "@jest/globals";
import {
	insert,
	insertQuery,
	getOne,
	getOneQuery,
	getAllQuery,
	getAll,
	del,
	delQuery,
} from "./page";
import * as db from "./";

jest.mock("./", () => {
	return {
		run: jest.fn(),
		all: jest.fn(),
	};
});

const mockedDb = db as jest.Mocked<typeof db>;

describe("insert", () => {
	test("should successfully run insert query", async () => {
		mockedDb.run.mockResolvedValue(true);
		const id = "abc-123";
		const htmlContent = "<h1>test</h1";
		const time = new Date().toISOString();
		const result = await insert({ id, htmlContent });
		expect(result).toBe(true);
		expect(mockedDb.run).toHaveBeenLastCalledWith(insertQuery, [
			id,
			htmlContent,
			time,
			time,
		]);
	});
});

describe("getOne", () => {
	test("should successfully run getOne query", async () => {
		const id = "abc-123";
		const htmlContent = "<h1>test</h1>";
		const time = new Date().toISOString();
		const mockResponse = [
			{
				id,
				htmlContent,
				created_at: time,
				updated_at: time,
			},
		];
		mockedDb.all.mockResolvedValue(mockResponse);
		const result = await getOne({ id });
		expect(result?.id).toEqual(id);
		expect(db.all).toHaveBeenLastCalledWith(getOneQuery, [id]);
	});
});

describe("getAll", () => {
	test("should successfully run getAll query", async () => {
		const id = "abc-123";
		const htmlContent = "<h1>test</h1>";
		const time = new Date().toISOString();
		const id2 = "def-456";
		const htmlContent2 = "<h2>test 2</h2>";
		const mockResponse = [
			{
				id,
				htmlContent,
				created_at: time,
				updated_at: time,
			},
			{
				id: id2,
				htmlContent: htmlContent2,
				created_at: time,
				updated_at: time,
			},
		];
		mockedDb.all.mockResolvedValue(mockResponse);
		const result = await getAll();
		expect(result?.[0]?.id).toEqual(id);
		expect(result?.[1]?.id).toEqual(id2);
		expect(db.all).toHaveBeenLastCalledWith(getAllQuery);
	});
});

describe("del", () => {
	test("should successfully run del query", async () => {
		mockedDb.run.mockResolvedValue(true);
		const id = "abc-123";
		const result = await del({ id });
		expect(result).toBe(true);
		expect(mockedDb.run).toHaveBeenLastCalledWith(delQuery, [id]);
	});
});
