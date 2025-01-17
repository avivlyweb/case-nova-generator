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
      
      // Get the text to convert to audio
      let textToConvert = '';
      if (sectionId === 'summary') {
        textToConvert = study.ai_analysis || '';
      } else {
        // Safely type check and cast the generated_sections
        const sections = study.generated_sections as Array<{ id: string; content: string }> || [];
        const section = sections.find(s => s.id === sectionId);
        textToConvert = section?.content || '';
      }

      if (!textToConvert) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "No text content available to generate audio.",
        });
        return;
      }

      // Initialize Kokoro TTS
      const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
        dtype: "q8", // Use quantized model for better performance
      });

      // Generate audio
      const audio = await tts.generate(textToConvert, {
        voice: "af_bella", // Use Bella voice (American Female)
      });

      // Create an audio blob and URL
      const audioBlob = new Blob([audio.buffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Create an audio element and play it
      const audioElement = new Audio(audioUrl);
      audioElement.play();

      // Clean up the URL when the audio is done playing
      audioElement.onended = () => {
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
        description: "Failed to generate audio. Please try again.",
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