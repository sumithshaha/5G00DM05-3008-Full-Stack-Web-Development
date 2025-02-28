// routes/movieRoutes.js
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

// Public routes (no authentication required)
// router.get('/', getAllMovies);
// router.get('/:id', getMovieById);

// Routes accessible by both regular users and admins
router.get('/', authenticate(['admin', 'regular']), getAllMovies);
router.get('/:id', authenticate(['admin', 'regular']), getMovieById);

// Routes accessible only by admins
router.post('/', authenticate(['admin']), createMovie);
router.put('/:id', authenticate(['admin']), updateMovie);
router.delete('/:id', authenticate(['admin']), deleteMovie);

module.exports = router;