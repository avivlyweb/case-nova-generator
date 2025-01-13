import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processCaseStudy } from './utils/caseProcessor.ts'

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
    // Parse request body
    const body = await req.json()
    const { caseStudy, action = 'generate' } = body
    
    if (!caseStudy) {
      console.error('No case study provided')
      return new Response(
        JSON.stringify({ 
          error: 'No case study provided',
          details: 'The request must include a case study object'
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Processing ${action} request for case study:`, caseStudy.id)
    
    const result = await processCaseStudy(caseStudy, action)
    console.log('Processing completed successfully:', result)
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in edge function:', error)
    
    // Determine appropriate status code
    let status = 500;
    let message = error.message || 'Internal server error';

    if (message.includes('rate limit')) {
      status = 429; // Too Many Requests
      message = 'Rate limit exceeded. Please try again in a few minutes.';
    } else if (message.includes('temporarily unavailable')) {
      status = 503; // Service Unavailable
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