import { Groq } from 'npm:groq-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Function invoked, checking environment variables...');
    
    // Check for required environment variable
    const groqApiKey = Deno.env.get('GROQ_API_KEY');
    if (!groqApiKey) {
      console.error('GROQ_API_KEY environment variable is not set');
      return new Response(
        JSON.stringify({ 
          error: 'GROQ_API_KEY environment variable is not configured. Please set up the API key in your Supabase project settings.' 
        }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Environment variables OK, parsing request body...');
    const { currentField, formData } = await req.json()
    console.log('Request parsed successfully');
    
    const groq = new Groq({
      apiKey: groqApiKey,
    });

    console.log('Generating suggestions for:', currentField, 'with data:', formData)

    const prompt = `As a Neurological Physiotherapist, generate a concise and clinically appropriate suggestion for the "${currentField}" field in a patient case study form. Use the following context:

Current field: ${currentField}
Previous form data: ${JSON.stringify(formData, null, 2)}

Generate a single, specific suggestion that:
1. Is clinically relevant to neurological physiotherapy
2. Builds upon the previous form data
3. Uses appropriate medical terminology
4. Is concise (max 1-3 sentences)
5. Maintains professional documentation standards

Respond with ONLY the suggested text, no explanations or additional formatting.`

    console.log('Making Groq API call...');
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an expert neurological physiotherapist assistant helping to complete patient documentation."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 300,
    });

    const suggestion = completion.choices[0]?.message?.content || '';
    console.log('Generated suggestion:', suggestion)

    return new Response(
      JSON.stringify({ suggestion }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in generate-suggestions:', error)
    console.error('Error stack:', error.stack)
    console.error('Error name:', error.name)
    console.error('Error message:', error.message)
    
    // Provide more specific error messages
    let errorMessage = 'An unexpected error occurred while generating suggestions';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error types
      if (error.message.includes('fetch')) {
        errorMessage = 'Network error: Unable to connect to AI service. Please check your internet connection.';
      } else if (error.message.includes('API key')) {
        errorMessage = 'Authentication error: Invalid or missing API key configuration.';
        statusCode = 401;
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
        statusCode = 429;
      }
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Please check the function logs for more information',
        timestamp: new Date().toISOString()
      }),
      { 
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})