import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AudioLines, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KokoroTTS } from 'kokoro-js';
import { CaseStudy } from '@/types/case-study';

interface GenerateAudioButtonProps {
  study: CaseStudy;
  sectionId?: string;
}

const GenerateAudioButton = ({ study, sectionId = 'summary' }: GenerateAudioButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      
      // Use a very short test text to minimize processing requirements
      const textToConvert = 'Test.';
      
      console.log('Starting audio generation with text:', textToConvert);

      // Initialize Kokoro TTS with minimal configuration
      console.log('Initializing TTS...');
      const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
        dtype: "q8",
      });
      
      console.log('TTS initialized successfully');

      // Generate audio with basic settings
      console.log('Generating audio...');
      const audio = await tts.generate(textToConvert, {
        voice: "af_bella",
        speed: 1.0,
      });
      
      console.log('Audio generated, raw data:', audio);

      // Convert audio data to a format we can play
      const audioData = new Float32Array(audio.buffer);
      const sampleRate = 22050; // Standard sample rate for Kokoro
      
      // Create AudioContext with proper type handling
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      const audioBuffer = audioContext.createBuffer(1, audioData.length, sampleRate);
      
      // Fill the buffer with our audio data
      audioBuffer.getChannelData(0).set(audioData);
      
      // Create audio source and play
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      console.log('Audio playback started');

      // Clean up when done
      source.onended = () => {
        console.log('Audio playback completed');
        audioContext.close();
      };
      
      toast({
        title: "Success",
        description: "Audio is now playing.",
      });
    } catch (error) {
      console.error('Error generating audio:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate audio. Please try again.",
      });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button
      onClick={handleGenerate}
      disabled={generating}
      variant="outline"
      size="lg"
      className="w-full sm:w-auto bg-white hover:bg-gray-50 border-primary-200 hover:border-primary-300 text-primary-700 hover:text-primary-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
    >
      {generating ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generating Audio...
        </>
      ) : (
        <>
          <AudioLines className="mr-2 h-4 w-4" />
          Generate Audio
        </>
      )}
    </Button>
  );
};

export default GenerateAudioButton;