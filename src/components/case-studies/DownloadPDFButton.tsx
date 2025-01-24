import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CaseStudyPDF from "./CaseStudyPDF";
import { useToast } from "@/hooks/use-toast";
import type { CaseStudy } from "@/types/case-study";
import { ReactNode } from "react";

interface DownloadPDFButtonProps {
  caseStudy: CaseStudy;
  analysis?: {
    analysis?: string;
    sections?: Array<{ title: string; content: string }>;
    references?: string[];
    icf_codes?: string[];
  };
}

const DownloadPDFButton = ({ caseStudy, analysis }: DownloadPDFButtonProps) => {
  console.log('DownloadPDFButton - Received props:', { caseStudy, analysis });
  const { toast } = useToast();

  const handleError = (event: React.SyntheticEvent<HTMLAnchorElement, Event>) => {
    const error = event.currentTarget.getAttribute('data-error');
    console.error('PDF Generation Error:', error);
    toast({
      variant: "destructive",
      title: "PDF Generation Failed",
      description: error || "Failed to generate PDF. Please try again.",
    });
  };

  if (!caseStudy) {
    console.log('DownloadPDFButton - Missing required data:', { caseStudy });
    return null;
  }

  return (
    <PDFDownloadLink
      document={<CaseStudyPDF caseStudy={caseStudy} analysis={analysis} />}
      fileName={`case-study-${caseStudy.id}.pdf`}
      className="w-full sm:w-auto"
      onClick={() => console.log('DownloadPDFButton - Download initiated')}
      onError={handleError}
    >
      {({ loading, error }): ReactNode => {
        console.log('PDFDownloadLink state:', { loading, error });
        
        if (error) {
          console.error('PDFDownloadLink error:', error);
        }

        return (
          <Button 
            variant="outline"
            size="lg"
            className="w-full sm:w-auto" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        );
      }}
    </PDFDownloadLink>
  );
};

export default DownloadPDFButton;