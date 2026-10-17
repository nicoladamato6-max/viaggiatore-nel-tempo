import { createClient } from '@supabase/supabase-js';

// Valori pubblici del progetto — safe da includere nel bundle client (anon key = publishable key)
const supabaseUrl     = (import.meta.env.VITE_SUPABASE_URL     as string) || 'https://tsdkqaheddnwzgxgphtw.supabase.co';
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || 'sb_publishable_rK0birboCtt7dSAyBh5T7g_zVt6ZXCY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
