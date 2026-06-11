import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

// Verifica se as credenciais do Supabase foram fornecidas corretamente no arquivo .env
export const isRealtimeConfigured = !!(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' && 
  supabaseUrl !== '' && 
  supabaseKey !== 'your-anon-public-key' && 
  supabaseKey !== ''
);

// Inicializa o cliente do Supabase ou retorna null para ativar o fallback Single-Player
export const supabase = isRealtimeConfigured 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

if (!isRealtimeConfigured) {
  console.warn(
    "[DATABASE] Supabase API credentials are not set. The simulator will fall back to Single-Player Local Mode."
  );
}
