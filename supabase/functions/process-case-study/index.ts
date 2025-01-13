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
    // Validate content type
    const contentType = req.headers.get('content-type')
    if (!contentType?.includes('application/json')) {
      throw new Error('Content-Type must be application/json')
    }

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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Error in edge function:', error)
    
    let status = 500
    let message = error.message || 'Internal server error'

    if (error.message?.includes('Content-Type')) {
      status = 415
      message = 'Content-Type must be application/json'
    } else if (error.message?.includes('Invalid JSON')) {
      status = 400
      message = 'Invalid request format. Please check your input data.'
    } else if (error.message?.includes('required')) {
      status = 400
      message = error.message
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