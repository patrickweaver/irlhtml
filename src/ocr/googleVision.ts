import fs from "fs";
import axios from "axios";
const gcpApiUrl = "https://vision.googleapis.com/v1/images:annotate?";
const GCP_API_KEY = process.env.GCP_API_KEY;

function getGcpRequestOptions(imagePath: string) {
	let image = fs.readFileSync(imagePath);
	const content = Buffer.from(image).toString("base64");
	return {
		url: gcpApiUrl + "key=" + GCP_API_KEY,
		data: {
			requests: [
				{
					image: { content },
					features: [{ type: "TEXT_DETECTION" }],
				},
			],
		},
	};
}

export async function googleVisionTextDetection(imageUrl: string) {
	const { url, data } = getGcpRequestOptions(imageUrl);
	let gvGuess: string = "";
	try {
		const response = await axios.post(url, data);
		gvGuess = response.data.responses?.[0]?.fullTextAnnotation?.text ?? "";
		gvGuess = gvGuess.replaceAll('"', "'");
	} catch (error) {
		console.log(error);
		throw Error("Invalid response from Google Vision");
	}
	if (!!gvGuess) {
		return { text: gvGuess };
	} else {
		throw Error("No response from Google Vision");
	}
}
