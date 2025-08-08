import { useState, useEffect } from 'react';
import MovieForm from './MovieForm';
import MovieList from './MovieList';
import { getMovies } from './api';

export default function App() {
    const [movies, setMovies] = useState([]);

    useEffect(() => {
        getMovies().then(setMovies);
    }, []);

    return (
        <div className="container">
            <h1>🎬 Movie Tracker</h1>
            <MovieForm setMovies={setMovies} />
            <MovieList movies={movies} setMovies={setMovies} />
        </div>
    );
}
