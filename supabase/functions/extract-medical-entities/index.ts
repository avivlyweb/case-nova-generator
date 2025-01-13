import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { extractMedicalEntities } from './utils/entityExtraction.ts'

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
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Function timed out')), 25000) // 25 second timeout
    })

    const { text } = await req.json()
    
    if (!text) {
      return new Response(
        JSON.stringify({ error: 'No text provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Processing text for medical entities extraction')
    
    // Race between the processing and timeout
    const entities = await Promise.race([
      extractMedicalEntities(text),
      timeoutPromise
    ])

    console.log('Extraction completed successfully:', entities)
    
    return new Response(
      JSON.stringify({ entities }),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in edge function:', error)
    
    let status = 500;
    let message = error.message || 'Internal server error';

    if (error.message?.includes('rate_limit')) {
      status = 429;
      message = 'Rate limit exceeded. Please try again in a few minutes.';
    } else if (error.message?.includes('timed out')) {
      status = 504;
      message = 'The request took too long to process. Please try again.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: message,
        details: error.stack,
        type: error.name
      }),
      { 
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})