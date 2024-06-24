import fs from "fs";
import FileType from "file-type";
import core from "file-type/core";

async function base64ImageFromFile(
	filePath: string,
): Promise<{ content: string; mimeType: core.MimeType }> {
	const image = fs.readFileSync(filePath);
	const buffer = Buffer.from(image);
	const content = buffer.toString("base64");
	const fileType = await FileType.fromBuffer(buffer);
	const mimeType = fileType?.mime;
	if (mimeType === undefined) throw new Error("Invalid mimeType");
	return { content, mimeType };
}

export default base64ImageFromFile;
