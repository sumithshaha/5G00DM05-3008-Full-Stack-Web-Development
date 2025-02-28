// controllers/authController.js
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../models/User');

// Debug: Log when controller is loaded
console.log('Auth controller loaded, User model:', typeof User);

// Joi validation schemas
const registerSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(8).required(),
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
    console.log('Register request received:', req.body);

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
      password: req.body.password, // Will be hashed by pre-save hook
      role: req.body.role || 'regular'
    });

    // Save user
    const savedUser = await user.save();
    console.log('User registered successfully:', savedUser.username);

    // Return user data (without password)
    res.status(201).json({
      id: savedUser._id,
      username: savedUser.username,
      role: savedUser.role
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
};

// Login user
// POST /api/auth/login
const login = async (req, res) => {
  try {
    console.log('Login request received:', req.body.username);

    // Validate input with Joi
    const { error } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Check if user exists
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
      console.log('User not found:', req.body.username);
      return res.status(400).json({ error: 'Invalid username or password' });
    }

    // Validate password
    const isMatch = await user.comparePassword(req.body.password);
    if (!isMatch) {
      console.log('Password mismatch for user:', req.body.username);
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

    console.log('Login successful for:', user.username, 'with role:', user.role);
    console.log('Generated token:', token);

    // Return token
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  registerUser,
  login
};