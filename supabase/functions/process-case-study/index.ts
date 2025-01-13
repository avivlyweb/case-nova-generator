import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processCaseStudy } from './utils/caseProcessor.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get and validate request body
    if (!req.body) {
      throw new Error('Request body is required')
    }

    let body
    try {
      const text = await req.text()
      console.log('Raw request body:', text) // Debug log
      body = JSON.parse(text)
    } catch (e) {
      console.error('JSON parsing error:', e)
      throw new Error('Invalid JSON in request body')
    }

    // Validate required fields
    const { caseStudy, action = 'generate' } = body
    if (!caseStudy || !caseStudy.id) {
      throw new Error('Case study data with ID is required')
    }

    console.log(`Processing ${action} request for case study:`, caseStudy.id)
    
    const result = await processCaseStudy(caseStudy, action)

    return new Response(
      JSON.stringify(result),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json'
        },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in edge function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        details: error.stack
      }),
      { 
        status: error.message?.includes('Invalid JSON') ? 400 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})