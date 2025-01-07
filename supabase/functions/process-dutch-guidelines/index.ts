import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { LangChainService } from '../process-case-study/utils/langchainService.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { condition } = await req.json();
    console.log('Processing Dutch guidelines for condition:', condition);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const groqApiKey = Deno.env.get('GROQ_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const langchainService = new LangChainService(groqApiKey);

    // Process and structure the guidelines
    const structuredContent = await processGuidelines(condition, langchainService);
    
    // Store in database
    const { data, error } = await supabase
      .from('dutch_guidelines')
      .insert([{
        title: `${condition} Treatment Guidelines`,
        condition: condition,
        url: `https://richtlijnendatabase.nl/search?q=${encodeURIComponent(condition)}`,
        ...structuredContent
      }])
      .select()
      .single();

    if (error) throw error;

    console.log('Successfully processed and stored guidelines for:', condition);
    
    return new Response(JSON.stringify({ success: true, data }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error processing Dutch guidelines:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processGuidelines(condition: string, langchainService: LangChainService) {
  const systemPrompt = `You are a physiotherapy guidelines expert. Analyze and structure the following condition's treatment guidelines:
  - Extract key interventions
  - Identify evidence levels
  - List assessment criteria
  - Compile exercise recommendations
  - Structure into clear sections
  Format the response as structured data suitable for a JSON object.`;

  const response = await langchainService.generateStructuredGuidelines(
    condition,
    systemPrompt
  );

  return {
    content: response.content,
    interventions: response.interventions,
    evidence_levels: response.evidence_levels,
    protocols: response.protocols,
    assessment_criteria: response.assessment_criteria,
    exercise_recommendations: response.exercise_recommendations,
    sections: response.sections,
    grade_evidence: response.grade_evidence
  };
}