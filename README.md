# IRL HTML

IRL HTML is an app that hosts HTML pages imported as images, either screenshots or photographs of hand written, or printed HTML. Uploaded HTML images are processed with [Optical Character Recognition](https://help.glitch.com/hc/en-us/articles/16287495688845-What-version-of-Node-can-I-use-and-how-do-I-change-update-upgrade-it) (OCR) and stored in an SQLite Database.

IRL HTML currently supports the following OCR tools:

- Tesseract (local to the server) [tesseract.projectnaptha.com/](https://tesseract.projectnaptha.com/)
- Google Vision API: [cloud.google.com/vision/docs](https://cloud.google.com/vision/docs)
- OpenAI GPT 4: [platform.openai.com/docs/overview](https://platform.openai.com/docs/overview)
- Anthropic Claude: [docs.anthropic.com/en/docs](https://docs.anthropic.com/en/docs)

The LLM based OCR tools (OpenAI and Anthropic) usually generate the most correct HTML code and use a short custom prompt to inform the LLM that the uploaded image is HTML and instructs the LLM to fix any syntax errors.

## Note on Node.js version

This project intentionally uses an outdated version of Node.js (16.x) because it is hosted on Glitch, and that is the newest version supported there.

- [help.glitch.com/hc/en-us/articles/16287495688845-What-version-of-Node-can-I-use-and-how-do-I-change-update-upgrade-it](https://help.glitch.com/hc/en-us/articles/16287495688845-What-version-of-Node-can-I-use-and-how-do-I-change-update-upgrade-it)
