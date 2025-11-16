import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const dataDir = path.join(process.cwd(), 'data');
fs.mkdirSync(dataDir, { recursive: true });
const dbPath = path.join(dataDir, 'movie-tracker.json');

function createEmptyState() {
  return {
    users: [],
    sessions: [],
    movies: [],
    ratings: []
  };
}

function loadState() {
  if (!fs.existsSync(dbPath)) {
    return createEmptyState();
  }
  try {
    const raw = fs.readFileSync(dbPath, 'utf8');
    if (!raw) return createEmptyState();
    const parsed = JSON.parse(raw);
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
      movies: Array.isArray(parsed.movies) ? parsed.movies : [],
      ratings: Array.isArray(parsed.ratings) ? parsed.ratings : []
    };
  } catch (error) {
    console.error('Failed to load state from disk, starting fresh.', error);
    return createEmptyState();
  }
}

const cloneDeep = (value) => {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
};

let state = loadState();

function persist() {
  fs.writeFileSync(dbPath, JSON.stringify(state, null, 2));
}

function nextId(items) {
  return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;
}

function seedDefaultUsers() {
  const defaults = [
    { name: 'Daniel', email: 'daniel@watchbuddy.dev', password: 'watchbuddy1' },
    { name: 'Co-Pilot', email: 'copilot@watchbuddy.dev', password: 'watchbuddy2' }
  ];
  let dirty = false;
  defaults.forEach((user) => {
    const exists = state.users.some((entry) => entry.email.toLowerCase() === user.email.toLowerCase());
    if (!exists) {
      state.users.push({
        id: nextId(state.users),
        name: user.name,
        email: user.email,
        passwordHash: bcrypt.hashSync(user.password, 10),
        createdAt: new Date().toISOString()
      });
      dirty = true;
    }
  });
  if (dirty) {
    persist();
  }
}

seedDefaultUsers();

export function readDb() {
  return cloneDeep(state);
}

export function mutateDb(mutator) {
  const draft = cloneDeep(state);
  const result = mutator(draft);
  state = draft;
  persist();
  return result;
}

export function resetDb(newState = createEmptyState()) {
  state = newState;
  persist();
}
