import { describe, expect, test } from "@jest/globals";
import { sanitizeHtml } from "./sanitizeHtml";

describe("sanitizeHtml", () => {
	test("Converts JS to code blocks", () => {
		expect(sanitizeHtml(`<body><script>alert("test")</script></body>`)).toEqual(
			`<body><code style="display: none">alert("test")</code></body>`,
		);
	});

	test("Converts JS to code blocks regardless of case of script tag", () => {
		expect(sanitizeHtml(`<body><sCrIpT>alert("test")</ScRiPt></body>`)).toEqual(
			`<body><code style="display: none">alert("test")</code></body>`,
		);
	});
});
