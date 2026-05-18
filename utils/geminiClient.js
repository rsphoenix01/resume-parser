const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

async function generateStructuredResume(rawText) {
  const prompt = `
Extract structured data from the resume below.

Return ONLY valid JSON. No explanation.

{
  "name": "",
  "email": "",
  "education": {
    "degree": "",
    "branch": "",
    "institution": "",
    "year": ""
  },
  "experience": {
    "job_title": "",
    "company": "",
    "start_date": "",
    "end_date": ""
  },
  "skills": [],
  "summary": ""
}

Resume:
${rawText}
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: prompt
  });

  const text = response.text;

  if (!text) {
    throw new Error("Empty response from Gemini");
  }

  let cleanedText = text.trim();

  const match = cleanedText.match(/```(?:json)?\s*([\s\S]+?)\s*```/);
  if (match) {
    cleanedText = match[1].trim();
  }

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Failed to parse Gemini response:", cleanedText);
    throw new Error("Invalid JSON format from Gemini");
  }
}

module.exports = { generateStructuredResume };