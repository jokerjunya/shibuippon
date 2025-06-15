'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User } from '@/types/auth';
import { AuthApi, AuthApiError } from '@/lib/auth-api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, email?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 初期化時にトークンをチェック
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = Cookies.get('auth_token');
      
      if (savedToken) {
        try {
          const { user: userData } = await AuthApi.getCurrentUser(savedToken);
          setUser(userData);
          setToken(savedToken);
        } catch (error) {
          // トークンが無効な場合はクリア
          Cookies.remove('auth_token');
        }
      }
      
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await AuthApi.login({ username, password });
      
      setUser(response.user);
      setToken(response.token);
      
      // トークンをクッキーに保存（7日間）
      Cookies.set('auth_token', response.token, { expires: 7 });
    } catch (error) {
      if (error instanceof AuthApiError) {
        setError(error.message);
      } else {
        setError('ログインに失敗しました');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, password: string, email?: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await AuthApi.register({ username, password, email });
      
      setUser(response.user);
      setToken(response.token);
      
      // トークンをクッキーに保存（7日間）
      Cookies.set('auth_token', response.token, { expires: 7 });
    } catch (error) {
      if (error instanceof AuthApiError) {
        setError(error.message);
      } else {
        setError('ユーザー登録に失敗しました');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    Cookies.remove('auth_token');
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    error,
  };

  return (
    <AuthContext.Provider value={value}>
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