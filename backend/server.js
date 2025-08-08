import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import fetch from 'node-fetch';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Schema
const movieSchema = new mongoose.Schema({
  title: String,
  year: String,
  poster: String,
  trailer: String,
  watched: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
});

const Movie = mongoose.model('Movie', movieSchema);

// Routes
app.get('/movies', async (req, res) => {
  const movies = await Movie.find();
  res.json(movies);
});

app.post('/movies', async (req, res) => {
  const { title } = req.body;
  const apiKey = process.env.TMDB_API_KEY;
  let poster = '';
  let trailer = '';

  try {
    // Fetch movie details
    const searchRes = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(title)}`);
    const searchData = await searchRes.json();

    if (searchData.results.length > 0) {
      const movieData = searchData.results[0];
      poster = `https://image.tmdb.org/t/p/w500${movieData.poster_path}`;

      // Get trailer
      const videoRes = await fetch(`https://api.themoviedb.org/3/movie/${movieData.id}/videos?api_key=${apiKey}`);
      const videoData = await videoRes.json();
      const trailerObj = videoData.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      if (trailerObj) trailer = `https://www.youtube.com/watch?v=${trailerObj.key}`;
    }
  } catch (err) {
    console.error('TMDb fetch error:', err);
  }

  const movie = new Movie({ title, poster, trailer, watched: false });
  await movie.save();
  res.json(movie);
});

app.put('/movies/:id', async (req, res) => {
  const updated = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

app.delete('/movies/:id', async (req, res) => {
  await Movie.findByIdAndDelete(req.params.id);
  res.json({ message: 'Movie deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
