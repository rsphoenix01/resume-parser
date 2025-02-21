require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Import routes
const authRoute = require('./routes/auth');
const enrichRoute = require('./routes/enrich');
const searchRoute = require('./routes/search');

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { 
  useNewUrlParser: true, 
  useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/enrich', enrichRoute);
app.use('/api/search', searchRoute);

// Optional: Root route to avoid "Cannot GET /" message
app.get('/', (req, res) => {
  res.send('Welcome to my Resume Parser API!');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

// Export the app for Vercel
module.exports = app;

