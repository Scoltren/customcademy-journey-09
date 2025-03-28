
import { createClient } from '@supabase/supabase-js';

// These should be your public Supabase URL and anon key
const supabaseUrl = 'https://earqddyjwuassqvgogqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhcnFkZHlqd3Vhc3NxdmdvZ3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxNTk5MTUsImV4cCI6MjA1NTczNTkxNX0.v3gqCC0Z50623f_T1F0MiVbEWBxF0wIvb9mnPkeOSWU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
