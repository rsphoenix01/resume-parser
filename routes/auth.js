const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Hard-coded credentials for demo
const validCredentials = {
  username: "naval.ravikant", password : "05111974"
};

// POST /api/auth
router.post('/', (req, res) => {
  const { username, password } = req.body;
  if (username === validCredentials.username && password === validCredentials.password) {
    // Create a JWT valid for 1 hour
    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.status(200).json({ JWT: token });
  }
  return res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
