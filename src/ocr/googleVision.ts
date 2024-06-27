import axios from "axios";
import base64ImageFromFile from "../util/base64ImageFromFile";
const gcpApiUrl = "https://vision.googleapis.com/v1/images:annotate?";
const GCP_API_KEY = process.env.GCP_API_KEY;

export async function getGcpRequestOptions(imagePath: string) {
	const { content } = await base64ImageFromFile(imagePath);
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
	const { url, data } = await getGcpRequestOptions(imageUrl);
	let gvGuess: string = "";
	try {
		const response = await axios.post(url, data);
		gvGuess = response.data.responses?.[0]?.fullTextAnnotation?.text ?? "";
		gvGuess = gvGuess.replaceAll('"', "'");
	} catch (error) {
		console.log(error);
		throw Error("Invalid response from Google Vision");
	}
	if (gvGuess) {
		return { text: gvGuess };
	} else {
		throw Error("No response from Google Vision");
	}
}
