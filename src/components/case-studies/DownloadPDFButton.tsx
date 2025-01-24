import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CaseStudyPDF from "./CaseStudyPDF";
import { useToast } from "@/hooks/use-toast";

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

  const handleError = (error: Error) => {
    console.error('PDF Generation Error:', error);
    toast({
      variant: "destructive",
      title: "PDF Generation Failed",
      description: error.message || "Failed to generate PDF. Please try again.",
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
      {({ loading, error }) => {
        console.log('PDFDownloadLink state:', { loading, error });
        
        if (error) {
          console.error('PDFDownloadLink error:', error);
        }

        return (
          <Button 
            className="w-full" 
            disabled={loading}
          >
            <Download className="mr-2 h-4 w-4" />
            {loading ? 'Generating PDF...' : 'Download PDF'}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
};

export default DownloadPDFButton;