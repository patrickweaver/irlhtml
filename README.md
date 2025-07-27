# IRL HTML

IRL HTML is an app that hosts HTML pages imported as images, either screenshots or photographs of hand written, or printed HTML. Uploaded HTML images are processed with [Optical Character Recognition](https://en.wikipedia.org/wiki/Optical_character_recognition) (OCR) and stored in an SQLite Database.

IRL HTML currently supports the following OCR tools:

- Tesseract (local to the server) [tesseract.projectnaptha.com/](https://tesseract.projectnaptha.com/)
- Google Vision API: [cloud.google.com/vision/docs](https://cloud.google.com/vision/docs)
- OpenAI GPT 4: [platform.openai.com/docs/overview](https://platform.openai.com/docs/overview)
- Anthropic Claude: [docs.anthropic.com/en/docs](https://docs.anthropic.com/en/docs)

The multi-modal OCR tools (OpenAI and Anthropic) usually generate the most correct HTML code and use a short custom [prompt](https://github.com/patrickweaver/irlhtml/blob/main/src/util/prompt.ts) to inform the model that the uploaded image is HTML and instructs the model to fix any syntax errors.

## Running locally

- `cp .env.example .env`
- Update `.env` with listed variables
- `npm i`
- `npm run dev`

App should be running on port 3000

## Running in production

- Set up all environment variables in `.env.example` in your environment
- `npm i`
- `npm start`

## Note on Node.js version

This project intentionally uses some outdated dependencies because it previously used Node.js (16.x) because it was hosted on Glitch, and that was the newest version supported there.

- [help.glitch.com/hc/en-us/articles/16287495688845-What-version-of-Node-can-I-use-and-how-do-I-change-update-upgrade-it](https://web.archive.org/web/20250122090700/https://help.glitch.com/hc/en-us/articles/16287495688845-What-version-of-Node-can-I-use-and-how-do-I-change-update-upgrade-it)
