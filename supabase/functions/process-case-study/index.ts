import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processCaseStudy } from './utils/caseProcessor.ts'
import { generateSuggestion } from './utils/suggestionGenerator.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { action = 'generate' } = body
    
    if (action === 'suggest') {
      const { field, currentValue, specialization, existingValues } = body
      const suggestion = await generateSuggestion(field, currentValue, specialization, existingValues)
      
      return new Response(
        JSON.stringify({ suggestion }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }
    
    // Handle case study generation
    const { caseStudy } = body
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
    
    let status = 500;
    let message = error.message || 'Internal server error';

    if (error.message?.includes('context_length_exceeded')) {
      status = 413;
      message = 'The case study content is too long. Please try with a shorter description.';
    } else if (error.message?.includes('rate_limit')) {
      status = 429;
      message = 'Rate limit exceeded. Please try again in a few minutes.';
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