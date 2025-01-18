import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mic, Play, Download, Settings, Loader2 } from "lucide-react";
import { convertTextToSpeech, ELEVEN_LABS_VOICES } from "@/services/elevenlabs";
import { useToast } from "@/components/ui/use-toast";

const Podcast = () => {
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [selectedVoice, setSelectedVoice] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const generatePodcastScript = (caseStudy: any) => {
    // Token-efficient script generation (6 minutes, ~900 words)
    return `Welcome to this clinical case review. Today, we'll discuss ${caseStudy.condition}.

Key Assessment Findings:
${caseStudy.assessment_findings || "Assessment findings not available"}

Clinical Reasoning:
${caseStudy.clinical_reasoning_path ? JSON.stringify(caseStudy.clinical_reasoning_path) : "Clinical reasoning not available"}

Treatment Approach:
${caseStudy.intervention_plan || "Intervention plan not available"}

Key Recommendations:
${caseStudy.smart_goals ? JSON.stringify(caseStudy.smart_goals) : "Goals not available"}

Clinical Pearls:
Based on the evidence and clinical guidelines, here are the key takeaways for treating similar cases...`;
  };

  const handleGeneratePodcast = async () => {
    if (!selectedCase || !selectedVoice) {
      toast({
        title: "Missing Information",
        description: "Please select both a case study and a voice before generating.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // For now, we'll use a placeholder text. Later, we'll get the actual case study content
      const dummyText = "This is a sample case study podcast. We'll replace this with actual content from the selected case study.";
      
      const audioBuffer = await convertTextToSpeech(dummyText, selectedVoice);
      const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
      
      toast({
        title: "Success",
        description: "Podcast generated successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate podcast. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `podcast-${selectedCase}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">Podcast Studio</h1>
            <p className="text-muted-foreground mt-2">
              Transform your case studies into engaging audio content
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
                Select Narrator Voice
              </label>
              <Select
                value={selectedVoice}
                onValueChange={setSelectedVoice}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a voice" />
                </SelectTrigger>
                <SelectContent>
                  {ELEVEN_LABS_VOICES.map((voice) => (
                    <SelectItem key={voice.id} value={voice.id}>
                      {voice.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <Button 
                className="w-full gap-2" 
                size="lg"
                onClick={handleGeneratePodcast}
                disabled={isGenerating || !selectedCase || !selectedVoice}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
                {isGenerating ? "Generating..." : "Generate Podcast"}
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Preview</h2>
          <div className="bg-secondary/10 rounded-lg p-6 flex items-center justify-center min-h-[200px]">
            {audioUrl ? (
              <div className="w-full space-y-4">
                <audio 
                  controls 
                  className="w-full" 
                  src={audioUrl}
                />
                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={handleDownload}
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </div>
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