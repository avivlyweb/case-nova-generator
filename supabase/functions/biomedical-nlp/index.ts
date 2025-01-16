import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple medical entity patterns
const entityPatterns = {
  conditions: [
    /(?:chronic\s+)?(?:low\s+back\s+pain|lbp|back\s+pain)/gi,
    /(?:osteo)?arthritis/gi,
    /tendin(?:itis|osis|opathy)/gi,
    /sprain|strain/gi,
    /fracture/gi,
  ],
  symptoms: [
    /pain|ache/gi,
    /stiffness/gi,
    /swelling/gi,
    /weakness/gi,
    /numbness|tingling/gi,
  ],
  anatomical_sites: [
    /(?:cervical|thoracic|lumbar)\s+spine/gi,
    /shoulder|elbow|wrist|hand/gi,
    /hip|knee|ankle|foot/gi,
    /joint|muscle|tendon|ligament/gi,
  ],
  measurements: [
    /\d+\s*(?:degrees?|°)/gi,
    /\d+\/10/gi,
    /\d+\s*(?:kg|lbs?|pounds?)/gi,
    /range\s+of\s+motion|ROM/gi,
  ]
};

function findEntities(text: string) {
  const entities: Record<string, Array<{word: string, index: number}>> = {};
  
  for (const [category, patterns] of Object.entries(entityPatterns)) {
    entities[category] = [];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        entities[category].push({
          word: match[0],
          index: match.index
        });
      }
    }
  }
  
  return entities;
}

function classifyText(text: string): string[] {
  const classifications = [];
  
  // Simple rule-based classification
  if (/pain|discomfort|ache/i.test(text)) {
    classifications.push('pain_related');
  }
  if (/movement|mobility|range|motion/i.test(text)) {
    classifications.push('movement_related');
  }
  if (/strength|weakness|power/i.test(text)) {
    classifications.push('strength_related');
  }
  if (/balance|coordination|stability/i.test(text)) {
    classifications.push('balance_related');
  }
  if (/daily|ADL|activity|function/i.test(text)) {
    classifications.push('functional_activity');
  }
  
  return classifications;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, task = 'ner' } = await req.json()

    console.log(`Processing ${task} for text:`, text)

    let result;
    switch (task) {
      case 'ner':
        // Named Entity Recognition
        result = findEntities(text);
        break;
      
      case 'text-classification':
        // Text Classification
        result = classifyText(text);
        break;
      
      case 'token-classification':
        // Token Classification (simplified)
        result = {
          tokens: text.split(/\s+/).map((token, index) => ({
            token,
            index,
            classifications: classifyText(token)
          }))
        };
        break;

      default:
        throw new Error(`Unsupported task: ${task}`);
    }

    console.log(`Processing complete. Result:`, result)

    return new Response(
      JSON.stringify({ result }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in biomedical-nlp function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})