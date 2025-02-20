const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client with the API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates structured resume data from raw text using Gemini API.
 * @param {string} rawText - The raw resume text.
 * @returns {Promise<Object>} - Structured resume data.
 */
async function generateStructuredResume(rawText) {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro-latest' });

  const prompt = `
    Extract the following fields from the resume text and output a valid JSON:
    {
      "name": <name>,
      "email": <email>,
      "education": {
        "degree": <degree>,
        "branch": <branch>,
        "institution": <institution>,
        "year": <year>
      },
      "experience": {
        "job_title": <job_title>,
        "company": <company>,
        "start_date": <start_date>,
        "end_date": <end_date>
      },
      "skills": [<skill1>, <skill2>, ...],
      "summary": <short summary of candidate profile>
    }
    Resume text: "${rawText}"
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  // Remove markdown code fences and extract the first JSON block
  let cleanedText = text.trim();
  const codeBlockRegex = /```(?:json)?\s*([\s\S]+?)\s*```/g;
  const matches = [];
  let match;
  while ((match = codeBlockRegex.exec(cleanedText)) !== null) {
    matches.push(match[1]);
  }
  if (matches.length > 0) {
    // Use the first code block found
    cleanedText = matches[0].trim();
  }
  
  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Failed to parse Gemini response:', cleanedText);
    throw new Error('Invalid JSON format from Gemini');
  }
}

module.exports = { generateStructuredResume };
