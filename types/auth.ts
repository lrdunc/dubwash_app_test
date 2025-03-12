import { User } from './index';
import { ReactNode } from 'react';

export interface AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: User | null;
}

export interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export interface AuthProviderState extends AuthState {
  error: Error | null;
}

export interface AuthError {
  message: string;
  status?: number;
} 