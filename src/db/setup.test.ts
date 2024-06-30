import { describe, expect, test } from "@jest/globals";
import setup, { successMessage, schema, clearQuery } from "./setup";

describe("setup", () => {
	console.log = jest.fn();
	const mockedRun = jest.fn();

	test("should run setup query without clearing when not set to clear", async () => {
		await setup(mockedRun);
		expect(mockedRun).toHaveBeenCalledTimes(1);
		expect(mockedRun).not.toHaveBeenCalledWith(clearQuery);
		expect(mockedRun).toHaveBeenCalledWith(schema);
		expect(console.log).toHaveBeenCalledWith(successMessage);
	});

	describe("clear set to on", () => {
		beforeAll(() => {
			process.env.CLEAR_ALL_ROWS = "TRUE";
		});
		afterAll(() => {
			process.env.CLEAR_ALL_ROWS = "false";
		});

		test("should run setup query after clearing when set to clear", async () => {
			await setup(mockedRun);
			expect(mockedRun).toHaveBeenCalledTimes(2);
			expect(mockedRun).toHaveBeenCalledWith(clearQuery);
			expect(mockedRun).toHaveBeenCalledWith(schema);
			expect(console.log).toHaveBeenCalledWith(successMessage);
		});
	});

	test("should log error message on error", async () => {
		mockedRun.mockImplementationOnce(() =>
			Promise.reject(new Error("DB error")),
		);
		await setup(mockedRun);
		expect(console.log).toHaveBeenCalledWith("Error: DB error");
	});
});
