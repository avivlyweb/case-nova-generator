import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PodcastRequest {
  caseStudy: {
    id: string;
    sections: Array<{ title: string; content: string }>;
    analysis: string;
  };
  voiceId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    // Get ElevenLabs API key
    const { data: secretData, error: secretError } = await supabaseClient
      .from('secrets')
      .select('value')
      .eq('name', 'ELEVEN_LABS_API_KEY')
      .single()

    if (secretError || !secretData) {
      console.error('Failed to retrieve ElevenLabs API key:', secretError)
      throw new Error('Failed to retrieve ElevenLabs API key')
    }

    const { caseStudy, voiceId } = await req.json() as PodcastRequest

    // Create podcast script with proper transitions and structure
    const script = generatePodcastScript(caseStudy)
    console.log('Generated podcast script:', script.slice(0, 100) + '...')

    // Convert text to speech using ElevenLabs
    const audioResponse = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': secretData.value,
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
    )

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text()
      console.error('ElevenLabs API error:', errorText)
      throw new Error(`ElevenLabs API error: ${errorText}`)
    }

    // Get audio data and convert to base64
    const audioBuffer = await audioResponse.arrayBuffer()
    const audioBase64 = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    )

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
    )

  } catch (error) {
    console.error('Error generating podcast:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})

function generatePodcastScript(caseStudy: PodcastRequest['caseStudy']): string {
  const intro = `Welcome to PhysioCase, your premium source for in-depth physiotherapy case studies and analysis. Today, we'll be exploring an interesting case that highlights key aspects of clinical reasoning and evidence-based practice.`

  const analysis = `Let's start with an overview of the case. ${caseStudy.analysis}`

  const sections = caseStudy.sections.map(section => {
    return `Now, let's dive into ${section.title}. ${section.content}`
  }).join('\n\nMoving on.\n\n')

  const outro = `Thank you for listening to this PhysioCase study analysis. Remember to apply these insights in your clinical practice and stay tuned for more evidence-based case studies.`

  return [
    intro,
    analysis,
    sections,
    outro
  ].join('\n\n')
}