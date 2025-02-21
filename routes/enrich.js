const express = require('express');
const axios = require('axios');
const pdfParse = require('pdf-parse');
const verifyJWT = require('../middleware/verifyJWT');
const Applicant = require('../models/Applicant');
const { encrypt, decrypt } = require('../utils/encryption');
const { generateStructuredResume } = require('../utils/geminiClient');
// Instead of: const fetch = require('node-fetch');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
 // Make sure to install this: npm install node-fetch

const router = express.Router();

// POST /api/enrich
router.post('/', verifyJWT, async (req, res, next) => {
  const { url } = req.body; // Expecting a URL pointing to a PDF file

  // Validate that a URL is provided and has a proper HTTP/HTTPS scheme.
  if (!url || typeof url !== 'string' || (!url.startsWith("http://") && !url.startsWith("https://"))) {
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  try {
    // Fetch the PDF from the URL
    const response = await fetch(url);

    // Check if the fetched file is a PDF by verifying the Content-Type header.
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('pdf')) {
      return res.status(500).json({ error: 'The file is not a valid PDF.' });
    }

    // Check for a Content-Length header and enforce a size limit (e.g., 5MB)
    const contentLengthStr = response.headers.get('content-length');
    if (contentLengthStr) {
      const contentLength = parseInt(contentLengthStr, 10);
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (contentLength > maxSize) {
        return res.status(500).json({ error: 'The PDF file is too large. Maximum allowed size is 5MB.' });
      }
    }

    // Extract text from the PDF using pdf-parse.
    const buffer = await response.buffer();
    const data = await pdfParse(buffer);
    const rawText = data.text.trim();

    // If no text is extracted, return an error.
    if (!rawText) {
      return res.status(500).json({ error: 'No text data detected in the PDF.' });
    }

    // Pass the extracted text to the LLM (Gemini) API to get structured resume data.
    const extractedData = await generateStructuredResume(rawText);
    if (!extractedData || Object.keys(extractedData).length === 0) {
      return res.status(404).json({ error: 'No data extracted from the resume text.' });
    }

    // Encrypt sensitive fields (name, email) before saving.
    if (extractedData.name) extractedData.name = encrypt(extractedData.name);
    if (extractedData.email) extractedData.email = encrypt(extractedData.email);

    // Create a new Applicant document and save it to MongoDB.
    const newApplicant = new Applicant(extractedData);
    await newApplicant.save();

    // Decrypt sensitive fields before returning the response.
    const responseData = { ...extractedData };
    responseData.name = decrypt(responseData.name);
    responseData.email = decrypt(responseData.email);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error during resume enrichment:', error.message);
    next({ status: 500, message: 'Failed to process PDF' });
  }
});

module.exports = router;

