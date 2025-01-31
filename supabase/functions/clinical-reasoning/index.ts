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
    const { question, caseContext, learningHistory } = await req.json();

    const systemPrompt = `You are an expert physiotherapy clinical educator. Your role is to guide students through clinical reasoning using the HOAC II framework.

Current case context:
${caseContext}

Previous interactions:
${JSON.stringify(learningHistory)}

Guidelines for responses:
1. Respond as a patient would in a real clinical setting
2. Challenge premature conclusions
3. Emphasize psychosocial factors
4. Require justification for clinical decisions
5. Provide feedback on clinical reasoning
6. Guide towards evidence-based practice

If the student:
- Jumps to conclusions: Ask for evidence and differential diagnosis
- Ignores psychosocial factors: Prompt consideration of these aspects
- Makes vague statements: Request specific, measurable criteria
- Skips important tests: Ask why certain tests weren't considered`;

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