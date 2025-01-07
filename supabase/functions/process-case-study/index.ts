import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processCaseStudy } from './utils/caseProcessor.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { caseStudy, action = 'generate' } = body
    
    if (!caseStudy) {
      console.error('No case study provided')
      return new Response(
        JSON.stringify({ error: 'No case study provided' }),
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
    
    const status = error.message?.toLowerCase().includes('rate limit') ? 429 : 500;
    const message = status === 429 
      ? 'The AI service is currently at capacity. Please try again in a few minutes.'
      : error.message || 'Internal server error';
    
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