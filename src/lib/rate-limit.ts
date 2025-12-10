const windowMs = 60 * 1000;
const maxAttempts = 20;

const attempts = new Map<string, { count: number; expiresAt: number }>();

export function rateLimit(key: string) {
  const now = Date.now();
  const entry = attempts.get(key);
  if (entry && entry.expiresAt > now) {
    entry.count += 1;
    if (entry.count > maxAttempts) {
      return false;
    }
    attempts.set(key, entry);
    return true;
  }

  attempts.set(key, { count: 1, expiresAt: now + windowMs });
  return true;
}
