import { describe, expect, test } from "@jest/globals";
import { getOne, getSlug, index, render } from "./HtmlPage";
import * as page from "../db/page";
import {
	testData1,
	testData2,
	testData3,
} from "../../tests/util/createPagesData";

jest.mock("../db/page", () => {
	return {
		getOne: jest.fn(),
		getAll: jest.fn(),
	};
});

const mockedPage = page as jest.Mocked<typeof page>;

describe("HtmlPage", () => {
	beforeEach(() => {
		jest.resetAllMocks();
	});

	describe("getOne", () => {
		test("should render data", async () => {
			mockedPage.getOne.mockResolvedValue(testData2);
			const result = await getOne(testData2.id);
			expect(result).toEqual({
				...testData2,
				date_created: new Date(testData2.date_created),
				date_updated: new Date(testData2.date_updated),
				title: "Test Title",
			});
		});

		test("should return null when no data", async () => {
			mockedPage.getOne.mockResolvedValue(null);
			const result = await getOne(testData2.id);
			expect(result).toEqual(null);
		});
	});

	describe("index", () => {
		test("should render data", async () => {
			mockedPage.getAll.mockResolvedValue([testData2, testData1]);
			const result = await index();
			expect(result[0]).toEqual({
				...testData2,
				date_created: new Date(testData2.date_created),
				date_updated: new Date(testData2.date_updated),
				title: "Test Title",
			});
			expect(result[1]).toEqual({
				...testData1,
				date_created: new Date(testData1.date_created),
				date_updated: new Date(testData1.date_updated),
				title: "",
			});
		});
	});

	describe("getSlug", () => {
		test("should return slug from title", async () => {
			mockedPage.getOne.mockResolvedValueOnce(null);
			const result = await getSlug("abc-123", "Test Title");
			expect(result).toEqual("test");
		});

		test("should return slug from title when first word matches another slug", async () => {
			mockedPage.getOne.mockResolvedValueOnce(testData3);
			const result = await getSlug("abc-123", "Test Title");
			expect(result).toEqual("test-title");
		});

		test("should return slug from id when all title candidates match another slug", async () => {
			mockedPage.getOne.mockResolvedValueOnce(testData3);
			mockedPage.getOne.mockResolvedValueOnce(testData2);
			const result = await getSlug("abcd-1234", "Test Title");
			expect(result).toEqual("abcd");
			expect(mockedPage.getOne).toHaveBeenNthCalledWith(1, {
				idOrSlug: "test",
			});
			expect(mockedPage.getOne).toHaveBeenNthCalledWith(2, {
				idOrSlug: "test-title",
			});
			expect(mockedPage.getOne).toHaveBeenNthCalledWith(3, {
				idOrSlug: "abcd",
			});
			expect(mockedPage.getOne).toHaveBeenCalledTimes(3);
		});

		test("should return slug from id when title is null", async () => {
			mockedPage.getOne.mockResolvedValueOnce(null);
			const result = await getSlug("abcd-1234", null);
			expect(result).toEqual("abcd");
		});

		test("should return longer slug from id when beginning of id matches another slug", async () => {
			mockedPage.getOne.mockResolvedValueOnce({
				...testData1,
				slug: "abcd",
			});
			mockedPage.getOne.mockResolvedValueOnce({
				...testData1,
				slug: "abcde",
			});
			mockedPage.getOne.mockResolvedValueOnce(null);
			const result = await getSlug("abcdef-123456", null);
			expect(result).toEqual("abcdef");
		});

		test("should return slug not ending in -", async () => {
			mockedPage.getOne.mockResolvedValueOnce(null);
			const result = await getSlug("abc-123", null);
			expect(result).toEqual("abc-1");
		});
	});

	describe("render", () => {
		test("should render with title", () => {
			const result = render(testData2);
			expect(result.title).toBe("Test Title");
		});

		test("should render without author when no author", () => {
			const result = render({ ...testData1, author: null });
			expect(result.author).toBe(null);
		});
	});
});
