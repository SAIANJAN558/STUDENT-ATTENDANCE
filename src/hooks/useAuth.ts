import { useState, useEffect, useCallback } from 'react';
import { api, getStoredToken, setStoredToken, clearStoredToken, ApiProfile } from '@/lib/api';
import { UserRole } from '@/types';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  name: string;
  roll_number: string | null;
  department: string | null;
  phone: string | null;
}

export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  rollNumber?: string;
  phone?: string;
  department?: string;
}

export function useAuth() {
  const [user, setUser] = useState<any | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  const initAuth = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.me();
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email,
          user_metadata: { role: data.role, name: data.user.name },
        });
        setSession({
          access_token: token,
          user: data.user,
        });
        setProfile(data.profile);
        setRole(data.role);
      } else {
        clearStoredToken();
        setUser(null);
        setSession(null);
        setProfile(null);
        setRole(null);
      }
    } catch (err) {
      clearStoredToken();
      setUser(null);
      setSession(null);
      setProfile(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const signUp = async (
    email: string,
    password: string,
    name: string,
    userRole: UserRole,
    rollNumber?: string
  ) => {
    try {
      const res = await api.auth.register({
        email,
        password,
        name,
        role: userRole,
        rollNumber,
      });

      setStoredToken(res.token);
      setUser({
        id: res.user.id,
        email: res.user.email,
        user_metadata: { role: res.role, name: res.user.name },
      });
      setSession({
        access_token: res.token,
        user: res.user,
      });
      setProfile(res.profile);
      setRole(res.role);

      return { data: res, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const res = await api.auth.login({ email, password });

      setStoredToken(res.token);
      setUser({
        id: res.user.id,
        email: res.user.email,
        user_metadata: { role: res.role, name: res.user.name },
      });
      setSession({
        access_token: res.token,
        user: res.user,
      });
      setProfile(res.profile);
      setRole(res.role);

      return { data: res, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    clearStoredToken();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
    return { error: null };
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      const res = await api.auth.updateProfile(updates);
      setProfile(res.profile);
      if (user) {
        setUser({
          ...user,
          user_metadata: { ...user.user_metadata, name: res.profile.name },
        });
      }
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  const currentUser: UserWithRole | null = profile && role ? {
    id: user?.id || profile.user_id,
    email: profile.email,
    name: profile.name,
    role,
    rollNumber: profile.roll_number || undefined,
    phone: profile.phone || undefined,
    department: profile.department || undefined,
  } : null;

  return {
    user,
    session,
    profile,
    role,
    currentUser,
    loading,
    isAuthenticated: !!session,
    signUp,
    signIn,
    signOut,
    updateProfile,
    refetchProfile: initAuth,
  };
}
