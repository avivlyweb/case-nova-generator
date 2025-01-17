import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

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
    const { text, sectionId } = await req.json()
    
    if (!text) {
      throw new Error('No text provided')
    }

    console.log('Starting audio generation process with Kokoro-82M...')
    console.log('Input text length:', text.length)
    console.log('Section ID:', sectionId)

    // Call Kokoro API
    const response = await fetch('https://api.kokoro.ai/v1/tts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('KOKORO_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        model: 'kokoro-82m',
        voice: 'en-US-1', // You can change this to other available voices
        format: 'wav',
        speed: 1.0,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Kokoro API error:', errorText);
      throw new Error(`Failed to generate audio: ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();

    // Create Supabase client
    console.log('Initializing Supabase client...')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Save audio to storage
    console.log('Uploading to Supabase storage...')
    const filePath = `case-studies/${sectionId}/audio.wav`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('knowledgecase')
      .upload(filePath, new Uint8Array(audioBuffer), {
        contentType: 'audio/wav',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError)
      throw new Error(`Failed to upload audio: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('knowledgecase')
      .getPublicUrl(filePath)

    console.log('Audio generated and uploaded successfully:', publicUrl)

    return new Response(
      JSON.stringify({
        url: publicUrl,
        message: 'Audio generated successfully'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )

  } catch (error) {
    console.error('Error handling request:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to generate audio'
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        },
        status: 500
      }
    )
  }
})