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

    console.log('Starting audio generation process...')
    console.log('Input text length:', text.length)
    console.log('Section ID:', sectionId)

    // Create a simple audio file using Web Audio API concepts
    const sampleRate = 24000
    const duration = Math.min(text.length * 0.1, 30) // 0.1 seconds per character, max 30 seconds
    const numSamples = Math.floor(sampleRate * duration)
    
    // Generate a simple sine wave
    const audioData = new Float32Array(numSamples)
    const frequency = 440 // A4 note
    for (let i = 0; i < numSamples; i++) {
      audioData[i] = Math.sin((2 * Math.PI * frequency * i) / sampleRate)
    }

    // Convert to WAV format
    const wavData = new ArrayBuffer(44 + audioData.length * 2)
    const view = new DataView(wavData)
    
    // WAV header
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + audioData.length * 2, true)
    writeString(view, 8, 'WAVE')
    writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true)
    view.setUint16(20, 1, true)
    view.setUint16(22, 1, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * 2, true)
    view.setUint16(32, 2, true)
    view.setUint16(34, 16, true)
    writeString(view, 36, 'data')
    view.setUint32(40, audioData.length * 2, true)

    // Write audio data
    for (let i = 0; i < audioData.length; i++) {
      const s = Math.max(-1, Math.min(1, audioData[i]))
      view.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true)
    }

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
      .upload(filePath, new Uint8Array(wavData), {
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