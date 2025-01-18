import { Progress } from "@/components/ui/progress";
import { GenerationProgress } from "@/types/audio";

interface AudioProgressProps {
  progress: GenerationProgress;
}

const AudioProgress = ({ progress }: AudioProgressProps) => {
  const percentage = (progress.currentChunk / progress.totalChunks) * 100;
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-500">
        <span>{progress.status}</span>
        <span>{progress.currentChunk}/{progress.totalChunks}</span>
      </div>
      <Progress value={percentage} />
    </div>
  );
};

export default AudioProgress;