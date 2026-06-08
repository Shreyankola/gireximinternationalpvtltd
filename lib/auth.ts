export const AUTH_KEY = "girexim_auth";

export interface AuthUser {
  email: string;
  isLoggedIn: boolean;
}

const VALID_EMAIL = "admin@gmail.com";
const VALID_PASSWORD = "admin@123";

export function login(email: string, password: string): AuthUser | null {
  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    const user: AuthUser = { email, isLoggedIn: true };
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    }
    return user;
  }
  return null;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  const user = getAuthUser();
  return user !== null && user.isLoggedIn === true;
}
