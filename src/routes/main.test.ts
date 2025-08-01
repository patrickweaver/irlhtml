import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../app";
import DATABASE_PATH from "../db/dbPath";
import sqlite3 from "sqlite3";
import callback from "../db/callback";
import { createWorker } from "tesseract.js";
import {
	testData1,
	testData2,
	createPagesData,
} from "../../tests/util/createPagesData";
import * as HTMLPage from "../models/HtmlPage";
import * as page from "../db/page";
import { clearPagesData } from "../../tests/util/clearPagesData";
import setup from "../db/setup";
import { run } from "../db";

const db = new (sqlite3.verbose().Database)(DATABASE_PATH, callback);

jest.mock("tesseract.js", () => ({ createWorker: jest.fn() }));
const mockedOcrResult = "Mocked OCR result";
const mockedCreateWorker = createWorker as jest.Mock;

describe("Rendered view routes", () => {
	let mockWorker: any;

	beforeAll(async () => {
		await setup(run);
	});

	afterEach(() => {
		jest.clearAllMocks();

		mockWorker = {
			recognize: jest
				.fn()
				.mockResolvedValue({ data: { text: mockedOcrResult } }),
			terminate: jest.fn().mockResolvedValue(undefined),
		};

		mockedCreateWorker.mockResolvedValue(mockWorker);
	});

	describe("GET /", () => {
		afterEach(async () => {
			await clearPagesData(db);
		});

		test("renders successfully", async () => {
			await createPagesData(db, testData1);
			await createPagesData(db, testData2);
			const response = await request(app).get("/");
			expect(response.statusCode).toEqual(200);
			expect(response.text).toContain("<title>IRL HTML: Home</title>");
			expect(response.text).toContain("<h2>About IRL HTML</h2>");
			expect(response.text).toContain('<h2 id="pages-heading">Pages</h2>');
			expect(response.text).toContain(`Untitled - ${testData1.id.slice(0, 4)}`);
			expect(response.text).toContain("Test Title");
		});

		test("renders 500 error when thrown", async () => {
			const indexSpy = jest
				.spyOn(HTMLPage, "index")
				.mockRejectedValue(new Error("DB error"));
			const response = await request(app).get("/");
			expect(response.statusCode).toEqual(500);
			indexSpy.mockRestore();
		});
	});

	describe("/", () => {
		afterEach(async () => {
			await clearPagesData(db);
		});

		test("redirects to index", async () => {
			await request(app).get("/pages").expect(302).expect("Location", "/");
		});
	});

	describe("GET /pages/:id", () => {
		afterEach(async () => {
			await clearPagesData(db);
		});

		test("renders 500 error when thrown", async () => {
			await createPagesData(db, testData2);
			const getOneSpy = jest
				.spyOn(HTMLPage, "getOne")
				.mockRejectedValue(new Error("DB error"));
			const response = await request(app).get(`/pages/${testData2.id}`);
			expect(response.statusCode).toEqual(500);
			expect(response.text).toContain("There was an error getting that page");
			expect(response.text).toContain(`<p>Page requested: ${testData2.id}</p>`);
			getOneSpy.mockRestore();
		});

		test("renders 404 error when invalid page id", async () => {
			const response = await request(app).get(`/pages/${testData2.id}`);
			expect(response.statusCode).toEqual(404);
			expect(response.text).toContain("<h2>404 Error</h2>");
			expect(response.text).toContain(`id (${testData2.id}) does not exist.`);
		});

		test("renders successfully for correct page by id", async () => {
			await createPagesData(db, testData1);
			await createPagesData(db, testData2);
			const response = await request(app).get(`/pages/${testData2.id}`);
			expect(response.statusCode).toEqual(200);
			expect(response.text).toContain("<title>Test Title</title>");
			expect(response.text).toContain("<body><h1>Test Again</h1></body>");
		});

		test("renders successfully for correct page by slug", async () => {
			await createPagesData(db, testData1);
			await createPagesData(db, testData2);
			const response = await request(app).get(`/pages/${testData2.slug}`);
			expect(response.statusCode).toEqual(200);
			expect(response.text).toContain("<title>Test Title</title>");
			expect(response.text).toContain("<body><h1>Test Again</h1></body>");
		});
	});

	describe("GET /new", () => {
		afterEach(async () => {
			await clearPagesData(db);
		});

		test("renders successfully", async () => {
			await createPagesData(db, testData1);
			await createPagesData(db, testData2);
			const response = await request(app).get("/new");
			expect(response.statusCode).toEqual(200);
			expect(response.text).toContain("<title>IRL HTML: New Page</title>");
			expect(response.text).toContain("<h2>New Page</h2>");
			expect(response.text).toContain("<legend>Select OCR method:</legend>");
			expect(response.text).toContain(
				'<button type="submit" class="submit-button"  >',
			);
			expect(response.text).toContain(
				'<span aria-hidden="true">❇️ </span>Submit<span aria-hidden="true"> ❇️</span>',
			);
		});

		test("redirects to /new", async () => {
			await request(app)
				.get("/pages/new")
				.expect(302)
				.expect("Location", "/new");
		});
	});

	describe("POST /new", () => {
		afterEach(async () => {
			await clearPagesData(db);
		});

		test("should 400 without ocr-method", async () => {
			const response = await request(app)
				.post("/new")
				.attach("html-image", "tests/test-image-files/test.jpeg");
			expect(response.statusCode).toEqual(400);
		});

		test("should 400 with invalid ocr-method", async () => {
			const response = await request(app)
				.post("/new")
				.field("ocr-method", "MAGIC")
				.attach("html-image", "tests/test-image-files/test.jpeg");
			expect(response.statusCode).toEqual(400);
		});

		test("renders 500 error when thrown", async () => {
			const insertSpy = jest
				.spyOn(page, "insert")
				.mockRejectedValue(new Error("DB error"));
			const response = await request(app)
				.post("/new")
				.field("ocr-method", "TESSERACT")
				.attach("html-image", "tests/test-image-files/test.jpeg");
			expect(response.statusCode).toEqual(500);
			expect(response.text).toContain("<h2>Error</h2>");
			expect(response.text).toContain(
				"<p>An unexpected error occurred. Please try again.</p>",
			);
			insertSpy.mockRestore();
		});

		test("should successfully OCR image and upload new page", async () => {
			const response = await request(app)
				.post("/new")
				.field("ocr-method", "TESSERACT")
				.attach("html-image", "tests/test-image-files/test.jpeg")
				.redirects(1);
			expect(response.statusCode).toEqual(200);
			expect(response.text).toEqual(
				`<!-- Image OCRed with Tesseract, https://tesseract-ocr.github.io/ -->\n${mockedOcrResult}`,
			);
		});
	});
});
