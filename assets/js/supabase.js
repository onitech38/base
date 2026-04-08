// /assets/js/supabase.js
const SUPABASE_URL = "https://xnfmsaldsiwgvddwtuuy.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZm1zYWxkc2l3Z3ZkZHd0dXV5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1MDc5NjQsImV4cCI6MjA5MTA4Mzk2NH0.xPWGPXBGbjC8LfFA_dysN6XOzFwww07PcCSu58samHQy";

export const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
