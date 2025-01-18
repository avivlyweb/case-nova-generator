import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Initialize the Supabase client with environment variables
export const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);