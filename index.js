require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// Import routes
const authRoute = require('./routes/auth');
const enrichRoute = require('./routes/enrich');
const searchRoute = require('./routes/search');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Connect to MongoDB using the connection string from .env
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.error('MongoDB connection error:', err));

// Mount routes
app.use('/api/auth', authRoute);
app.use('/api/enrich', enrichRoute);
app.use('/api/search', searchRoute);

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
