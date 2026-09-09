import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://mtrxcnshuwndfhnnlnve.supabase.co';
const FALLBACK_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10cnhjbnNodXduZGZobm5sbnZlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NTk2NzcsImV4cCI6MjEwNDQzNTY3N30.wX0Tf7frOwKEmg-WWs6cUVf5h-0h23d6FlLkht6wuEo';

const isValidHttpUrl = (url?: string): boolean => {
  if (!url) return false;
  const cleaned = url.trim().replace(/^["']|["']$/g, '');
  return cleaned.startsWith('http://') || cleaned.startsWith('https://');
};

export const getSupabaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (isValidHttpUrl(envUrl)) {
    return envUrl!.trim().replace(/^["']|["']$/g, '');
  }
  return FALLBACK_URL;
};

export const getSupabaseAnonKey = (): string => {
  const envKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (envKey && envKey.trim().length > 20) {
    return envKey.trim().replace(/^["']|["']$/g, '');
  }
  return FALLBACK_ANON_KEY;
};

// Browser singleton client
export const supabase = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
