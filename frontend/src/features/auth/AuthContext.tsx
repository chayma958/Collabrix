import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { authApi } from './api';
import { setAuthToken } from '@/lib/api-client';
import { TOKEN_KEY } from '@/lib/token';
import { disconnectSocket } from '@/lib/socket';
import type { User } from '@/types/user';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  loginWithToken: (accessToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setIsLoading(false);
      return;
    }
    setAuthToken(token);
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setAuthToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    function handleStorage(event: StorageEvent) {
      if (event.key !== TOKEN_KEY) return;

      if (event.newValue) {
        setAuthToken(event.newValue);
        authApi
          .me()
          .then(setUser)
          .catch(() => {
            localStorage.removeItem(TOKEN_KEY);
            setAuthToken(null);
            setUser(null);
          });
      } else {
        setAuthToken(null);
        setUser(null);
        disconnectSocket();
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function applySession(accessToken: string, nextUser: User) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    setAuthToken(accessToken);
    setUser(nextUser);
  }

  async function login(email: string, password: string) {
    const { accessToken, user: loggedInUser } = await authApi.login({ email, password });
    applySession(accessToken, loggedInUser);
  }

  async function register(email: string, password: string, firstName: string, lastName: string) {
    await authApi.register({ email, password, firstName, lastName });
  }

  async function loginWithToken(accessToken: string) {
    setAuthToken(accessToken);
    const loggedInUser = await authApi.me();
    applySession(accessToken, loggedInUser);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setAuthToken(null);
    setUser(null);
    disconnectSocket();
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, loginWithToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
