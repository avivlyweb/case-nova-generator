import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Groq } from "npm:groq-sdk";

const groq = new Groq({
  apiKey: Deno.env.get('GROQ_API_KEY'),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { question, messages, currentPhase = 'initial_assessment' } = await req.json();
    console.log('Processing clinical reasoning request:', { question, messages, currentPhase });

    if (!question) {
      throw new Error('Question is required');
    }

    const systemPrompt = `You are an expert physiotherapy clinical educator simulating a patient case study.
    Your role is to provide realistic patient responses while guiding the student's clinical reasoning.

    Current Learning Phase: ${currentPhase}

    Previous Conversation:
    ${JSON.stringify(messages || [])}

    Guidelines for Patient Simulation:
    1. Respond naturally as the patient would, not with clinical terminology
    2. Only reveal information that was specifically asked about
    3. Include emotional and psychosocial aspects in responses
    4. Use realistic language (e.g. "My shoulder hurts when I reach up" instead of "Pain on shoulder flexion")

    If the student:
    - Asks multiple questions at once: Only answer the first one and say "One question at a time please"
    - Uses technical terms: Respond as a patient would ("I don't understand what you mean by 'impingement', could you explain?")
    - Jumps to conclusions: Express uncertainty or ask how they reached that conclusion
    - Ignores psychosocial factors: Include stress/emotional aspects in your responses
    - Makes vague statements: Ask for clarification
    - Skips important tests: Show discomfort or concern about missing steps
    
    Special Test Responses:
    - If a student requests a special test, respond with realistic findings
    - Include patient feedback (e.g. "That movement really hurt when you lifted my arm that way")
    
    Treatment Discussion:
    - Express concerns about exercises that seem difficult
    - Ask questions about how treatments will help
    - Share realistic limitations ("I can't come to therapy 3 times a week due to work")
    
    Remember to:
    - Stay in character as the patient
    - Express emotions and concerns naturally
    - Only reveal information that was specifically asked about
    - Challenge premature conclusions
    - Encourage thorough assessment`;

    console.log('Sending request to Groq with system prompt:', systemPrompt);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system", 
          content: systemPrompt
        },
        {
          role: "user",
          content: question
        }
      ],
      model: "gemma2-9b-it",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || 'I apologize, but I am unable to process your question at the moment.';
    console.log('Generated response:', response);

    return new Response(
      JSON.stringify({ response }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in clinical-reasoning function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Failed to process question',
        details: error.toString()
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});