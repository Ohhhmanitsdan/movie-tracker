import { useState } from 'react';
import { addMovie, getMovies } from './api';

export default function MovieForm({ setMovies }) {
    const [title, setTitle] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;
        await addMovie(title);
        setTitle('');
        setMovies(await getMovies());
    };

    return (
        <form onSubmit={handleSubmit} className="movie-form">
            <input
                type="text"
                placeholder="Enter movie title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />
            <button type="submit">Add Movie</button>
        </form>
    );
}
