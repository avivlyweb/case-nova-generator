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

    const { currentField, formData } = await req.json()
    
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
      model: "gemma2-9b-it",
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
    
    // Provide more specific error messages
    let errorMessage = 'An unexpected error occurred';
    if (error.message) {
      errorMessage = error.message;
    }
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: 'Please check the function logs for more information'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})