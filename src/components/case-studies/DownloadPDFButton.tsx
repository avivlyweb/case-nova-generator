import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CaseStudyPDF from "./CaseStudyPDF";
import { useToast } from "@/hooks/use-toast";
import { SyntheticEvent } from "react";

interface DownloadPDFButtonProps {
  caseStudy: any;
  analysis: {
    analysis?: string;
    sections?: Array<{ title: string; content: string }>;
    references?: any[];
    icf_codes?: string;
  };
}

const DownloadPDFButton = ({ caseStudy, analysis }: DownloadPDFButtonProps) => {
  console.log('DownloadPDFButton - Received props:', { caseStudy, analysis });
  const { toast } = useToast();

  const handleError = (event: SyntheticEvent<HTMLAnchorElement, Event>) => {
    console.error('PDF Generation Error:', event);
    toast({
      variant: "destructive",
      title: "PDF Generation Failed",
      description: "Failed to generate PDF. Please try again.",
    });
  };

  if (!caseStudy || !analysis) {
    console.log('DownloadPDFButton - Missing required data:', { caseStudy, analysis });
    return null;
  }

  return (
    <PDFDownloadLink
      document={<CaseStudyPDF caseStudy={caseStudy} analysis={analysis} />}
      fileName={`case-study-${caseStudy.id}.pdf`}
      className="w-full"
      onClick={() => console.log('DownloadPDFButton - Download initiated')}
      onError={handleError}
    >
      {({ loading, error }) => (
        <Button 
          className="w-full" 
          disabled={loading || !!error}
        >
          <Download className="mr-2 h-4 w-4" />
          {loading ? 'Generating PDF...' : 'Download PDF'}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default DownloadPDFButton;