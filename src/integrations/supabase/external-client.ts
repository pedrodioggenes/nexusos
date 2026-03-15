/**
 * Cliente Supabase apontando para o projeto externo (self-managed).
 * 
 * Para VOLTAR ao Lovable Cloud:
 *   1. Em vite.config.ts, comente/remova o alias "src/integrations/supabase/client"
 *   2. O app volta a usar o client.ts original automaticamente
 */
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const EXTERNAL_URL = 'https://aocrxaercsmgcnybdsto.supabase.co';
const EXTERNAL_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvY3J4YWVyY3NtZ2NueWJkc3RvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMzNzE5ODYsImV4cCI6MjA4ODk0Nzk4Nn0.4ib9mUb_MfDP4TPvWpx0jRJ2knEakIt0UO3kX4hyd1k';

export const supabase = createClient<Database>(EXTERNAL_URL, EXTERNAL_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
