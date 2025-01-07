import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { Groq } from "npm:groq-sdk";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GuidelineData {
  title: string;
  condition: string;
  content: {
    key_points: string[];
    recommendations: string[];
    evidence_levels: Record<string, string>;
    interventions: string[];
    assessment_criteria: string[];
  };
  url: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { guidelines } = await req.json();
    console.log('Processing guidelines:', guidelines.length);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const groqApiKey = Deno.env.get('GROQ_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const groq = new Groq({ apiKey: groqApiKey });

    const processedGuidelines = [];

    for (const guideline of guidelines) {
      console.log('Processing guideline:', guideline.title);

      // Generate embedding for the guideline content
      const textForEmbedding = `
        ${guideline.title}
        ${guideline.condition}
        ${JSON.stringify(guideline.content)}
      `.trim();

      const embeddingResponse = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a medical text processing system. Generate a vector embedding for the following text."
          },
          {
            role: "user",
            content: textForEmbedding
          }
        ],
        model: "mixtral-8x7b-32768",
        temperature: 0,
        max_tokens: 1536,
      });

      const embedding = embeddingResponse.choices[0]?.message?.content;

      // Store in database
      const { data, error } = await supabase
        .from('dutch_guidelines')
        .insert([{
          title: guideline.title,
          condition: guideline.condition,
          url: guideline.url,
          content: guideline.content,
          embedding: embedding,
          last_updated: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      processedGuidelines.push(data);
      console.log('Successfully processed and stored guideline:', guideline.title);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: processedGuidelines.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing guidelines:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});