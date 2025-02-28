// controllers/movieController.js - Movie CRUD operations
const Joi = require('joi');
const Movie = require('../models/Movie');

// Joi validation schema for movie data
const movieSchema = Joi.object({
  title: Joi.string().min(1).required(),
  director: Joi.string().min(1).required(),
  year: Joi.number().integer().min(1888).max(new Date().getFullYear()).required(),
});

// Get all movies
// GET /api/movies
// Optional query params: title, director, year
const getAllMovies = async (req, res) => {
  try {
    // Build query filter
    const query = {};

    if (req.query.title) {
      query.title = { $regex: req.query.title, $options: 'i' };
    }

    if (req.query.director) {
      query.director = { $regex: req.query.director, $options: 'i' };
    }

    if (req.query.year) {
      const year = parseInt(req.query.year);
      if (!isNaN(year)) {
        query.year = year;
      }
    }

    const movies = await Movie.find(query);
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single movie by ID
// GET /api/movies/:id
const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Create a new movie
// POST /api/movies
const createMovie = async (req, res) => {
  try {
    // Validate input with Joi
    const { error } = movieSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Create and save the movie
    const movie = new Movie(req.body);
    const savedMovie = await movie.save();

    res.status(201).json(savedMovie);
  } catch (error) {
    if (error.name === 'ValidationError') {
      // Mongoose validation error
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages });
    }
    res.status(500).json({ error: 'Failed to create movie' });
  }
};

// Update a movie
// PUT /api/movies/:id
const updateMovie = async (req, res) => {
  try {
    // Validate input with Joi
    const { error } = movieSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Find and update the movie
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.json(movie);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ error: messages });
    }
    res.status(500).json({ error: 'Failed to update movie' });
  }
};

// Delete a movie
// DELETE /api/movies/:id
const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);

    if (!movie) {
      return res.status(404).json({ error: 'Movie not found' });
    }

    res.status(204).send();
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ error: 'Invalid ID format' });
    }
    res.status(500).json({ error: 'Failed to delete movie' });
  }
};

module.exports = {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
};