import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AudioLines, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
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

      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: { 
          text: textToConvert,
          sectionId: `${study.id}/${sectionId}`
        }
      });

      if (error) {
        console.error('Error generating audio:', error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to generate audio. Please try again.",
        });
        return;
      }

      // Open the audio URL in a new tab
      window.open(data.url, '_blank');
      
      toast({
        title: "Success",
        description: "Audio has been generated successfully.",
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