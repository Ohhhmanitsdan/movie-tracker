import MovieCard from './MovieCard';

export default function MovieList({ movies, setMovies }) {
    return (
        <div className="movie-list">
            {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} setMovies={setMovies} />
            ))}
        </div>
    );
}
