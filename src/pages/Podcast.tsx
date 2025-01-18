import { useState, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Mic,
  Play,
  Pause,
  Download,
  Settings,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const VOICE_OPTIONS = [
  { id: "IKne3meq5aSn9XLyUdCD", name: "Dr. Charlie", style: "Professional Narrator" },
  { id: "XB0fDUnXU5powFXDhCwa", name: "Dr. Charlotte", style: "Clinical Expert" },
  { id: "bIHbv24MWmeRgasZH58o", name: "Dr. Will", style: "Medical Educator" },
];

const Podcast = () => {
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [script, setScript] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!selectedCase || !selectedVoice) {
      toast({
        title: "Missing Information",
        description: "Please select both a case study and a narrator voice.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Fetch case study details
      const { data: caseStudy, error: caseError } = await supabase
        .from('case_studies')
        .select('*')
        .eq('id', selectedCase)
        .single();

      if (caseError || !caseStudy) {
        throw new Error('Failed to fetch case study');
      }

      // Generate podcast audio
      const { data, error } = await supabase.functions.invoke('generate-podcast', {
        body: {
          caseStudy: {
            id: caseStudy.id,
            sections: caseStudy.generated_sections || [],
            analysis: caseStudy.ai_analysis,
          },
          voiceId: selectedVoice,
        },
      });

      if (error) throw error;

      // Convert base64 to audio URL
      const audioBlob = base64ToBlob(data.audio, 'audio/mpeg');
      const url = URL.createObjectURL(audioBlob);
      
      setAudioUrl(url);
      setScript(data.script);
      
      toast({
        title: "Podcast Generated",
        description: "Your podcast is ready to play!",
      });

    } catch (error) {
      console.error('Error generating podcast:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate podcast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = 'physiocase-podcast.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const base64ToBlob = (base64: string, type: string) => {
    const binaryString = window.atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return new Blob([bytes], { type });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Premium Podcast Studio</h1>
            <p className="text-muted-foreground mt-2">
              Transform your case studies into professional, engaging audio content
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>

        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Generate New Podcast</h2>
          
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Case Study
              </label>
              <Select
                value={selectedCase}
                onValueChange={setSelectedCase}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a case study" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="case1">Case Study #1</SelectItem>
                  <SelectItem value="case2">Case Study #2</SelectItem>
                  <SelectItem value="case3">Case Study #3</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Professional Narrator
              </label>
              <Select
                value={selectedVoice}
                onValueChange={setSelectedVoice}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a voice" />
                </SelectTrigger>
                <SelectContent>
                  {VOICE_OPTIONS.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name} - {voice.style}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              className="w-full gap-2" 
              size="lg"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
              {isGenerating ? "Generating..." : "Generate Professional Podcast"}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Podcast Preview</h2>
          <div className="bg-secondary/10 rounded-lg p-6">
            {audioUrl ? (
              <div className="space-y-6">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onEnded={() => setIsPlaying(false)}
                  className="hidden"
                />
                
                <div className="flex justify-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>

                {script && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Podcast Script</h3>
                    <div className="bg-background/50 p-4 rounded-lg max-h-60 overflow-y-auto">
                      <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                        {script}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-muted-foreground mb-4">
                  Generate a podcast to preview it here
                </p>
                <div className="flex gap-4 justify-center">
                  <Button variant="outline" size="icon" disabled>
                    <Play className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" disabled>
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Podcast;