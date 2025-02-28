// routes/authRoutes.js - Authentication route definitions
const express = require('express');
const router = express.Router();
const { registerUser, login } = require('../controllers/authController');

// Register user
router.post('/register', registerUser);

// Login user
router.post('/login', login);

module.exports = router;