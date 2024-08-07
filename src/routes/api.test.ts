import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "../app";
import DATABASE_PATH from "../db/dbPath";
import sqlite3 from "sqlite3";
import callback from "../db/callback";
import { createWorker } from "tesseract.js";
import {
	createPagesData,
	testData1,
	testData2,
} from "../../tests/util/createPagesData";
import * as HTMLPage from "../models/HtmlPage";
import * as page from "../db/page";
import { clearPagesData } from "../../tests/util/clearPagesData";
import setup from "../db/setup";
import { run } from "../db";
import router from "./api";

const db = new (sqlite3.verbose().Database)(DATABASE_PATH, callback);
jest.mock("tesseract.js", () => ({ createWorker: jest.fn() }));
const mockedOcrResult = "Mocked OCR result";
const mockedCreateWorker = createWorker as jest.Mock;

describe("API routes", () => {
	let mockWorker: any;

	beforeAll(async () => {
		await setup(run);
	});

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

	describe("POST new", () => {
		beforeEach(async () => {
			await clearPagesData(db);
		});

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

		test("renders 500 error when thrown", async () => {
			const insertSpy = jest
				.spyOn(page, "insert")
				.mockRejectedValue(new Error("DB error"));
			const routeSpy = jest.spyOn(router, "post");
			const response = await request(app)
				.post("/api/new")
				.query({ ocrType: "TESSERACT" })
				.attach("html-image", "tests/test-image-files/test.jpeg");
			expect(response.statusCode).toEqual(500);
			expect(response.body.error).toEqual("Server error");
			expect(routeSpy).toThrow();
			insertSpy.mockRestore();
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
		beforeEach(async () => {
			await clearPagesData(db);
		});

		test("renders 500 error when thrown", async () => {
			await createPagesData(db, testData1);
			await createPagesData(db, testData2);
			const indexSpy = jest
				.spyOn(HTMLPage, "index")
				.mockRejectedValue(new Error("DB error"));
			const response = await request(app).get("/api/pages");
			expect(response.statusCode).toEqual(500);
			expect(response.body.error).toEqual("Server error");
			indexSpy.mockRestore();
		});

		test("It should return pages index with title for pages", async () => {
			await createPagesData(db, testData1);
			await createPagesData(db, testData2);
			const response = await request(app).get("/api/pages");
			expect(response.statusCode).toEqual(200);
			expect(response.body[0]).toStrictEqual({
				...testData2,
				title: "Test Title",
			});
			expect(response.body[1]).toStrictEqual({ ...testData1, title: "" });
		});
	});

	describe("GET pages/:id", () => {
		beforeEach(async () => {
			await clearPagesData(db);
		});

		test("renders 500 error when thrown", async () => {
			await createPagesData(db, testData2);
			const getOneSpy = jest
				.spyOn(HTMLPage, "getOne")
				.mockRejectedValue(new Error("DB error"));
			const response = await request(app).get(`/api/pages/${testData2.id}`);
			expect(response.statusCode).toEqual(500);
			expect(response.body.error).toEqual("Server error");
			getOneSpy.mockRestore();
		});

		test("should 404 for invalid id", async () => {
			const response = await request(app).get(`/api/pages/abcd-invalid`);
			expect(response.statusCode).toEqual(404);
			expect(response.body.error).toEqual("Page not found");
		});

		test("It should return page with title for page", async () => {
			await createPagesData(db, testData2);
			const response = await request(app).get(`/api/pages/${testData2.id}`);
			expect(response.statusCode).toEqual(200);
			expect(response.body).toStrictEqual({
				...testData2,
				title: "Test Title",
			});
		});
	});

	describe("DELETE pages/:id", () => {
		beforeEach(async () => {
			await clearPagesData(db);
		});

		test("should 401 for invalid secret", async () => {
			await createPagesData(db, testData2);
			const response = await request(app).delete(`/api/pages/${testData2.id}`);
			expect(response.statusCode).toEqual(401);
			expect(response.body.error).toEqual("Invalid secret");
		});

		test("renders 500 error when thrown", async () => {
			const delSpy = jest
				.spyOn(page, "del")
				.mockRejectedValue(new Error("DB error"));
			const response = await request(app)
				.delete(`/api/pages/${testData2.id}`)
				.query({ secret: "secret-admin-token" });
			expect(response.statusCode).toEqual(500);
			expect(response.body.error).toEqual("Server error");
			delSpy.mockRestore();
		});

		test("It should successfully delete page", async () => {
			await createPagesData(db, testData2);
			const response = await request(app)
				.delete(`/api/pages/${testData2.id}`)
				.query({ secret: "secret-admin-token" });
			expect(response.statusCode).toEqual(200);
			expect(response.body.status).toEqual("deleted");
		});
	});
});
