import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { handleCors, corsHeaders } from './utils/cors.ts'
import { sendResponse, sendError } from './utils/responseHandler.ts'
import { processCaseStudy } from './utils/caseProcessor.ts'

serve(async (req) => {
  try {
    // Handle CORS
    const corsResponse = handleCors(req)
    if (corsResponse) return corsResponse

    // Parse request body
    let body
    try {
      body = await req.json()
    } catch (e) {
      console.error('Error parsing request body:', e)
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

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
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
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
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})