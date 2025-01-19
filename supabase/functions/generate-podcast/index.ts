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

  // Check if this is a test request
  const url = new URL(req.url);
  if (url.searchParams.get('test') === 'true') {
    try {
      console.log('Starting API test with timestamp:', new Date().toISOString())
      
      const apiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
      if (!apiKey) {
        throw new Error('ELEVEN_LABS_API_KEY is not set in the environment variables')
      }

      // Test the ElevenLabs API with a minimal request
      console.log('Testing ElevenLabs API connection...')
      const testResponse = await fetch(
        'https://api.elevenlabs.io/v1/voices',
        {
          headers: {
            'Accept': 'application/json',
            'xi-api-key': apiKey,
          },
        }
      )

      if (!testResponse.ok) {
        const errorText = await testResponse.text()
        console.error('ElevenLabs API test failed:', errorText)
        throw new Error(`ElevenLabs API test failed (${testResponse.status}): ${errorText}`)
      }

      const voices = await testResponse.json()
      console.log('ElevenLabs API test successful! Number of voices available:', voices.voices?.length)

      return new Response(
        JSON.stringify({ 
          success: true,
          message: 'API test successful',
          voicesCount: voices.voices?.length
        }),
        { 
          headers: { 
            ...corsHeaders,
            'Content-Type': 'application/json'
          } 
        }
      )

    } catch (error) {
      console.error('Error in API test:', error)
      console.error('Error stack trace:', error.stack)
      return new Response(
        JSON.stringify({ 
          success: false,
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
      )
    }
  }

  try {
    console.log('Starting generate-podcast function with timestamp:', new Date().toISOString())
    
    const apiKey = Deno.env.get('ELEVEN_LABS_API_KEY')
    if (!apiKey) {
      throw new Error('ELEVEN_LABS_API_KEY is not set in the environment variables')
    }

    const { caseStudy, voiceId } = await req.json() as PodcastRequest
    console.log('Received request for voice ID:', voiceId)

    // Create podcast script with proper transitions and structure
    const script = generatePodcastScript(caseStudy)
    console.log('Generated podcast script (first 100 chars):', script.slice(0, 100))

    // Convert text to speech using ElevenLabs
    console.log('Calling ElevenLabs API...')
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
    )

    if (!audioResponse.ok) {
      const errorText = await audioResponse.text()
      console.error('ElevenLabs API error response:', errorText)
      console.error('ElevenLabs API error status:', audioResponse.status)
      console.error('ElevenLabs API error statusText:', audioResponse.statusText)
      throw new Error(`ElevenLabs API error (${audioResponse.status}): ${errorText}`)
    }

    console.log('Successfully received audio from ElevenLabs')

    // Get audio data and convert to base64
    const audioBuffer = await audioResponse.arrayBuffer()
    const audioBase64 = btoa(
      String.fromCharCode(...new Uint8Array(audioBuffer))
    )

    console.log('Successfully converted audio to base64')

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
    console.error('Error in generate-podcast function:', error)
    console.error('Error stack trace:', error.stack)
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