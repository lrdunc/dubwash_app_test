import { User as SupabaseUser } from '@supabase/supabase-js';
import { ThemeProviderProps as NextThemesProviderProps } from 'next-themes';

// User related types
export interface User {
  id: string;
  email: string | null;
  full_name?: string;
  avatar_url?: string;
  phone_number?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  created_at: string;
  updated_at: string;
}

// Vehicle related types
export type VehicleType = 'small' | 'medium' | 'large';

export interface Vehicle {
  id: string;
  user_id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  license_plate: string;
  vehicle_type: VehicleType;
  created_at: string;
  updated_at: string;
}

// Auth related types
export interface Session {
  user: User | null;
  error: Error | null;
}

// Component prop types
export interface LayoutProps {
  children: React.ReactNode;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export type ThemeProviderProps = NextThemesProviderProps; 