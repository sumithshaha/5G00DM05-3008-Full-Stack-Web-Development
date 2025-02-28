// server.js - Express server with WebSocket and HTTPS support
const express = require('express');
const http = require('http');
const https = require('https');
const WebSocket = require('ws');
const morgan = require('morgan');
const selfsigned = require('selfsigned');
const { initializeWebSocket } = require('./wsHandler');
const connectDB = require('./config/db');
require('dotenv').config();

// Import routes
const movieRoutes = require('./routes/movieRoutes');
const authRoutes = require('./routes/authRoutes');

// Initialize Express app
const app = express();
const HTTP_PORT = process.env.PORT || 3000;
const HTTPS_PORT = process.env.HTTPS_PORT || 3443;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Logging

// Routes
app.use('/api/movies', movieRoutes);
app.use('/api/auth', authRoutes);

// Simple home route
app.get('/', (req, res) => {
  res.send('Welcome to the Movie API. Available routes: /api/movies, /api/auth');
});

// Handle undefined routes (404)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Create HTTP server
const httpServer = http.createServer(app);

// Initialize WebSocket server
const wsServer = new WebSocket.Server({ server: httpServer });
initializeWebSocket(wsServer);

// Generate self-signed certificates for HTTPS
const attrs = [{ name: 'commonName', value: 'localhost' }];
const options = { days: 365 }; // Certificate validity
const { private: privateKey, cert: certificate } = selfsigned.generate(attrs, options);

// HTTPS server options
const sslOptions = {
  key: privateKey,
  cert: certificate,
};

// Create HTTPS server
const httpsServer = https.createServer(sslOptions, app);

// Initialize WebSocket server for HTTPS as well
const wssSecure = new WebSocket.Server({ server: httpsServer });
initializeWebSocket(wssSecure);

// Start HTTP server
httpServer.listen(HTTP_PORT, () => {
  console.log(`HTTP server running on http://localhost:${HTTP_PORT}`);
  console.log(`WebSocket server running on ws://localhost:${HTTP_PORT}`);
});

// Start HTTPS server
httpsServer.listen(HTTPS_PORT, () => {
  console.log(`HTTPS server running on https://localhost:${HTTPS_PORT}`);
  console.log(`Secure WebSocket server running on wss://localhost:${HTTPS_PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});