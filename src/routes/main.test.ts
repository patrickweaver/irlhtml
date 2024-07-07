import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import { Express } from "express";
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

const db = new (sqlite3.verbose().Database)(DATABASE_PATH, callback);

jest.mock("tesseract.js", () => ({ createWorker: jest.fn() }));
const mockedOcrResult = "Mocked OCR result";
const mockedCreateWorker = createWorker as jest.Mock;

describe("Rendered view routes", () => {
	let mockWorker: any;

	beforeEach(() => {
		jest.clearAllMocks();

		mockWorker = {
			recognize: jest
				.fn()
				.mockResolvedValue({ data: { text: mockedOcrResult } }),
			terminate: jest.fn().mockResolvedValue(undefined),
		};

		mockedCreateWorker.mockResolvedValue(mockWorker);
	});

	afterEach(() => {
		db.run("DELETE FROM Pages;");
	});

	describe("GET /", () => {
		test("renders 500 error when thrown", async () => {
			const indexSpy = jest
				.spyOn(HTMLPage, "index")
				.mockRejectedValue(new Error("DB error"));
			const response = await request(app).get("/");
			expect(response.statusCode).toEqual(500);
			indexSpy.mockRestore();
		});

		test("renders successfully", async () => {
			await createPagesData(db, testData1);
			await createPagesData(db, testData2);
			const response = await request(app).get("/");
			expect(response.statusCode).toEqual(200);
			expect(response.text).toContain("<title>IRL HTML: Home</title>");
			expect(response.text).toContain("<h2>About IRL HTML</h2>");
			expect(response.text).toContain("<h2>Pages</h2>");
			expect(response.text).toContain(`Untitled - ${testData1.id.slice(0, 5)}`);
			expect(response.text).toContain("Test Title");
		});
	});

	describe("/", () => {
		test("redirects to index", async () => {
			await request(app).get("/pages").expect(302).expect("Location", "/");
		});
	});

	describe("GET /pages/:id", () => {
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

		test("renders successfully for correct page", async () => {
			await createPagesData(db, testData1);
			await createPagesData(db, testData2);
			const response = await request(app).get(`/pages/${testData2.id}`);
			expect(response.statusCode).toEqual(200);
			expect(response.text).toContain("<title>Test Title</title>");
			expect(response.text).toContain("<body><h1>Test Again</h1></body>");
		});
	});

	describe("GET /new", () => {
		test("renders successfully", async () => {
			await createPagesData(db, testData1);
			await createPagesData(db, testData2);
			const response = await request(app).get("/new");
			expect(response.statusCode).toEqual(200);
			expect(response.text).toContain("<title>IRL HTML: New Page</title>");
			expect(response.text).toContain("<h2>New Page</h2>");
			expect(response.text).toContain("<legend>Select OCR method:</legend>");
			expect(response.text).toContain('<button type="submit">Submit</button>');
		});
	});

	describe("POST /new", () => {
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

	describe("GET /set-secret", () => {
		test("should not allow setting secret by default", async () => {
			const response = await request(app).get("/set-secret");
			expect(response.statusCode).toEqual(200);
			expect(response.text).toContain("<h1>Setting Secret Disabled</h1>");
		});

		describe("With mocked process.env", () => {
			const originalEnv = process.env;
			let app: Express;

			beforeEach(() => {
				jest.resetModules();
				process.env = { ...originalEnv };
				require("../../.jest/setEnvVars");
			});

			afterEach(() => {
				process.env = originalEnv;
			});

			test("should allow setting secret when enabled", async () => {
				process.env.ALLOW_SET_SECRET = "TRUE";
				app = (await import("../app")).default;
				const response = await request(app).get("/set-secret");
				expect(response.statusCode).toEqual(200);
				expect(response.text).toContain("localStorage.setItem('secret'");
				delete process.env.SET_SECRET;
			});
		});
	});
});
