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

    console.log('Generating audio for text:', text.substring(0, 100) + '...')

    // Initialize WebAssembly for ONNX Web Runtime
    const wasmResponse = await fetch('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.16.3/dist/ort-wasm.wasm');
    const wasmBytes = await wasmResponse.arrayBuffer();
    
    // Initialize ONNX Web Runtime session
    const session = await WebAssembly.instantiate(wasmBytes);
    
    // Convert text to audio using ONNX Web Runtime
    const inputTensor = new Float32Array(text.split('').map(char => char.charCodeAt(0)));
    const outputs = await session.exports.main(inputTensor);
    const audioData = new Float32Array(outputs.buffer);

    // Create WAV file from audio data
    const sampleRate = 24000;
    const wavBuffer = new ArrayBuffer(44 + audioData.length * 2);
    const view = new DataView(wavBuffer);

    // Write WAV header
    const writeString = (view: DataView, offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };

    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + audioData.length * 2, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, 'data');
    view.setUint32(40, audioData.length * 2, true);

    // Write audio data
    for (let i = 0; i < audioData.length; i++) {
      view.setInt16(44 + i * 2, audioData[i] * 32767, true);
    }

    // Create Supabase client
    console.log('Creating Supabase client...')
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Save audio to storage
    console.log('Saving audio to storage...')
    const filePath = `case-studies/${sectionId}/audio.wav`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('knowledgecase')
      .upload(filePath, new Uint8Array(wavBuffer), {
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