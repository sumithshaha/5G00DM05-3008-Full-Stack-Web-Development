// routes/movieRoutes.js - Movie API route definitions
const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  createMovie,
  updateMovie,
  deleteMovie
} = require('../controllers/movieController');
const authenticate = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllMovies);
router.get('/:id', getMovieById);

// Protected routes (require authentication)
router.post('/', authenticate, createMovie);
router.put('/:id', authenticate, updateMovie);
router.delete('/:id', authenticate, deleteMovie);

module.exports = router;