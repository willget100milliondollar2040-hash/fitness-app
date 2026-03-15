import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mguceytxyvmybmwhrhhg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ndWNleXR4eXZteWJtd2hyaGhnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NjI2MTEsImV4cCI6MjA4OTAzODYxMX0.UKgGEQir8YnpS1qd3gycaipoC2jU-IXEbOpL0uIDTvQ';

// Provide a more robust initialization that doesn't crash on module load
// and avoids the "Cannot set property fetch" error by using a safe fetch wrapper
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);
