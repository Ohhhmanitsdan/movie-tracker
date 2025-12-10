export type SignInInput = { username: string; password: string };
export type RegisterInput = { username: string; email: string; password: string };

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function signIn(input: SignInInput) {
  await delay(600);
  if (!input.username || !input.password) {
    throw new Error("Invalid credentials");
  }
  return { ok: true };
}

export async function register(input: RegisterInput) {
  await delay(700);
  if (!input.username || !input.email || !input.password) {
    throw new Error("Invalid data");
  }
  return { ok: true };
}
