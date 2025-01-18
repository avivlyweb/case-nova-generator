import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { KokoroTTS } from 'kokoro-js';
import { CaseStudy } from '@/types/case-study';
import { GenerationProgress } from '@/types/audio';
import { combineAudioBuffers, audioBufferToWav } from '@/utils/audioProcessing';
import { createPodcastScript, generateAudioChunks } from '@/utils/audioGeneration';
import AudioProgress from './audio/AudioProgress';
import AudioControls from './audio/AudioControls';

interface GenerateAudioButtonProps {
  study: CaseStudy;
  sectionId?: string;
}

const GenerateAudioButton = ({ study, sectionId = 'summary' }: GenerateAudioButtonProps) => {
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const { toast } = useToast();

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

      // Generate audio chunks
      const audioBuffers = await generateAudioChunks(tts, dialogue, setProgress);

      setProgress(prev => ({ ...prev!, status: 'Combining audio...' }));
      const combinedBuffer = combineAudioBuffers(audioBuffers, 24000);
      
      setProgress(prev => ({ ...prev!, status: 'Converting to WAV...' }));
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
      {progress && <AudioProgress progress={progress} />}
      <AudioControls
        generating={generating}
        audioUrl={audioUrl}
        onGenerate={handleGenerate}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default GenerateAudioButton;