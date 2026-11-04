import { createClient } from '@supabase/supabase-js';

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[supabase] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY non configurati — auth disabilitata');
}

export const supabase = createClient(
  supabaseUrl     || 'http://localhost',
  supabaseAnonKey || 'missing',
);
