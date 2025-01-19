import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_TEXT_LENGTH = 4000;
const MAX_SECTIONS = 3;

function truncateText(text: string): string {
  if (!text) return '';
  console.log('Truncating text of length:', text.length);
  return text.length <= MAX_TEXT_LENGTH ? text : text.substring(0, MAX_TEXT_LENGTH) + "... [Content truncated for length]";
}

function validateCaseStudy(caseStudy: any): void {
  if (!caseStudy || typeof caseStudy !== 'object') {
    throw new Error('Invalid case study data');
  }
  
  if (!caseStudy.id) {
    throw new Error('Case study ID is required');
  }
}

function generatePodcastScript(caseStudy: any): string {
  console.log('Starting script generation for case study:', caseStudy?.id);
  
  try {
    validateCaseStudy(caseStudy);
    const sections: string[] = [];
    
    // Static intro
    sections.push("Welcome to PhysioCase, your premium source for in-depth physiotherapy case studies and analysis. Today, we'll be exploring an interesting case that highlights key aspects of clinical reasoning and evidence-based practice.");

    // Patient details - simple string operations only
    const patientDetails = [];
    if (caseStudy.patient_name) patientDetails.push(caseStudy.patient_name);
    if (caseStudy.age) patientDetails.push(`${caseStudy.age}-year-old`);
    if (caseStudy.gender) patientDetails.push(caseStudy.gender);
    if (caseStudy.condition) patientDetails.push(`presenting with ${caseStudy.condition}`);

    if (patientDetails.length > 0) {
      sections.push(`Our patient is ${patientDetails.join(' ')}.`);
    }

    // AI Analysis - direct string handling
    if (typeof caseStudy.ai_analysis === 'string' && caseStudy.ai_analysis.trim()) {
      console.log('Adding AI analysis section');
      sections.push(truncateText(caseStudy.ai_analysis));
    }

    // Generated sections - limited processing
    if (Array.isArray(caseStudy.generated_sections)) {
      console.log('Processing generated sections');
      
      for (let i = 0; i < Math.min(caseStudy.generated_sections.length, MAX_SECTIONS); i++) {
        const section = caseStudy.generated_sections[i];
        
        if (section && typeof section === 'object' && 
            typeof section.title === 'string' && 
            typeof section.content === 'string') {
          
          console.log(`Processing section ${i + 1}:`, section.title);
          sections.push(`Next, let's discuss ${section.title}. ${truncateText(section.content)}`);
        }
      }
    }

    // Static outro
    sections.push("Thank you for listening to this PhysioCase study analysis. Remember to apply these insights in your clinical practice and stay tuned for more evidence-based case studies.");

    const finalScript = sections.filter(Boolean).join('\n\n');
    console.log('Final script generated, length:', finalScript.length);
    return finalScript;
    
  } catch (error) {
    console.error('Error in generatePodcastScript:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting generate-podcast function');
    
    const apiKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!apiKey) {
      throw new Error('ELEVEN_LABS_API_KEY is not set');
    }

    const { caseStudy, voiceId } = await req.json();
    
    if (!caseStudy || !voiceId) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating script for case study:', caseStudy.id);
    
    // Generate script with better error handling
    const script = generatePodcastScript(caseStudy);
    const truncatedScript = truncateText(script);
    
    console.log('Script generated, length:', truncatedScript.length);

    // Call ElevenLabs API
    console.log('Calling ElevenLabs API with voice ID:', voiceId);
    const audioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text: truncatedScript,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
            style: 0.7,
            use_speaker_boost: true
          }
        }),
      }
    );

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text();
      console.error('ElevenLabs API error:', errorText);
      throw new Error(`ElevenLabs API error (${audioResponse.status}): ${errorText}`);
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return new Response(
      JSON.stringify({ 
        audio: audioBase64,
        script: truncatedScript 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-podcast function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check the function logs for more information'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
})