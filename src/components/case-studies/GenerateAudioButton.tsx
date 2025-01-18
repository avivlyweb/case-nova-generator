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

type KokoroVoice = "am_michael" | "af_sarah" | "af" | "af_bella" | "af_nicole" | "af_sky" | "am_adam" | "bf_emma" | "bf_isabella" | "bm_george" | "bm_lewis";

interface DialogueLine {
  voice: KokoroVoice;
  text: string;
}

const GenerateAudioButton = ({ study, sectionId = 'summary' }: GenerateAudioButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const createPodcastScript = (study: CaseStudy): DialogueLine[] => {
    const dialogue: DialogueLine[] = [];
    
    // Introduction
    dialogue.push({
      voice: "am_michael",
      text: `Welcome to today's case study discussion. I'm Dr. Michael, and I'll be presenting an interesting case about ${study.patient_name}.`
    });

    dialogue.push({
      voice: "af_sarah",
      text: `Hello Dr. Michael, I'm Dr. Sarah. I'm looking forward to analyzing this case with you.`
    });

    // Patient Overview
    dialogue.push({
      voice: "am_michael",
      text: `Our patient is ${study.patient_name}, a ${study.age}-year-old ${study.gender}. They presented with ${study.presenting_complaint}.`
    });

    if (study.medical_history) {
      dialogue.push({
        voice: "af_sarah",
        text: `That's interesting. Looking at their medical history, I notice ${study.medical_history}. What are your thoughts on how this affects their current condition?`
      });
    }

    // Analysis Discussion
    if (study.ai_analysis) {
      const analysisPoints = study.ai_analysis.split('\n\n');
      analysisPoints.forEach((point, index) => {
        if (point.trim()) {
          dialogue.push({
            voice: index % 2 === 0 ? "am_michael" : "af_sarah",
            text: point.replace(/[#*]/g, '').trim()
          });
        }
      });
    }

    // Conclusion
    dialogue.push({
      voice: "am_michael",
      text: "Those are excellent observations. Is there anything else you'd like to add to this case?"
    });

    dialogue.push({
      voice: "af_sarah",
      text: "I think we've covered the key aspects of this case. Thank you for this interesting discussion."
    });

    return dialogue;
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      
      const dialogue = createPodcastScript(study);
      console.log('Starting podcast generation with dialogue:', dialogue);

      // Initialize Kokoro TTS
      console.log('Initializing TTS...');
      const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
        dtype: "q8",
      });
      
      console.log('TTS initialized successfully');

      // Generate audio for each dialogue line
      const audioBuffers: Float32Array[] = [];
      const sampleRate = 24000;

      for (const line of dialogue) {
        console.log(`Generating audio for voice ${line.voice}:`, line.text);
        const audio = await tts.generate(line.text, {
          voice: line.voice,
          speed: 1.0,
        });

        if (!audio || !audio.audio || audio.audio.length === 0) {
          throw new Error('No audio data generated');
        }

        audioBuffers.push(new Float32Array(audio.audio));
      }

      // Combine all audio buffers
      const totalLength = audioBuffers.reduce((sum, buffer) => sum + buffer.length, 0);
      const combinedBuffer = new Float32Array(totalLength);
      
      let offset = 0;
      for (const buffer of audioBuffers) {
        combinedBuffer.set(buffer, offset);
        offset += buffer.length;
      }

      // Create AudioContext and play combined audio
      const audioContext = new AudioContext();
      const audioBuffer = audioContext.createBuffer(1, combinedBuffer.length, sampleRate);
      audioBuffer.getChannelData(0).set(combinedBuffer);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      console.log('Podcast playback started');

      // Clean up when done
      source.onended = () => {
        console.log('Podcast playback completed');
        audioContext.close();
      };
      
      toast({
        title: "Success",
        description: "Your podcast is now playing.",
      });
    } catch (error) {
      console.error('Error generating podcast:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate podcast. Please try again.",
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
          Generating Podcast...
        </>
      ) : (
        <>
          <AudioLines className="mr-2 h-4 w-4" />
          Generate Podcast
        </>
      )}
    </Button>
  );
};

export default GenerateAudioButton;