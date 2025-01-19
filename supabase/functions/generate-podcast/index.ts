import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PodcastRequest {
  caseStudy: {
    id: string;
    sections?: Array<{ title: string; content: string }>;
    analysis?: string;
  };
  voiceId: string;
}

const MAX_CHUNK_LENGTH = 4000; // Safe limit well below the 10,000 credit limit

function truncateText(text: string): string {
  if (text.length <= MAX_CHUNK_LENGTH) return text;
  return text.substring(0, MAX_CHUNK_LENGTH) + "... [Content truncated for length]";
}

function generatePodcastScript(caseStudy: PodcastRequest['caseStudy']): string {
  const intro = `Welcome to PhysioCase, your premium source for in-depth physiotherapy case studies and analysis. Today, we'll be exploring an interesting case that highlights key aspects of clinical reasoning and evidence-based practice.`;

  const analysis = caseStudy.analysis ? 
    `Let's start with an overview of the case. ${truncateText(caseStudy.analysis)}` : 
    '';

  // Take only the first few most important sections to stay within limits
  const sections = (caseStudy.sections || [])
    .slice(0, 3) // Limit to first 3 sections
    .map(section => {
      return `Now, let's discuss ${section.title}. ${truncateText(section.content)}`;
    })
    .join('\n\nMoving on.\n\n');

  const outro = `Thank you for listening to this PhysioCase study analysis. Remember to apply these insights in your clinical practice and stay tuned for more evidence-based case studies.`;

  const fullScript = [
    intro,
    analysis,
    sections,
    outro
  ].join('\n\n');

  return truncateText(fullScript);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Starting generate-podcast function with timestamp:', new Date().toISOString());
    
    const apiKey = Deno.env.get('ELEVEN_LABS_API_KEY');
    if (!apiKey) {
      throw new Error('ELEVEN_LABS_API_KEY is not set in the environment variables');
    }

    const { caseStudy, voiceId } = await req.json() as PodcastRequest;
    console.log('Received request for voice ID:', voiceId);

    // Generate podcast script with length limits
    const script = generatePodcastScript(caseStudy);
    console.log('Generated podcast script length:', script.length);

    // Convert text to speech using ElevenLabs
    console.log('Calling ElevenLabs API...');
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
          text: script,
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
      console.error('ElevenLabs API error response:', errorText);
      throw new Error(`ElevenLabs API error (${audioResponse.status}): ${errorText}`);
    }

    console.log('Successfully received audio from ElevenLabs');

    // Get audio data and convert to base64
    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBase64 = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    );

    console.log('Successfully converted audio to base64');

    return new Response(
      JSON.stringify({ 
        audio: audioBase64,
        script: script 
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    );

  } catch (error) {
    console.error('Error in generate-podcast function:', error);
    console.error('Error stack trace:', error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check the function logs for more information'
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
})