import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { processCaseStudy } from './utils/caseProcessor.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TIMEOUT_MS = 45000; // 45 seconds timeout

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate that we have a request body
    if (!req.body) {
      throw new Error('Request body is required');
    }

    let body;
    try {
      const text = await req.text(); // Get raw text first
      console.log('Received request body:', text); // Log raw request for debugging
      body = JSON.parse(text);
    } catch (e) {
      console.error('JSON parsing error:', e);
      throw new Error('Invalid JSON in request body');
    }

    // Validate required fields
    const { caseStudy, action = 'generate' } = body;
    
    if (!caseStudy) {
      throw new Error('Case study data is required');
    }

    console.log(`Processing ${action} request for case study:`, caseStudy.id);
    
    // Process with timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Function timed out')), TIMEOUT_MS);
    });

    const result = await Promise.race([
      processCaseStudy(caseStudy, action),
      timeoutPromise
    ]);

    console.log('Processing completed successfully');
    
    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Error in edge function:', error);
    
    let status = 500;
    let message = error.message || 'Internal server error';

    if (error.message?.includes('timed out')) {
      status = 504;
      message = 'The request took too long to process. Try with a shorter description or fewer sections.';
    } else if (error.message?.includes('rate_limit')) {
      status = 429;
      message = 'Rate limit exceeded. Please try again in a few minutes.';
    } else if (error.message?.includes('Invalid JSON')) {
      status = 400;
      message = 'Invalid request format. Please check your input data.';
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
    );
  }
})