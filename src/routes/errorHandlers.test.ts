import { describe, expect, test } from "@jest/globals";
import { apiErrorHandler, error404, errorHandler } from "./errorHandlers";
import { Request, Response } from "express";
import { defaultRenderObj as _r } from "../util/constants";

const log = jest.spyOn(console, "log").mockImplementation(() => {});

describe("apiErrorHandler", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		mockRequest = {
			url: "/api/test-url",
		};
		mockResponse = {
			status: jest.fn().mockReturnThis(),
			json: jest.fn(),
		};
	});

	test("should send API error response and only log in dev environment", () => {
		const errorMessage = "Test error";
		const status = 400;

		apiErrorHandler(
			mockRequest as Request,
			mockResponse as Response,
			errorMessage,
			status,
		);
		expect(log).not.toHaveBeenCalled();
		expect(mockResponse.status).toHaveBeenCalledWith(status);
		expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
	});

	test("should send generic error message for server errors", () => {
		const errorMessage = "Test error";
		const status = 500;

		apiErrorHandler(
			mockRequest as Request,
			mockResponse as Response,
			errorMessage,
			status,
		);
		expect(log).not.toHaveBeenCalled();
		expect(mockResponse.status).toHaveBeenCalledWith(status);
		expect(mockResponse.json).toHaveBeenCalledWith({ error: "Server error" });
	});

	describe("With mocked process.env", () => {
		const originalEnv = process.env;

		beforeEach(() => {
			jest.resetModules();
			process.env = { ...originalEnv };
			require("../../.jest/setEnvVars");
		});

		afterEach(() => {
			process.env = originalEnv;
		});

		test("should log in development env", () => {
			process.env.NODE_ENV = "development";
			const errorMessage = "Test error";
			const status = 400;

			apiErrorHandler(
				mockRequest as Request,
				mockResponse as Response,
				errorMessage,
				status,
			);
			expect(log).toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(status);
			expect(mockResponse.json).toHaveBeenCalledWith({ error: errorMessage });
		});
	});
});

describe("errorHandler", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		mockRequest = {
			url: "/test-url",
		};
		mockResponse = {
			status: jest.fn().mockReturnThis(),
			render: jest.fn(),
		};
	});

	test("should only log in dev environment", () => {
		const errorMessage = "Test error";
		const status = 400;

		errorHandler(
			mockRequest as Request,
			mockResponse as Response,
			errorMessage,
			status,
			{ test: "test-param" },
		);
		expect(log).not.toHaveBeenCalled();
		expect(mockResponse.status).toHaveBeenCalledWith(status);
		expect(mockResponse.render).toHaveBeenCalledWith("pages/error", {
			test: "test-param",
		});
	});

	describe("With mocked process.env", () => {
		const originalEnv = process.env;

		beforeEach(() => {
			jest.resetModules();
			process.env = { ...originalEnv };
			require("../../.jest/setEnvVars");
		});

		afterEach(() => {
			process.env = originalEnv;
		});

		test("should log in development env", () => {
			process.env.NODE_ENV = "development";
			const errorMessage = "Test error";
			const status = 400;

			errorHandler(
				mockRequest as Request,
				mockResponse as Response,
				errorMessage,
				status,
				{ test: "test-param" },
			);
			expect(log).toHaveBeenCalled();
			expect(mockResponse.status).toHaveBeenCalledWith(status);
			expect(mockResponse.render).toHaveBeenCalledWith("pages/error", {
				test: "test-param",
			});
		});
	});
});

describe("error404", () => {
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		mockRequest = {};
		mockResponse = {
			status: jest.fn().mockReturnThis(),
			render: jest.fn(),
		};
	});

	test("should send rendered error response and only log in dev environment", () => {
		const status = 404;

		error404(mockRequest as Request, mockResponse as Response, "abc-123");
		expect(mockResponse.status).toHaveBeenCalledWith(status);
		expect(mockResponse.render).toHaveBeenCalledWith("pages/error404", {
			..._r,
			id: "abc-123",
		});
	});
});
