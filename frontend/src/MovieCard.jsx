import { getMovies, updateMovie, deleteMovie } from './api';

export default function MovieCard({ movie, setMovies }) {
    const toggleWatched = async () => {
        await updateMovie(movie._id, { watched: !movie.watched });
        setMovies(await getMovies());
    };

    const handleRating = async (rating) => {
        await updateMovie(movie._id, { rating });
        setMovies(await getMovies());
    };

    const handleDelete = async () => {
        if (confirm(`Delete "${movie.title}"?`)) {
            await deleteMovie(movie._id);
            setMovies(await getMovies());
        }
    };

    return (
        <div className={`movie-card ${movie.watched ? 'watched' : ''}`}>
            <img src={movie.poster || 'https://via.placeholder.com/200x300'} alt={movie.title} />
            <h3>{movie.title}</h3>
            {movie.trailer && <a href={movie.trailer} target="_blank">Watch Trailer</a>}
            <p>Rating: {'💀'.repeat(movie.rating || 0)}</p>
            <div className="actions">
                <button onClick={toggleWatched}>
                    {movie.watched ? 'Unwatch' : 'Mark Watched'}
                </button>
                <button onClick={() => handleRating(1)}>💀</button>
                <button onClick={() => handleRating(2)}>💀💀</button>
                <button onClick={() => handleRating(3)}>💀💀💀</button>
                <button onClick={() => handleRating(4)}>💀💀💀💀</button>
                <button onClick={() => handleRating(5)}>💀💀💀💀💀</button>
                <button onClick={handleDelete} className="delete-btn">Delete</button>
            </div>
        </div>
    );
}
