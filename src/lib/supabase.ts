import { createClient } from '@supabase/supabase-js';

const DEFAULT_SUPABASE_URL = 'https://fcsljawpczunmfistwza.supabase.co';
const DEFAULT_SUPABASE_KEY = 'sb_publishable_4V6h7KmPA64ztxXkGEBERw__TSFXGdN';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  DEFAULT_SUPABASE_URL;

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  DEFAULT_SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

