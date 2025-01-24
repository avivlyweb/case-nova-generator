import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, BookOpen } from "lucide-react";
import { CaseStudy } from "@/types/case-study";
import DownloadPDFButton from "./DownloadPDFButton";

interface CaseStudyCardProps {
  study: CaseStudy;
  analyzing: boolean;
  onAnalyze: () => void;
  onGenerate: () => void;
}

const CaseStudyCard = ({ study, analyzing, onAnalyze, onGenerate }: CaseStudyCardProps) => {
  const hasFullCase = Array.isArray(study.generated_sections) && study.generated_sections.length > 0;

  const analysis = {
    analysis: study.ai_analysis,
    sections: study.generated_sections,
    references: study.reference_list ? [study.reference_list] : undefined,
    icf_codes: Array.isArray(study.icf_codes) ? study.icf_codes : undefined
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
      <CardHeader className="space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold text-primary-900 dark:text-primary-100">
              {study.patient_name}
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-300">
              {study.gender}, {study.age} years old
            </CardDescription>
            {study.condition && (
              <div className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-100">
                {study.condition}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              size="lg"
              onClick={onAnalyze}
              disabled={analyzing}
              className="w-full sm:w-auto bg-white hover:bg-gray-50 border-primary-200 hover:border-primary-300 text-primary-700 hover:text-primary-800 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600 dark:hover:border-gray-500 dark:text-gray-200 transition-all duration-200"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="mr-2 h-4 w-4" />
                  Quick Analysis
                </>
              )}
            </Button>
            <Button
              variant="default"
              size="lg"
              onClick={onGenerate}
              disabled={analyzing}
              className="w-full sm:w-auto bg-primary hover:bg-primary-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              {analyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Generate Full Case
                </>
              )}
            </Button>
            {hasFullCase && (
              <DownloadPDFButton caseStudy={study} analysis={analysis} />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {study.presenting_complaint && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Presenting Complaint:</span> {study.presenting_complaint}
            </p>
          )}
          {study.medical_history && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              <span className="font-medium">Medical History:</span> {study.medical_history}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CaseStudyCard;