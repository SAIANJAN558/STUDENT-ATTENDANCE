import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth, Profile, UserWithRole } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface AuthContextType {
  user: any | null;
  session: any | null;
  profile: Profile | null;
  role: UserRole | null;
  currentUser: UserWithRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  signUp: (email: string, password: string, name: string, role: UserRole, rollNumber?: string) => Promise<{ data?: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ data?: any; error: any }>;
  signOut: () => Promise<{ error?: any }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error?: any }>;
  refetchProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
