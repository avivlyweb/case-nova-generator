import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { generateSuggestion } from './utils/suggestionGenerator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, field, currentValue, specialization, existingValues } = await req.json()
    
    if (action === 'suggest') {
      console.log('Processing suggestion request:', { field, specialization });
      
      const suggestion = await generateSuggestion(
        field,
        currentValue,
        specialization,
        existingValues
      )
      
      return new Response(
        JSON.stringify({ suggestion }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    throw new Error('Invalid action specified')

  } catch (error) {
    console.error('Error in edge function:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})