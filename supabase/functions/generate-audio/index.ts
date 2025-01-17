import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'
import * as ort from "npm:onnxruntime-node"

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

    // Download model at runtime instead of bundling
    const modelResponse = await fetch(
      'https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/kokoro-v0_19.onnx'
    );
    const modelArrayBuffer = await modelResponse.arrayBuffer();

    // Initialize ONNX session with the downloaded model
    console.log('Initializing ONNX session...')
    const session = await ort.InferenceSession.create(
      new Uint8Array(modelArrayBuffer)
    );

    // Prepare input tensor
    console.log('Preparing input tensor...')
    const encoder = new TextEncoder();
    const inputBytes = encoder.encode(text);
    const inputTensor = new ort.Tensor('float32', new Float32Array(inputBytes), [1, inputBytes.length]);

    // Run inference
    console.log('Running inference...')
    const results = await session.run({
      'input': inputTensor
    });

    const outputTensor = results['output'];
    const audioData = outputTensor.data;

    // Create Supabase client
    console.log('Creating Supabase client...')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Save audio to storage
    console.log('Saving audio to storage...')
    const audioBuffer = new Uint8Array(audioData);
    const filePath = `case-studies/${sectionId}/audio.wav`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('knowledgecase')
      .upload(filePath, audioBuffer, {
        contentType: 'audio/wav',
        upsert: true
      })

    if (uploadError) {
      console.error('Upload error:', uploadError);
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