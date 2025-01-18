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
  try {
    console.log("Fetching ElevenLabs API key from secrets...");
    
    const { data, error } = await supabase
      .functions.invoke('get-secret', {
        body: { name: 'ELEVEN_LABS_API_KEY' }
      });

    if (error) {
      console.error("Error fetching API key:", error);
      throw new Error("Failed to retrieve ElevenLabs API key");
    }

    if (!data?.secret) {
      console.error("API key not found in response:", data);
      throw new Error("ElevenLabs API key not found in response");
    }

    console.log("Successfully retrieved API key, making request to ElevenLabs...");
    
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
      console.error("ElevenLabs API error response:", errorData);
      throw new Error(
        errorData.detail?.[0]?.message || 
        errorData.detail?.message ||
        errorData.detail || 
        `Failed to convert text to speech (Status: ${response.status})`
      );
    }

    console.log("Successfully generated audio from ElevenLabs API");
    return await response.arrayBuffer();
  } catch (error) {
    console.error("Error in convertTextToSpeech:", error);
    throw error;
  }
};

export const ELEVEN_LABS_VOICES = [
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie (Medical)" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah (Clinical)" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George (Professional)" },
];