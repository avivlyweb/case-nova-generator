import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Groq } from 'npm:groq-sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function extractEntities(text: string, groq: Groq, retryCount = 0): Promise<any> {
  console.log('Starting entity extraction for text:', text.substring(0, 100) + '...');
  
  const maxRetries = 3;
  const baseDelay = 2000; // 2 seconds

  try {
    const prompt = `Extract and categorize medical entities from the following clinical text into these specific categories:

    - Clinical Diagnoses (specific medical conditions, disorders, pathologies)
    - Clinical Signs & Symptoms (objective and subjective manifestations)
    - Therapeutic Interventions (medications, treatments, procedures)
    - Diagnostic Procedures (tests, imaging, assessments)
    - Anatomical Structures (specific body parts, systems)
    - Physiological Parameters (measurements, vital signs)

    For each entity:
    1. Use precise medical terminology
    2. Include relevant clinical context or measurements in parentheses
    3. Standardize terminology to medical nomenclature
    4. Add brief clinical significance note

    Text to analyze:
    ${text}

    Return a JSON object with these exact keys:
    {
      "diagnoses": [],
      "symptoms": [],
      "interventions": [],
      "diagnostics": [],
      "anatomical": [],
      "physiological": []
    }

    Each array should contain strings with the format: "term (context/measurement) [clinical significance]"
    Only include entities explicitly mentioned in the text.`;

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a clinical terminology expert with deep knowledge of medical nomenclature and biomedical concepts. Extract and categorize medical terms using standardized clinical terminology, adding relevant context and clinical significance notes. Always return valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      model: "gemma2-9b-it",
      temperature: 0.1,
      max_tokens: 1000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      console.error('No response from Groq');
      throw new Error('No response from Groq');
    }

    console.log('Raw response from Groq:', response);

    const cleanedResponse = response.replace(/```json\n|\n```/g, '').trim();
    console.log('Cleaned response:', cleanedResponse);

    try {
      const parsedEntities = JSON.parse(cleanedResponse);
      console.log('Successfully parsed entities:', parsedEntities);
      return parsedEntities;
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      return {
        diagnoses: [],
        symptoms: [],
        interventions: [],
        diagnostics: [],
        anatomical: [],
        physiological: []
      };
    }
  } catch (error) {
    console.error(`Error in entity extraction (attempt ${retryCount + 1}):`, error);
    
    // Check if it's a rate limit error
    if (error.message?.includes('rate_limit_exceeded')) {
      if (retryCount < maxRetries) {
        const delay = baseDelay * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Rate limit hit. Retrying in ${delay}ms...`);
        await sleep(delay);
        return extractEntities(text, groq, retryCount + 1);
      }
    }
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting medical entity extraction process...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const groq = new Groq({
      apiKey: Deno.env.get('GROQ_API_KEY')
    });

    const { data: caseStudies, error: fetchError } = await supabase
      .from('case_studies')
      .select('*')
      .is('medical_entities', null);  // Only process cases without entities

    if (fetchError) {
      console.error('Error fetching case studies:', fetchError);
      throw fetchError;
    }

    console.log(`Processing ${caseStudies?.length || 0} case studies...`);

    // Process in smaller batches
    const batchSize = 5;
    const batches = [];
    for (let i = 0; i < (caseStudies?.length || 0); i += batchSize) {
      batches.push(caseStudies!.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      await Promise.all(batch.map(async (study) => {
        const textToAnalyze = `
          ${study.condition || ''}
          ${study.medical_history || ''}
          ${study.presenting_complaint || ''}
          ${study.assessment_findings || ''}
          ${study.intervention_plan || ''}
        `.trim();

        console.log(`Processing case study ${study.id}`);

        if (!textToAnalyze) {
          console.log(`Skipping case study ${study.id} - no text to analyze`);
          return;
        }

        try {
          const entities = await extractEntities(textToAnalyze, groq);
          
          const { error: updateError } = await supabase
            .from('case_studies')
            .update({ medical_entities: entities })
            .eq('id', study.id);

          if (updateError) {
            console.error(`Error updating case study ${study.id}:`, updateError);
          } else {
            console.log(`Successfully updated case study ${study.id} with entities:`, entities);
          }
        } catch (error) {
          console.error(`Error processing case study ${study.id}:`, error);
        }

        // Add a small delay between processing items in the batch
        await sleep(500);
      }));

      // Add a delay between batches
      await sleep(1000);
    }

    return new Response(
      JSON.stringify({ message: 'Medical entities extraction completed successfully' }),
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