// Import required packages
const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(morgan('dev')); // Configure Morgan for HTTP request logging

// In-memory database
let movies = [
  { id: 1, title: "Inception", director: "Christopher Nolan", year: 2010 },
  { id: 2, title: "The Matrix", director: "The Wachowskis", year: 1999 },
  { id: 3, title: "Parasite", director: "Bong Joon-ho", year: 2019 }
];

// Validation function
const validateMovie = (movie) => {
  const errors = [];

  // Check if required fields are present
  if (!movie.title) errors.push("Title is required");
  if (!movie.director) errors.push("Director is required");
  if (!movie.year) errors.push("Year is required");

  // Validate year - 1888 was when the first motion picture was made
  if (movie.year) {
    const year = parseInt(movie.year);
    const currentYear = new Date().getFullYear();

    if (isNaN(year)) {
      errors.push("Year must be a number");
    } else if (year < 1888 || year > currentYear) {
      errors.push(`Year must be between 1888 and ${currentYear}`);
    }
  }

  return errors;
};

// GET /movies - Return all movies (with optional filtering)
app.get('/movies', (req, res) => {
  // Handle query parameters for filtering
  let filteredMovies = [...movies];

  // Filter by title
  if (req.query.title) {
    filteredMovies = filteredMovies.filter(movie =>
      movie.title.toLowerCase().includes(req.query.title.toLowerCase())
    );
  }

  // Filter by director
  if (req.query.director) {
    filteredMovies = filteredMovies.filter(movie =>
      movie.director.toLowerCase().includes(req.query.director.toLowerCase())
    );
  }

  // Filter by year
  if (req.query.year) {
    const year = parseInt(req.query.year);
    if (!isNaN(year)) {
      filteredMovies = filteredMovies.filter(movie => movie.year === year);
    }
  }

  res.json(filteredMovies);
});

// GET /movies/:id - Return a specific movie by ID
app.get('/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const movie = movies.find(movie => movie.id === id);

  if (!movie) {
    return res.status(404).json({ error: "Movie not found" });
  }

  res.json(movie);
});

// POST /movies - Create a new movie
app.post('/movies', (req, res) => {
  const newMovie = req.body;

  // Validate movie data
  const errors = validateMovie(newMovie);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Generate new ID (typically handled by a database)
  const newId = movies.length > 0 ? Math.max(...movies.map(movie => movie.id)) + 1 : 1;

  // Create the new movie object
  const movieToAdd = {
    id: newId,
    title: newMovie.title,
    director: newMovie.director,
    year: parseInt(newMovie.year)
  };

  // Add to our collection
  movies.push(movieToAdd);

  // Return the created movie with 201 status
  res.status(201).json(movieToAdd);
});

// PUT /movies/:id - Update an existing movie
app.put('/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updateData = req.body;

  // Find the movie
  const movieIndex = movies.findIndex(movie => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ error: "Movie not found" });
  }

  // Validate updated data
  const errors = validateMovie(updateData);
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // Update the movie
  const updatedMovie = {
    id: id,
    title: updateData.title,
    director: updateData.director,
    year: parseInt(updateData.year)
  };

  movies[movieIndex] = updatedMovie;

  // Return the updated movie
  res.json(updatedMovie);
});

// DELETE /movies/:id - Delete a movie
app.delete('/movies/:id', (req, res) => {
  const id = parseInt(req.params.id);

  // Find the movie
  const movieIndex = movies.findIndex(movie => movie.id === id);

  if (movieIndex === -1) {
    return res.status(404).json({ error: "Movie not found" });
  }

  // Remove the movie
  movies.splice(movieIndex, 1);

  // Return 204 No Content
  res.status(204).send();
});

// Catch-all route for undefined routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});