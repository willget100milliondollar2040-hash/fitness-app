import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide a more robust initialization that doesn't crash on module load
// and avoids the "Cannot set property fetch" error by using a safe fetch wrapper
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder',
  {
    global: {
      fetch: (url, options) => window.fetch(url, options),
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment variables.');
}
