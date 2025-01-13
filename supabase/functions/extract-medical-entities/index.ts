import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Groq } from 'npm:groq-sdk';
import { extractEntities } from './utils/entityExtraction.ts';
import { buildEntityExtractionText } from './utils/textProcessing.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Only process the case study ID that was passed in the request
    const { caseStudyId } = await req.json();
    
    if (!caseStudyId) {
      throw new Error('No case study ID provided');
    }

    console.log(`Processing case study ${caseStudyId}`);

    const { data: caseStudy, error: fetchError } = await supabase
      .from('case_studies')
      .select('*')
      .eq('id', caseStudyId)
      .single();

    if (fetchError) {
      throw fetchError;
    }

    if (!caseStudy) {
      throw new Error(`Case study ${caseStudyId} not found`);
    }

    // Skip if medical entities already exist
    if (caseStudy.medical_entities && caseStudy.medical_entities.length > 0) {
      console.log(`Case study ${caseStudyId} already has medical entities`);
      return new Response(
        JSON.stringify({ 
          message: 'Case study already has medical entities',
          entities: caseStudy.medical_entities 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const groq = new Groq({
      apiKey: Deno.env.get('GROQ_API_KEY')
    });

    const textToAnalyze = buildEntityExtractionText(caseStudy);
    console.log(`Extracting entities for case study ${caseStudyId}`);
    
    const entities = await extractEntities(textToAnalyze, groq);
    
    const { error: updateError } = await supabase
      .from('case_studies')
      .update({ medical_entities: entities })
      .eq('id', caseStudyId);

    if (updateError) {
      throw updateError;
    }

    console.log(`Successfully updated case study ${caseStudyId} with entities:`, entities);

    return new Response(
      JSON.stringify({ 
        message: 'Medical entities extraction completed successfully',
        entities 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Error in extract-medical-entities function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack
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