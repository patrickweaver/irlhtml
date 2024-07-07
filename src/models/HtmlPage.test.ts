import { describe, expect, test } from "@jest/globals";
import { getOne, index } from "./HtmlPage";
import * as page from "../db/page";
import { testData1, testData2 } from "../../tests/util/createPagesData";

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
});
