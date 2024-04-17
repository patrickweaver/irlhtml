/* global Tesseract */

const OCR_TYPES = {
  GOOGLE_VISION: "GOOGLE_VISION",
  ANTHROPIC_CLAUDE: "ANTHROPIC_CLAUDE",
  OPEN_AI_GPT_3: "OPEN_AI_GPT_3",
};

const uploadElement = document.getElementById("upload-button");
const statusElement = document.getElementById("status");
const statusList = document.getElementById("status-list");
let startTime;

// uploadElement.addEventListener("change", async (event) => {
//   startTime = new Date();
//   setStatus("📸 Image Captured");
//   const { type, files } = event.currentTarget;
//   const dataUrl = await getDataURLFromFile(files[0]);
//   console.log(dataUrl);
//   processImage(dataUrl, files[0]);
// });

function setStatus(newStatus) {
  const logTime = new Date();
  console.log({ newStatus });
  if (newStatus) statusElement.style.display = "block";
  else statusElement.style.display = "none";
  statusList.insertAdjacentHTML(
    "afterbegin",
    `<li>${((logTime - startTime) / 1000).toFixed(2)} Sec: ${newStatus}</li>`
  );
}

function tesseractLog(m) {
  console.log(m);
  const newStatus = `🧮 Tesseract: ${m.status} (${Math.round(
    m.progress * 100
  )}%)`;
  setStatus(newStatus);
}

function processImage(data_uri, file) {
  // Tesseract.recognize(data_uri, "eng", { logger: tesseractLog })
  //   .then(({ data: { text } }) => {
  //     setStatus(`🔡 HTML text processed`);
  //     console.log("Text: " + text);
  //     setStatus("📚 parsed text:" + JSON.stringify(text));
  setStatus(`📡 Uploading image`);

  const formData = new FormData();
  // formData.append('source_code', text);
  formData.append("image", file);

  fetch(`/api/new?ocrType=${OCR_TYPES.ANTHROPIC_CLAUDE}`, {
    method: "POST",
    body: formData,
  })
    .then((response) => {
      if (response.status !== 200)
        throw new Error(`Request failure, status: ${response.status}`);
      setStatus(`✅ HTML uploaded successfully`);
      return response.json();
    })
    .then((data) => {
      console.log({ data });
      setStatus(JSON.stringify(data));
      console.log(data.url);
      setStatus(`🔀 Redirecting to: <a href="${data.url}">${data.url}</a>`);
      setTimeout(() => {
        alert(`Redirecting to: ${data.url}`);
        window.location.href = data.url;
      }, 500);
    })
    .catch((error) => {
      console.log("** Error **");
      console.log(error);
      setStatus("❌ Error: " + error.message);
    });
}

async function getDataURLFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
