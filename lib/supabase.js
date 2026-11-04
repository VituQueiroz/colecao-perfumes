import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const chave = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Fica `null` se as variáveis de ambiente não estiverem configuradas;
// o app mostra um aviso em vez de quebrar.
export const supabase = url && chave ? createClient(url, chave) : null;

export const BUCKET = 'perfumes';
