jest.useFakeTimers();
import { describe, expect, test } from "@jest/globals";
import {
	insert,
	insertQuery,
	getOne,
	getOneByIdOrSlugQuery,
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
		const slug = "abc";
		const author = "pw";

		test("should successfully run insert query", async () => {
			mockedDb.run.mockResolvedValue(true);

			const result = await insert({ id, htmlContent, slug, author });
			expect(result).toBe(true);
			expect(mockedDb.run).toHaveBeenLastCalledWith(insertQuery, [
				id,
				htmlContent,
				time,
				time,
				slug,
				author,
			]);
		});

		test("should handle error for failed insert query", async () => {
			const error = "Test error";
			mockedDb.run.mockImplementationOnce(() =>
				Promise.reject(new Error(error)),
			);
			const result = insert({ id, htmlContent, slug, author });
			await expect(result).rejects.toThrow(error);
		});
	});

	describe("getOne", () => {
		const id = "abc-123";
		const htmlContent = "<h1>test</h1>";
		const time = new Date().toISOString();
		const slug = "abc";

		test("should successfully run getOne query with id", async () => {
			const mockResponse = [
				{
					id,
					htmlContent,
					created_at: time,
					updated_at: time,
					slug: slug,
					author: null,
				},
			];
			mockedDb.all.mockResolvedValue(mockResponse);
			const result = await getOne({ idOrSlug: id });
			expect(result?.id).toEqual(id);
			expect(result?.slug).toEqual(slug);
			expect(db.all).toHaveBeenLastCalledWith(getOneByIdOrSlugQuery, [id, id]);
		});

		test("should successfully run getOne query with slug", async () => {
			const mockResponse = [
				{
					id,
					htmlContent,
					created_at: time,
					updated_at: time,
					slug: slug,
					author: null,
				},
			];
			mockedDb.all.mockResolvedValue(mockResponse);
			const result = await getOne({ idOrSlug: slug });
			expect(result?.id).toEqual(id);
			expect(result?.slug).toEqual(slug);
			expect(db.all).toHaveBeenLastCalledWith(getOneByIdOrSlugQuery, [
				slug,
				slug,
			]);
		});

		test("should handle error for failed getOne query", async () => {
			const error = "Test error";
			mockedDb.all.mockImplementationOnce(() =>
				Promise.reject(new Error(error)),
			);
			const result = getOne({ idOrSlug: id });
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
			const id = "abc-123";
			mockedDb.all.mockResolvedValueOnce([{ id }]);
			mockedDb.run.mockResolvedValue(true);
			const result = await del({ idOrSlug: id });
			expect(result).toBe(true);
			expect(mockedDb.run).toHaveBeenLastCalledWith(delQuery, [id, id]);
		});

		test("should throw error when does not exist del query", async () => {
			const id = "abc-123";
			mockedDb.all.mockResolvedValueOnce([]);
			await expect(del({ idOrSlug: id })).rejects.toThrow("Not found");
			expect(mockedDb.all).toHaveBeenLastCalledWith(getOneByIdOrSlugQuery, [
				id,
				id,
			]);
			expect(mockedDb.run).not.toHaveBeenCalled();
		});

		test("should handle error for failed del query", async () => {
			const error = "Test error";
			const id = "abc-123";
			mockedDb.all.mockResolvedValueOnce([{ id }]);
			mockedDb.run.mockImplementationOnce(() =>
				Promise.reject(new Error(error)),
			);
			await expect(del({ idOrSlug: id })).rejects.toThrow(error);
		});
	});
});
