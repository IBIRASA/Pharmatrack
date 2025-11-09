import React, { createContext, useContext, useState } from 'react';
export type UserType = 'patient' | 'pharmacy';

export interface User {
  id: number;
  email: string;
  user_type: UserType;
  name?: string;
  phone?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
}

interface AuthContextValue extends AuthState {
  setAuth: (next: AuthState) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });
  
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setAuth = (next: AuthState) => {
    setToken(next.token);
    setUser(next.user);
    
    if (next.token) {
      localStorage.setItem('token', next.token);
    } else {
      localStorage.removeItem('token');
    }
    
    if (next.user) {
      localStorage.setItem('user', JSON.stringify(next.user));
    } else {
      localStorage.removeItem('user');
    }
  };

  const logout = () => {
    setAuth({ token: null, user: null });
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ token, user, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};