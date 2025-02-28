// models/Movie.js - Movie schema definition
const mongoose = require('mongoose');

// Define the movie schema with validation
const movieSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty']
  },
  director: {
    type: String,
    required: [true, 'Director is required'],
    trim: true,
    minlength: [1, 'Director cannot be empty']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [1888, 'Year must be 1888 or later (first motion picture)'],
    max: [new Date().getFullYear(), 'Year cannot be in the future'],
    validate: {
      validator: Number.isInteger,
      message: 'Year must be an integer'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  // Add virtual getters when converting to JSON
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create and export the Movie model
const Movie = mongoose.model('Movie', movieSchema);

module.exports = Movie;