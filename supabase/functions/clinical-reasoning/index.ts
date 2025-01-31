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
    const { question, caseStudy, learningHistory } = await req.json();

    const systemPrompt = `You are an expert physiotherapy clinical educator guiding a student through a case study. 
    Your role is to simulate a realistic patient interaction while providing educational guidance.

    Case Context:
    ${JSON.stringify(caseStudy)}

    Previous Interactions:
    ${JSON.stringify(learningHistory)}

    Guidelines:
    1. Respond as the patient would in a clinical setting
    2. Challenge premature conclusions
    3. Emphasize psychosocial factors
    4. Require justification for clinical decisions
    5. Guide towards evidence-based practice
    6. Delay diagnostic certainty

    If the student:
    - Jumps to conclusions: Ask for evidence and differential diagnosis
    - Ignores psychosocial factors: Prompt consideration of these aspects
    - Makes vague statements: Request specific, measurable criteria
    - Skips important tests: Ask why certain tests weren't considered
    - Provides incomplete treatment plans: Question about missing components

    Current learning phase: ${learningHistory?.currentPhase || 'initial_assessment'}
    Learning objectives: ${JSON.stringify(caseStudy.learning_objectives)}`;

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
      model: "gemma-7b-it",
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content || '';

    return new Response(JSON.stringify({ response }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in clinical-reasoning function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});