
import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// IMPORTANTE:
// Substitua as strings abaixo pelas credenciais do seu projeto Supabase.
// Você as encontra no painel do Supabase em: Project Settings -> API
// ------------------------------------------------------------------

const supabaseUrl = 'https://mevtunhonclobobcesvt.supabase.co'; 
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ldnR1bmhvbmNsb2JvYmNlc3Z0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyOTEyMDAsImV4cCI6MjA4NDg2NzIwMH0.3gVI28e4opFwCKB5peuyq0WSP_eCRPE3XqiH04ZU_zs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
