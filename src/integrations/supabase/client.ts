
import { createClient } from '@supabase/supabase-js';

// These should be your public Supabase URL and anon key
const supabaseUrl = 'https://earqddyjwuassqvgogqw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhcnFkZHlqd3Vhc3NxdmdvZ3F3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTQ2MTExNDgsImV4cCI6MjAxMDE4NzE0OH0.qlAeh4jq66grW7LH4Xqn_SxJlm_L_o2y86GQ6Tb_DFc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
