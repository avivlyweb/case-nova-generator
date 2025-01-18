import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AudioLines, Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { KokoroTTS } from 'kokoro-js';
import { CaseStudy } from '@/types/case-study';
import { DialogueLine, GenerationProgress } from '@/types/audio';
import { processAudioChunk, combineAudioBuffers, audioBufferToWav } from '@/utils/audioProcessing';
import { Progress } from '@/components/ui/progress';

interface GenerateAudioButtonProps {
  study: CaseStudy;
  sectionId?: string;
}

const GenerateAudioButton = ({ study, sectionId = 'summary' }: GenerateAudioButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
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

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement('a');
      link.href = audioUrl;
      link.download = `case-study-${study.patient_name.toLowerCase().replace(/\s+/g, '-')}.wav`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Success",
        description: "Podcast has been downloaded.",
      });
    }
  };

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setProgress({ currentChunk: 0, totalChunks: 0, status: 'Initializing...' });
      
      const dialogue = createPodcastScript(study);
      console.log('Starting podcast generation with dialogue:', dialogue);

      // Initialize Kokoro TTS
      setProgress(prev => ({ ...prev!, status: 'Initializing TTS engine...' }));
      const tts = await KokoroTTS.from_pretrained("onnx-community/Kokoro-82M-ONNX", {
        dtype: "q8",
      });
      
      console.log('TTS initialized successfully');

      // Generate audio for each dialogue line
      const audioBuffers: Float32Array[] = [];
      const sampleRate = 24000;
      setProgress({ currentChunk: 0, totalChunks: dialogue.length, status: 'Generating audio...' });

      for (let i = 0; i < dialogue.length; i++) {
        const line = dialogue[i];
        console.log(`Generating audio for voice ${line.voice}:`, line.text);
        
        setProgress(prev => ({
          ...prev!,
          currentChunk: i + 1,
          status: `Generating voice ${i + 1} of ${dialogue.length}...`
        }));

        const audioBuffer = await processAudioChunk(tts, line);
        audioBuffers.push(audioBuffer);
      }

      setProgress(prev => ({ ...prev!, status: 'Combining audio...' }));

      // Combine all audio buffers
      const combinedBuffer = combineAudioBuffers(audioBuffers, sampleRate);
      
      setProgress(prev => ({ ...prev!, status: 'Converting to WAV...' }));

      // Convert to WAV and create URL
      const wavBlob = await audioBufferToWav(combinedBuffer);
      const url = URL.createObjectURL(wavBlob);
      setAudioUrl(url);
      
      // Create AudioContext for playback
      const audioContext = new AudioContext();
      const source = audioContext.createBufferSource();
      source.buffer = combinedBuffer;
      source.connect(audioContext.destination);
      source.start(0);
      
      console.log('Podcast playback started');

      source.onended = () => {
        console.log('Podcast playback completed');
        audioContext.close();
      };
      
      toast({
        title: "Success",
        description: "Your podcast is now playing. Click the download button to save it.",
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
      setProgress(null);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {progress && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>{progress.status}</span>
            <span>{progress.currentChunk}/{progress.totalChunks}</span>
          </div>
          <Progress value={(progress.currentChunk / progress.totalChunks) * 100} />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2">
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
        
        {audioUrl && (
          <Button
            onClick={handleDownload}
            variant="outline"
            size="lg"
            className="w-full sm:w-auto bg-white hover:bg-gray-50 border-primary-200 hover:border-primary-300 text-primary-700 hover:text-primary-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
          >
            <Download className="mr-2 h-4 w-4" />
            Download Podcast
          </Button>
        )}
      </div>
    </div>
  );
};

export default GenerateAudioButton;
