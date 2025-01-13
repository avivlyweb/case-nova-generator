import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processCaseStudy } from './utils/caseProcessor.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIMEOUT_MS = 45000; // Increase timeout to 45 seconds

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Function timed out')), TIMEOUT_MS)
    })

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
    
    // Process in chunks to avoid timeout
    const result = await Promise.race([
      processCaseStudy(caseStudy, action),
      timeoutPromise
    ])

    console.log('Processing completed successfully')
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in edge function:', error)
    
    let status = 500;
    let message = error.message || 'Internal server error';

    if (error.message?.includes('timed out')) {
      status = 504;
      message = 'The request took too long to process. Try with a shorter description or fewer sections.';
    } else if (error.message?.includes('rate_limit')) {
      status = 429;
      message = 'Rate limit exceeded. Please try again in a few minutes.';
    }
    
    return new Response(
      JSON.stringify({ 
        error: message,
        details: error.stack
      }),
      { 
        status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})