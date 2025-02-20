const express = require('express');
const verifyJWT = require('../middleware/verifyJWT');
const Applicant = require('../models/Applicant');
const { decrypt } = require('../utils/encryption');

const router = express.Router();

// POST /api/search
router.post('/', verifyJWT, async (req, res, next) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name parameter is required' });
  }
  
  try {
    // Retrieve all records (for a demo; consider a better approach for production)
    const allApplicants = await Applicant.find({});
    // Filter results by decrypting the name field
    const matched = allApplicants.filter((applicant) => {
      const decryptedName = decrypt(applicant.name).toLowerCase();
      return decryptedName.includes(name.toLowerCase());
    });

    if (matched.length === 0) {
      return res.status(404).json({ error: 'No matching record found' });
    }

    const results = matched.map((applicant) => ({
      name: decrypt(applicant.name),
      email: decrypt(applicant.email),
      education: applicant.education,
      experience: applicant.experience,
      summary: applicant.summary,
      skills: applicant.skills
    }));

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error during resume search:', error.message);
    next({ status: 500, message: 'Failed to search resume' });
  }
});

module.exports = router;

