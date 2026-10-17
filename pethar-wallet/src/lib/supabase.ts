import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://uklqksioruxvatwpvopm.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rUiqzJYfjRLzNK0d6xyg-g_5Z6WmTya';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Missing Supabase environment variables. Check .env configuration.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Phone-based OTP Authentication Helpers
 */

/**
 * Request an SMS OTP code for a phone number (E.164 format, e.g. +959123456789)
 */
export async function signInWithOtp(phone: string) {
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Verify SMS OTP code
 */
export async function verifyOtp(phone: string, token: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Resend OTP code for phone
 */
export async function resendOtp(phone: string) {
  const { data, error } = await supabase.auth.resend({
    type: 'sms',
    phone,
  });
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Google OAuth Sign In / Sign Up
 */
export async function signInWithGoogle(redirectTo?: string) {
  const defaultRedirect = typeof window !== 'undefined'
    ? `${window.location.origin}/app`
    : undefined;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo || defaultRedirect,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Email/Password Sign In & Sign Up
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: fullName ? { full_name: fullName } : undefined,
    },
  });
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Session management helpers
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }
  return data.session;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    throw error;
  }
  return data.user;
}

export function onAuthStateChange(
  callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]
) {
  return supabase.auth.onAuthStateChange(callback);
}
