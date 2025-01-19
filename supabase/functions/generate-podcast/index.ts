import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Content-Type': 'application/json'
}

const MAX_TEXT_LENGTH = 4000;

function truncateText(text: string): string {
  if (!text) return '';
  if (text.length <= MAX_TEXT_LENGTH) return text;
  return text.substring(0, MAX_TEXT_LENGTH) + "... [Content truncated for length]";
}

function generatePodcastScript(caseStudy: any): string {
  try {
    const sections = [];

    // Add intro
    sections.push(`Welcome to PhysioCase, your premium source for in-depth physiotherapy case studies and analysis. Today, we'll be exploring an interesting case that highlights key aspects of clinical reasoning and evidence-based practice.`);

    // Add patient info if available
    if (caseStudy.patient_name && caseStudy.age && caseStudy.gender && caseStudy.condition) {
      sections.push(`Our patient is ${caseStudy.patient_name}, a ${caseStudy.age}-year-old ${caseStudy.gender} presenting with ${caseStudy.condition}.`);
    }

    // Add main analysis if available
    if (typeof caseStudy.ai_analysis === 'string' && caseStudy.ai_analysis.trim()) {
      sections.push(caseStudy.ai_analysis);
    }

    // Add up to 2 sections from generated_sections if available
    if (Array.isArray(caseStudy.generated_sections)) {
      const limitedSections = caseStudy.generated_sections.slice(0, 2);
      for (const section of limitedSections) {
        if (section.title && section.content) {
          sections.push(`Next, let's discuss ${section.title}. ${section.content}`);
        }
      }
    }

    // Add outro
    sections.push(`Thank you for listening to this PhysioCase study analysis. Remember to apply these insights in your clinical practice and stay tuned for more evidence-based case studies.`);

    // Join all sections with proper spacing and return
    return sections.filter(Boolean).join('\n\n');
  } catch (error) {
    console.error('Error generating podcast script:', error);
    throw new Error('Failed to generate podcast script');
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('Generating script for case study:', caseStudy.id);
    
    // Generate and truncate script
    const script = generatePodcastScript(caseStudy);
    const truncatedScript = truncateText(script);
    
    console.log('Script length:', truncatedScript.length);

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

    // Get audio data and convert to base64
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));

    return new Response(
      JSON.stringify({ 
        audio: audioBase64,
        script: truncatedScript 
      }),
      { headers: corsHeaders }
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
        headers: corsHeaders
      }
    );
  }
})