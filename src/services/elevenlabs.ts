import { supabase } from "@/integrations/supabase/client";

export interface TextToSpeechRequest {
  text: string;
  model_id?: string;
  voice_settings?: {
    stability: number;
    similarity_boost: number;
  };
}

export const convertTextToSpeech = async (
  text: string,
  voiceId: string
): Promise<ArrayBuffer> => {
  // Get the API key from Supabase secrets
  const { data, error } = await supabase
    .functions.invoke('get-secret', {
      body: { name: 'ELEVEN_LABS_API_KEY' }
    });

  if (error || !data?.secret) {
    console.error("Error fetching API key:", error);
    throw new Error("Failed to retrieve ElevenLabs API key. Please ensure it's set in Supabase secrets.");
  }

  console.log("Making request to ElevenLabs API...");
  
  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": data.secret,
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error("ElevenLabs API error:", errorData);
    throw new Error(
      errorData.detail?.[0]?.message || 
      errorData.detail?.message ||
      errorData.detail || 
      "Failed to convert text to speech"
    );
  }

  return await response.arrayBuffer();
};

export const ELEVEN_LABS_VOICES = [
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie (Medical)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (Clinical)" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (Professional)" },
];