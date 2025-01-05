import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { pipeline } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get all case studies
    const { data: caseStudies, error: fetchError } = await supabase
      .from('case_studies')
      .select('*');

    if (fetchError) throw fetchError;

    // Initialize the NER pipeline with BiomedNLP model
    const ner = await pipeline(
      "token-classification",
      "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext",
      { aggregation_strategy: "simple" }
    );

    console.log('Processing case studies...');

    for (const study of caseStudies) {
      // Combine relevant text fields for entity extraction
      const textToAnalyze = `
        ${study.condition || ''}
        ${study.medical_history || ''}
        ${study.presenting_complaint || ''}
        ${study.assessment_findings || ''}
        ${study.intervention_plan || ''}
      `.trim();

      console.log(`Processing case study ${study.id}`);

      // Extract entities
      const entities = await ner(textToAnalyze);
      
      // Organize entities by category
      const organizedEntities = {
        conditions: [],
        symptoms: [],
        medications: [],
        procedures: [],
        tests: [],
        anatomical: []
      };

      // Categorize entities based on their labels
      entities.forEach((entity: any) => {
        const text = entity.word.toLowerCase();
        const score = entity.score;
        const label = entity.entity_group;

        // Only include entities with high confidence
        if (score > 0.8) {
          if (label.includes('DISEASE') || label.includes('CONDITION')) {
            if (!organizedEntities.conditions.includes(text)) {
              organizedEntities.conditions.push(text);
            }
          } else if (label.includes('SYMPTOM')) {
            if (!organizedEntities.symptoms.includes(text)) {
              organizedEntities.symptoms.push(text);
            }
          } else if (label.includes('DRUG') || label.includes('MEDICATION')) {
            if (!organizedEntities.medications.includes(text)) {
              organizedEntities.medications.push(text);
            }
          } else if (label.includes('PROCEDURE')) {
            if (!organizedEntities.procedures.includes(text)) {
              organizedEntities.procedures.push(text);
            }
          } else if (label.includes('TEST')) {
            if (!organizedEntities.tests.includes(text)) {
              organizedEntities.tests.push(text);
            }
          } else if (label.includes('ANATOMY')) {
            if (!organizedEntities.anatomical.includes(text)) {
              organizedEntities.anatomical.push(text);
            }
          }
        }
      });

      // Update the case study with extracted entities
      const { error: updateError } = await supabase
        .from('case_studies')
        .update({ medical_entities: organizedEntities })
        .eq('id', study.id);

      if (updateError) {
        console.error(`Error updating case study ${study.id}:`, updateError);
      } else {
        console.log(`Successfully updated case study ${study.id}`);
      }
    }

    return new Response(
      JSON.stringify({ message: 'Medical entities extraction completed' }),
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