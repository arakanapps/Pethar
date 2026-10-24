import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from 'react';
import type { Session, User as SupabaseAuthUser } from '@supabase/supabase-js';
import {
  supabase,
  signInWithOtp as apiSignInWithOtp,
  verifyOtp as apiVerifyOtp,
  signOut as apiSignOut,
} from './supabase';
import type { User as DbUser } from '../types/database';

export interface AuthContextType {
  user: SupabaseAuthUser | null;
  dbUser: DbUser | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  sendOtp: (phoneNumber: string) => Promise<{ messageId?: string | null }>;
  verifyOtp: (phoneNumber: string, token: string) => Promise<Session | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseAuthUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDbUser = useCallback(async (authUserId: string, phone?: string) => {
    try {
      // First try to look up by auth user ID
      const { data: initialData, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

      let data = initialData;

      // Fallback: look up by phone number if available
      if (!data && phone) {
        const { data: phoneData } = await supabase
          .from('users')
          .select('*')
          .eq('phone_number', phone)
          .maybeSingle();
        data = phoneData;
      }

      if (fetchError) {
        console.warn('Error fetching DB user profile:', fetchError.message);
      }
      setDbUser(data as DbUser | null);
    } catch (err) {
      console.warn('Failed to load user profile from database', err);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchDbUser(user.id, user.phone);
    }
  }, [user, fetchDbUser]);

  useEffect(() => {
    let isMounted = true;

    // Initial session load
    supabase.auth
      .getSession()
      .then(({ data: { session: initialSession }, error: sessionError }) => {
        if (!isMounted) return;
        if (sessionError) {
          setError(sessionError.message);
        }
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        if (initialSession?.user) {
          fetchDbUser(initialSession.user.id, initialSession.user.phone);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown auth error');
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? null);
      setError(null);
      if (newSession?.user) {
        await fetchDbUser(newSession.user.id, newSession.user.phone);
      } else {
        setDbUser(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchDbUser]);

  const sendOtp = useCallback(async (phoneNumber: string) => {
    setError(null);
    try {
      const data = await apiSignInWithOtp(phoneNumber);
      return { messageId: data.messageId };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to send OTP code';
      setError(msg);
      throw err;
    }
  }, []);

  const verifyOtp = useCallback(
    async (phoneNumber: string, token: string) => {
      setError(null);
      try {
        const data = await apiVerifyOtp(phoneNumber, token);
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          if (data.session.user) {
            await fetchDbUser(data.session.user.id, data.session.user.phone);
          }
        }
        return data.session;
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to verify OTP code';
        setError(msg);
        throw err;
      }
    },
    [fetchDbUser]
  );

  const signOut = useCallback(async () => {
    setError(null);
    try {
      await apiSignOut();
      setSession(null);
      setUser(null);
      setDbUser(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign out';
      setError(msg);
      throw err;
    }
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      dbUser,
      session,
      isLoading,
      isAuthenticated: !!session && !!user,
      error,
      sendOtp,
      verifyOtp,
      signOut,
      refreshProfile,
    }),
    [user, dbUser, session, isLoading, error, sendOtp, verifyOtp, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
