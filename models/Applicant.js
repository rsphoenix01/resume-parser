const mongoose = require('mongoose');

const ApplicantSchema = new mongoose.Schema({
  // Sensitive fields (encrypted)
  name: { type: String, required: true },
  email: { type: String, required: true },
  education: {
    degree: { type: String, default: "" },
    branch: { type: String, default: "" },
    institution: { type: String, default: "" },
    year: { type: String, default: "" }
  },
  experience: {
    job_title: { type: String, default: "" },
    company: { type: String, default: "" },
    start_date: { type: String, default: "" },
    end_date: { type: String, default: "" }
  },
  summary: { type: String, default: "" },
  skills: { type: [String], default: [] }
});

// Prevent model overwrite during hot-reloads or multiple imports
module.exports = mongoose.models.Applicant || mongoose.model('Applicant', ApplicantSchema, 'applicants');

