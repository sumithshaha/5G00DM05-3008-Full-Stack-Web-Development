// server.js - Express server entry point
const express = require('express');
const morgan = require('morgan');
const connectDB = require('./config/db');
require('dotenv').config();

// Import routes
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Logging

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);

// Handle undefined routes (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});