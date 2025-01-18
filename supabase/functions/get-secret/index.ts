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
    
    console.log('Request received for secret:', name)
    console.log('SUPABASE_URL:', Deno.env.get('SUPABASE_URL'))
    
    if (!name) {
      console.error('Secret name is required')
      return new Response(
        JSON.stringify({ error: 'Secret name is required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Attempting to fetch secret from database:', name)
    
    // Get the secret from Supabase
    const { data, error } = await supabaseClient
      .from('secrets')
      .select('value')
      .eq('name', name)
      .single()

    if (error) {
      console.error('Database error:', error)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to retrieve secret from database',
          details: error.message 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    if (!data) {
      console.error(`No secret found with name: ${name}`)
      return new Response(
        JSON.stringify({ 
          error: `Secret '${name}' not found in database`,
          details: 'Please ensure the secret is properly set in Supabase'
        }),
        { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Successfully retrieved secret: ${name}`)
    
    return new Response(
      JSON.stringify({ secret: data.value }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Unexpected error in get-secret function:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message,
        stack: error.stack
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})