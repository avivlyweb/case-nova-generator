import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Medical terms patterns
const patterns = {
  conditions: [
    /(?:chronic|acute)\s+\w+/gi,
    /(?:arthritis|pain|syndrome|disease|disorder|injury|fracture|sprain|strain)\b/gi,
  ],
  symptoms: [
    /(?:pain|ache|weakness|stiffness|swelling|numbness|tingling|fatigue|dizziness)\b/gi,
    /(?:limited|decreased|reduced)\s+(?:range|motion|mobility|strength|function)/gi,
  ],
  medications: [
    /(?:medication|drug|pill|tablet|capsule|injection)\b/gi,
    /(?:anti-inflammatory|analgesic|painkiller|nsaid)\b/gi,
  ],
  procedures: [
    /(?:surgery|operation|procedure|therapy|treatment|assessment|evaluation)\b/gi,
    /(?:physical therapy|rehabilitation|exercise|massage|manipulation)\b/gi,
  ],
  tests: [
    /(?:x-ray|mri|ct scan|ultrasound|imaging|test|examination)\b/gi,
    /(?:range of motion|strength|balance|gait)\s+(?:test|assessment|evaluation)/gi,
  ],
  anatomical: [
    /(?:muscle|joint|bone|ligament|tendon|nerve|spine|back|neck|shoulder|knee|hip|ankle|wrist|elbow)\b/gi,
    /(?:upper|lower)\s+(?:extremity|limb|body)/gi,
  ],
};

function extractEntities(text: string) {
  const entities: Record<string, string[]> = {
    conditions: [],
    symptoms: [],
    medications: [],
    procedures: [],
    tests: [],
    anatomical: [],
  };

  // Extract entities for each category
  Object.entries(patterns).forEach(([category, categoryPatterns]) => {
    const matches = new Set<string>();
    categoryPatterns.forEach(pattern => {
      const found = text.match(pattern);
      if (found) {
        found.forEach(match => matches.add(match.toLowerCase().trim()));
      }
    });
    entities[category] = Array.from(matches);
  });

  return entities;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting medical entity extraction process...');
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all case studies
    const { data: caseStudies, error: fetchError } = await supabase
      .from('case_studies')
      .select('*');

    if (fetchError) {
      console.error('Error fetching case studies:', fetchError);
      throw fetchError;
    }

    console.log(`Processing ${caseStudies?.length || 0} case studies...`);

    for (const study of caseStudies || []) {
      // Combine relevant text fields for entity extraction
      const textToAnalyze = `
        ${study.condition || ''}
        ${study.medical_history || ''}
        ${study.presenting_complaint || ''}
        ${study.assessment_findings || ''}
        ${study.intervention_plan || ''}
      `.trim();

      console.log(`Processing case study ${study.id}`);

      // Extract entities using regex patterns
      const entities = extractEntities(textToAnalyze);
      
      // Update the case study with extracted entities
      const { error: updateError } = await supabase
        .from('case_studies')
        .update({ medical_entities: entities })
        .eq('id', study.id);

      if (updateError) {
        console.error(`Error updating case study ${study.id}:`, updateError);
      } else {
        console.log(`Successfully updated case study ${study.id} with entities:`, entities);
      }
    }

    return new Response(
      JSON.stringify({ message: 'Medical entities extraction completed successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in extract-medical-entities function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});