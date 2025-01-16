import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { pipeline } from "@huggingface/transformers";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, task = 'ner' } = await req.json()

    console.log(`Processing ${task} for text:`, text)

    // Initialize the pipeline based on task
    const classifier = await pipeline(
      task,
      "microsoft/BiomedNLP-PubMedBERT-base-uncased-abstract-fulltext"
    );

    let result;
    switch (task) {
      case 'ner':
        // Named Entity Recognition for medical terms
        result = await classifier(text, {
          aggregation_strategy: "simple"
        });
        break;
      
      case 'text-classification':
        // Classify the medical text into categories
        result = await classifier(text);
        break;
      
      case 'token-classification':
        // Detailed token analysis for medical terms
        result = await classifier(text, {
          aggregation_strategy: "simple"
        });
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