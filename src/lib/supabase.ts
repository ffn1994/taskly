import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const configured =
  supabaseUrl.startsWith('http') &&
  supabaseUrl !== 'your_supabase_url_here' &&
  supabaseAnonKey !== '' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here';

export const supabase = configured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

export const isSupabaseConfigured = () => configured;
