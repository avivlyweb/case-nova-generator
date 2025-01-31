import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { CaseStudy } from "@/types/case-study";

interface DownloadPDFButtonProps {
  caseStudy: CaseStudy;
}

const DownloadPDFButton = ({ caseStudy }: DownloadPDFButtonProps) => {
  const { toast } = useToast();

  const handleDownload = () => {
    toast({
      title: "Feature removed",
      description: "PDF download functionality has been removed.",
    });
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleDownload}
    >
      <Download className="mr-2 h-4 w-4" />
      Download
    </Button>
  );
};

export default DownloadPDFButton;