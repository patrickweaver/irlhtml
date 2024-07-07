import { describe, expect, test } from "@jest/globals";
import request from "supertest";
import app from "./app";

describe("Test public routes", () => {
	test("It should return style.css", async () => {
		const response = await request(app).get("/style.css");
		expect(response.statusCode).toEqual(200);
	});

	test("It should return icon.png", async () => {
		const response = await request(app).get("/icon.png");
		expect(response.statusCode).toEqual(200);
	});
});
