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
      
      // Get a shorter text sample for testing
      let textToConvert = 'Testing audio generation.';
      
      console.log('Starting audio generation with text:', textToConvert);

      // Initialize Kokoro TTS
      console.log('Initializing TTS...');
      const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
        dtype: "q8", // Use quantized model for better performance
      });
      console.log('TTS initialized successfully');

      // Generate audio
      console.log('Generating audio...');
      const audio = await tts.generate(textToConvert, {
        voice: "af_bella", // Use Bella voice (American Female)
      });
      console.log('Audio generated:', audio);

      if (!audio || !audio.buffer) {
        throw new Error('Generated audio is invalid');
      }

      // Convert the audio data to a format that can be played
      console.log('Creating audio blob...');
      const blob = new Blob([audio.buffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(blob);
      console.log('Audio URL created:', audioUrl);

      // Create an audio element and play it
      const audioElement = new Audio(audioUrl);
      console.log('Playing audio...');
      audioElement.play();

      // Clean up the URL when the audio is done playing
      audioElement.onended = () => {
        console.log('Audio playback completed');
        URL.revokeObjectURL(audioUrl);
      };
      
      toast({
        title: "Success",
        description: "Audio has been generated and is now playing.",
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