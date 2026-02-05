import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { api } from '../services/api';
import type { Token, UserWithProfile } from '../types/types';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  isAdmin: boolean;
  user: UserWithProfile | null;
  login: (token: Token) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';
const ADMIN_ROLE_ID = 1;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!token;

  const initializeUser = useCallback(async () => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedToken) {
      setToken(storedToken);
      try {
        const userData: UserWithProfile = await api.get('/users/me');
        setUser(userData);
        if (userData.profile?.role_id === ADMIN_ROLE_ID) {
          setIsAdmin(true);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
        setIsAdmin(false);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const login = useCallback(async (authToken: Token) => {
    localStorage.setItem(TOKEN_KEY, authToken.access_token);
    setToken(authToken.access_token);
    const userData: UserWithProfile = await api.get('/users/me');
    setUser(userData);
    if (userData.profile?.role_id === ADMIN_ROLE_ID) {
      setIsAdmin(true);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setIsAdmin(false);
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">Carregando...</div>;
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, isAdmin, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
