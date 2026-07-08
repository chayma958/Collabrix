export const TOKEN_KEY = 'collabrix_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}
