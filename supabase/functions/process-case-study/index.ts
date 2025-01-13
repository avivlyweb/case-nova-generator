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
    console.log('Received request:', req.method, req.url);
    
    // Parse request body
    let body;
    try {
      body = await req.json();
      console.log('Request body:', JSON.stringify(body));
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: error.message
        }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
    
    const { caseStudy, action = 'generate' } = body;
    
    if (!caseStudy) {
      console.error('No case study provided');
      return new Response(
        JSON.stringify({ error: 'No case study provided' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`Processing ${action} request for case study:`, caseStudy.id);
    
    const result = await processCaseStudy(caseStudy, action);
    console.log('Processing completed successfully:', result);
    
    return new Response(
      JSON.stringify(result),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in edge function:', error);
    
    // Determine appropriate status code and message
    let status = 500;
    let message = error.message || 'Internal server error';

    if (error.message?.includes('context_length_exceeded')) {
      status = 413; // Payload Too Large
      message = 'The case study content is too long. Please try with a shorter description.';
    } else if (error.message?.includes('rate_limit')) {
      status = 429; // Too Many Requests
      message = 'Rate limit exceeded. Please try again in a few minutes.';
    } else if (error.message?.includes('Service Unavailable')) {
      status = 503; // Service Unavailable
      message = 'The AI service is temporarily unavailable. Please try again in a few moments.';
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
    );
  }
})