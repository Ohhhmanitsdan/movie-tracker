const API_URL = 'http://localhost:5000';

export const getMovies = async () => {
  const res = await fetch(`${API_URL}/movies`);
  return res.json();
};

export const addMovie = async (title) => {
  const res = await fetch(`${API_URL}/movies`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title }),
  });
  return res.json();
};

export const updateMovie = async (id, data) => {
  const res = await fetch(`${API_URL}/movies/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return res.json();
};

export const deleteMovie = async (id) => {
  await fetch(`${API_URL}/movies/${id}`, { method: 'DELETE' });
};
