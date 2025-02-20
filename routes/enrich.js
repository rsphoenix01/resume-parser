const express = require('express');
const verifyJWT = require('../middleware/verifyJWT');
const Applicant = require('../models/Applicant');
const { encrypt, decrypt } = require('../utils/encryption');
const { generateStructuredResume } = require('../utils/geminiClient');

const router = express.Router();

// POST /api/enrich
router.post('/', verifyJWT, async (req, res, next) => {
  const { raw_text } = req.body;

  if (!raw_text || raw_text.trim() === '') {
    return res.status(404).json({ error: 'No data detected in raw text' });
  }

  try {
    //  Call Gemini API for structured resume extraction
    const extractedData = await generateStructuredResume(raw_text);

    if (!extractedData || Object.keys(extractedData).length === 0) {
      return res.status(404).json({ error: 'No data extracted from raw text' });
    }

    //  Encrypt sensitive fields
    if (extractedData.name) extractedData.name = encrypt(extractedData.name);
    if (extractedData.email) extractedData.email = encrypt(extractedData.email);

    //  Save to MongoDB
    const newApplicant = new Applicant(extractedData);
    await newApplicant.save();

    //  Decrypt before sending back
    const responseData = { ...extractedData };
    responseData.name = decrypt(responseData.name);
    responseData.email = decrypt(responseData.email);

    return res.status(200).json(responseData);
  } catch (error) {
    console.error('Error during resume enrichment:', error.message);
    next({ status: 500, message: 'Failed to process raw text' });
  }
});

module.exports = router;


