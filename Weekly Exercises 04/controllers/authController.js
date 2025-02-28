// controllers/authController.js - Authentication logic
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

// Joi validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'regular').default('regular')
});

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
});

// Register a new user
// POST /api/auth/register
const registerUser = async (req, res) => {
  try {
    // Validate input with Joi
    const { error } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username is already taken' });
    }

    // Create new user
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role || 'regular'
    });

    // Save user
    await user.save();

    // Return user data (without password)
    res.status(201).json({
      id: user._id,
      username: user.username,
      role: user.role
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Login user
// POST /api/auth/login
const login = async (req, res) => {
  try {
    // Validate input with Joi
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user exists
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Validate password
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return token
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
  login
};