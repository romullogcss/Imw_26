import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase Storage] VITE_SUPABASE_URL e/ou VITE_SUPABASE_ANON_KEY não estão configuradas nas variáveis de ambiente. Configure-as no arquivo .env ou no painel de configurações para habilitar o upload de arquivos via Supabase Storage.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
