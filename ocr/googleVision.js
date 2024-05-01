const fs = require("fs");
const vision = require("@google-cloud/vision").v1p3beta1;
const axios = require("axios");
const gcpApiUrl = "https://vision.googleapis.com/v1/images:annotate?";
const GCP_API_KEY = process.env.GCP_API_KEY;

function getGcpRequestOptions(imagePath) {
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

async function askGoogleVision(imageUrl) {
  return new Promise(async function (resolve, reject) {
    const { url, data } = getGcpRequestOptions(imageUrl);
    let gvGuess;
    try {
      const response = await axios.post(url, data);
      gvGuess = response.data.responses?.[0]?.fullTextAnnotation?.text;
      gvGuess = gvGuess.replaceAll('"', "'");
      gvGuess = gvGuess ?? "";
    } catch (error) {
      console.log(error);
    }
    if (gvGuess) {
      resolve({ text: gvGuess });
    } else {
      reject(Error("No response from Google Vision"));
    }
  });
}

module.exports = {
  googleVisionTextDetection: askGoogleVision,
};
