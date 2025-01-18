import { Button } from "@/components/ui/button";
import { AudioLines, Download, Loader2 } from "lucide-react";

interface AudioControlsProps {
  generating: boolean;
  audioUrl: string | null;
  onGenerate: () => void;
  onDownload: () => void;
}

const AudioControls = ({ generating, audioUrl, onGenerate, onDownload }: AudioControlsProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        onClick={onGenerate}
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
          onClick={onDownload}
          variant="outline"
          size="lg"
          className="w-full sm:w-auto bg-white hover:bg-gray-50 border-primary-200 hover:border-primary-300 text-primary-700 hover:text-primary-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200"
        >
          <Download className="mr-2 h-4 w-4" />
          Download Podcast
        </Button>
      )}
    </div>
  );
};

export default AudioControls;