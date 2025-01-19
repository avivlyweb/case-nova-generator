import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MAX_TEXT_LENGTH = 4000;

function truncateText(text: string): string {
  if (!text) return '';
  if (text.length <= MAX_TEXT_LENGTH) return text;
  return text.substring(0, MAX_TEXT_LENGTH) + "... [Content truncated for length]";
}

function generatePodcastScript(caseStudy: any): string {
  try {
    if (!caseStudy || typeof caseStudy !== 'object') {
      throw new Error('Invalid case study data');
    }

    const sections: string[] = [];
    
    // Add intro (static text, no recursion risk)
    sections.push("Welcome to PhysioCase, your premium source for in-depth physiotherapy case studies and analysis. Today, we'll be exploring an interesting case that highlights key aspects of clinical reasoning and evidence-based practice.");

    // Safely add patient info
    const patientInfo = [
      caseStudy.patient_name,
      caseStudy.age ? `${caseStudy.age}-year-old` : '',
      caseStudy.gender,
      caseStudy.condition ? `presenting with ${caseStudy.condition}` : ''
    ].filter(Boolean).join(' ');

    if (patientInfo.trim()) {
      sections.push(`Our patient is ${patientInfo}.`);
    }

    // Safely add analysis
    if (typeof caseStudy.ai_analysis === 'string' && caseStudy.ai_analysis.trim()) {
      sections.push(truncateText(caseStudy.ai_analysis));
    }

    // Safely add generated sections
    if (Array.isArray(caseStudy.generated_sections)) {
      const validSections = caseStudy.generated_sections
        .slice(0, 2) // Limit to 2 sections
        .filter(section => 
          section && 
          typeof section === 'object' && 
          typeof section.title === 'string' &&
          typeof section.content === 'string'
        )
        .map(section => 
          `Next, let's discuss ${section.title}. ${truncateText(section.content)}`
        );
      
      sections.push(...validSections);
    }

    // Add outro (static text, no recursion risk)
    sections.push("Thank you for listening to this PhysioCase study analysis. Remember to apply these insights in your clinical practice and stay tuned for more evidence-based case studies.");

    // Join sections with proper spacing and return
    return sections.filter(Boolean).join('\n\n');
  } catch (error) {
    console.error('Error generating podcast script:', error);
    throw new Error(`Failed to generate podcast script: ${error.message}`);
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