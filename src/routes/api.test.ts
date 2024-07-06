import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../app";
import DATABASE_PATH from "../db/dbPath";
import sqlite3 from "sqlite3";
import callback from "../db/callback";
import { v4 as uuidv4 } from "uuid";
import { HtmlPageDb } from "../types/HtmlPage";
import { createWorker } from "tesseract.js";

const db = new (sqlite3.verbose().Database)(DATABASE_PATH, callback);
jest.mock("tesseract.js", () => ({ createWorker: jest.fn() }));

const mockedOcrResult = "Mocked OCR result";
const mockedCreateWorker = createWorker as jest.Mock;

describe("Test api routes", () => {
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

	describe("POST new", () => {
		test("should 400 without ocrType", async () => {
			const response = await request(app)
				.post("/api/new")
				.attach("html-image", "tests/test-image-files/test.jpeg");
			expect(response.statusCode).toEqual(400);
		});

		test("should 400 with invalid ocrType", async () => {
			const response = await request(app)
				.post("/api/new")
				.query({ ocrType: "MAGIC" })
				.attach("html-image", "tests/test-image-files/test.jpeg");
			expect(response.statusCode).toEqual(400);
		});

		test("should successfully OCR image and upload new page", async () => {
			const response = await request(app)
				.post("/api/new")
				.query({ ocrType: "TESSERACT" })
				.attach("html-image", "tests/test-image-files/test.jpeg");
			expect(response.statusCode).toEqual(200);
			expect(response.body.source_code).toEqual(
				`<!-- Image OCRed with Tesseract, https://tesseract-ocr.github.io/ -->\n${mockedOcrResult}`,
			);
		});
	});

	describe("GET pages", () => {
		test("It should return pages index with title for pages", async () => {
			const testData: HtmlPageDb = {
				id: uuidv4(),
				source_code: "<h1>Test</h1>",
				date_created: new Date().toISOString(),
				date_updated: new Date().toISOString(),
			};
			const testData2: HtmlPageDb = {
				id: uuidv4(),
				source_code: `
        <html>
          <head><title>Test Title</title></head>
          <body><h1>Test Again</h1></body>
        </html>
      `,
				date_created: new Date().toISOString(),
				date_updated: new Date().toISOString(),
			};
			db.run(`
        INSERT INTO Pages (
          id,
          source_code,
          date_created,
          date_updated
        ) VALUES (
          "${testData.id}",
          "${testData.source_code}",
          "${testData.date_created}",
          "${testData.date_updated}"
        ), (
          "${testData2.id}",
          "${testData2.source_code}",
          "${testData2.date_created}",
          "${testData2.date_updated}"
        )
        ;
      `);

			const response = await request(app).get("/api/pages");
			expect(response.statusCode).toEqual(200);
			expect(response.body[0]).toStrictEqual({ ...testData, title: "" });
			expect(response.body[1]).toStrictEqual({
				...testData2,
				title: "Test Title",
			});
		});
	});

	describe("GET pages/:id", () => {
		test("should 404 for invalid id", async () => {
			const response = await request(app).get(`/api/pages/abcd-invalid`);
			expect(response.statusCode).toEqual(404);
			expect(response.body.error).toEqual("Page not found");
		});

		test("It should return page with title for page", async () => {
			const testData: HtmlPageDb = {
				id: uuidv4(),
				source_code: `
        <html>
          <head><title>Test Title</title></head>
          <body><h1>Test Again</h1></body>
        </html>
      `,
				date_created: new Date().toISOString(),
				date_updated: new Date().toISOString(),
			};
			db.run(`
        INSERT INTO Pages (
          id,
          source_code,
          date_created,
          date_updated
        ) VALUES (
          "${testData.id}",
          "${testData.source_code}",
          "${testData.date_created}",
          "${testData.date_updated}"
        )
        ;
      `);

			const response = await request(app).get(`/api/pages/${testData.id}`);
			expect(response.statusCode).toEqual(200);
			expect(response.body).toStrictEqual({ ...testData, title: "Test Title" });
		});
	});

	describe("DELETE pages/:id", () => {
		test("should 401 for invalid secret", async () => {
			const testData: HtmlPageDb = {
				id: uuidv4(),
				source_code: `
        <html>
          <head><title>Test Title</title></head>
          <body><h1>Test Again</h1></body>
        </html>
      `,
				date_created: new Date().toISOString(),
				date_updated: new Date().toISOString(),
			};
			db.run(`
        INSERT INTO Pages (
          id,
          source_code,
          date_created,
          date_updated
        ) VALUES (
          "${testData.id}",
          "${testData.source_code}",
          "${testData.date_created}",
          "${testData.date_updated}"
        )
        ;
      `);
			const response = await request(app).delete(`/api/pages/${testData.id}`);
			expect(response.statusCode).toEqual(401);
			expect(response.body.error).toEqual("Invalid secret");
		});

		test("It should successfully delete page", async () => {
			const testData: HtmlPageDb = {
				id: uuidv4(),
				source_code: `
        <html>
          <head><title>Test Title</title></head>
          <body><h1>Test Again</h1></body>
        </html>
      `,
				date_created: new Date().toISOString(),
				date_updated: new Date().toISOString(),
			};
			db.run(`
        INSERT INTO Pages (
          id,
          source_code,
          date_created,
          date_updated
        ) VALUES (
          "${testData.id}",
          "${testData.source_code}",
          "${testData.date_created}",
          "${testData.date_updated}"
        )
        ;
      `);

			const response = await request(app)
				.delete(`/api/pages/${testData.id}`)
				.query({ secret: "secret-admin-token" });
			expect(response.statusCode).toEqual(200);
			expect(response.body.status).toEqual("deleted");
		});
	});
});
