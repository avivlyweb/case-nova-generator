import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Get the request body
    const { name } = await req.json()

    if (!name) {
      console.error('Secret name is required');
      return new Response(
        JSON.stringify({ error: 'Secret name is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Attempting to fetch secret:', name);

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the secret from Supabase
    const { data: secret, error: secretError } = await supabaseClient
      .from('secrets')
      .select('value')
      .eq('name', name)
      .single()

    if (secretError) {
      console.error('Database error fetching secret:', secretError);
      throw new Error(`Failed to retrieve secret: ${secretError.message}`);
    }

    if (!secret?.value) {
      console.error(`Secret '${name}' not found or value is null`);
      return new Response(
        JSON.stringify({ error: `Secret '${name}' not found` }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    console.log(`Successfully retrieved secret: ${name}`);

    // Return the secret
    return new Response(
      JSON.stringify({ secret: secret.value }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    console.error('Error in get-secret function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})