import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import { InferenceSession } from "https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/esm/ort.min.js"

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

    console.log('Generating audio for text:', text.substring(0, 100) + '...')

    // Download ONNX model if not already in cache
    const modelResponse = await fetch('https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/kokoro-v0_19.onnx');
    const modelArrayBuffer = await modelResponse.arrayBuffer();

    // Initialize ONNX session with the downloaded model
    const session = await InferenceSession.create(new Uint8Array(modelArrayBuffer), {
      executionProviders: ['wasm']
    });

    // Prepare input tensor
    const encoder = new TextEncoder();
    const inputBytes = encoder.encode(text);
    const inputTensor = new Float32Array(inputBytes);

    // Run inference
    const results = await session.run({
      'input': new Float32Array(inputTensor)
    });

    const audioData = results.output.data;

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Save audio to storage
    const audioBuffer = new Uint8Array(audioData);
    const filePath = `case-studies/${sectionId}/audio.wav`

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('audio_files')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/wav',
        upsert: true
      })

    if (uploadError) {
      throw new Error(`Failed to upload audio: ${uploadError.message}`)
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('audio_files')
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
    console.error('Error generating audio:', error)
    
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