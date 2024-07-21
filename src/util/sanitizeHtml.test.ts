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

	test("Converts JS to code blocks regardless of spacing in script tag", () => {
		expect(
			sanitizeHtml(`<body><script data="test">alert("test")</script ></body>`),
		).toEqual(
			`<body><code style="display: none" data="test">alert("test")</code ></body>`,
		);
	});

	test("Converts event handlers to data attributes", () => {
		expect(
			sanitizeHtml(
				`<body><button onClick="alert('test')">Click Me</button></body>`,
			),
		).toEqual(
			`<body><button data-sanitized="alert('test')">Click Me</button></body>`,
		);
	});
});
