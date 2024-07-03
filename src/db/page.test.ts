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

describe("page", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});
	describe("insert", () => {
		const id = "abc-123";
		const htmlContent = "<h1>test</h1";
		const time = new Date().toISOString();

		test("should successfully run insert query", async () => {
			mockedDb.run.mockResolvedValue(true);

			const result = await insert({ id, htmlContent });
			expect(result).toBe(true);
			expect(mockedDb.run).toHaveBeenLastCalledWith(insertQuery, [
				id,
				htmlContent,
				time,
				time,
			]);
		});

		test("should handle error for failed insert query", async () => {
			const error = "Test error";
			mockedDb.run.mockImplementationOnce(() =>
				Promise.reject(new Error(error)),
			);
			const result = insert({ id, htmlContent });
			await expect(result).rejects.toThrow(error);
		});
	});

	describe("getOne", () => {
		const id = "abc-123";
		const htmlContent = "<h1>test</h1>";
		const time = new Date().toISOString();

		test("should successfully run getOne query", async () => {
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

		test("should handle error for failed getOne query", async () => {
			const error = "Test error";
			mockedDb.all.mockImplementationOnce(() =>
				Promise.reject(new Error(error)),
			);
			const result = getOne({ id });
			await expect(result).rejects.toThrow(error);
		});
	});

	describe("getAll", () => {
		const id = "abc-123";
		const htmlContent = "<h1>test</h1>";
		const time = new Date().toISOString();
		const id2 = "def-456";
		const htmlContent2 = "<h2>test 2</h2>";

		test("should successfully run getAll query", async () => {
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

		test("should handle error for failed getOne query", async () => {
			const error = "Test error";
			mockedDb.all.mockImplementationOnce(() =>
				Promise.reject(new Error(error)),
			);
			const result = getAll();
			await expect(result).rejects.toThrow(error);
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

		test("should handle error for failed del query", async () => {
			const error = "Test error";
			mockedDb.run.mockImplementationOnce(() =>
				Promise.reject(new Error(error)),
			);
			const id = "abc-123";
			await expect(del({ id })).rejects.toThrow(error);
		});
	});
});
