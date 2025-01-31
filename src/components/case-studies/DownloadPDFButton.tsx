import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import CaseStudyPDF from "./CaseStudyPDF";
import { useToast } from "@/hooks/use-toast";
import type { CaseStudy } from "@/types/case-study";

interface DownloadPDFButtonProps {
  caseStudy: CaseStudy;
}

const DownloadPDFButton = ({ caseStudy }: DownloadPDFButtonProps) => {
  const { toast } = useToast();

  const handleError = () => {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to generate PDF. Please try again.",
    });
  };

  // Prepare analysis data from case study
  const analysis = {
    analysis: caseStudy.ai_analysis,
    sections: caseStudy.generated_sections,
    references: caseStudy.reference_list,
    icf_codes: caseStudy.icf_codes
  };

  return (
    <PDFDownloadLink
      document={<CaseStudyPDF caseStudy={caseStudy} analysis={analysis} />}
      fileName={`case-study-${caseStudy.id}.pdf`}
    >
      {({ loading }) => (
        <Button 
          variant="outline" 
          size="sm"
          disabled={loading}
          onClick={() => {
            if (!loading) {
              toast({
                title: "Success",
                description: "PDF downloaded successfully.",
              });
            }
          }}
        >
          <Download className="mr-2 h-4 w-4" />
          {loading ? "Generating PDF..." : "Download PDF"}
        </Button>
      )}
    </PDFDownloadLink>
  );
};

export default DownloadPDFButton;