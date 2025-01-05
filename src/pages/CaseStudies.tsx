import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { getCaseStudies } from "@/lib/db";
import CaseStudyCard from "@/components/case-studies/CaseStudyCard";
import CaseAnalysis from "@/components/case-studies/CaseAnalysis";

const CaseStudies = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const newCaseId = searchParams.get('newCase');
  const defaultTab = searchParams.get('tab') || 'overview';

  const { data: caseStudies, isLoading, error } = useQuery({
    queryKey: ['case-studies'],
    queryFn: getCaseStudies,
  });

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load case studies",
      });
    }
  }, [error, toast]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-6">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-full overflow-x-hidden">
      <h1 className="text-2xl md:text-3xl font-bold text-primary px-4 md:px-0">Case Studies</h1>
      <div className="grid gap-6 px-4 md:px-0">
        {caseStudies?.map((study) => (
          <div key={study.id} className={`transition-all duration-300 ${study.id === newCaseId ? 'ring-2 ring-primary ring-offset-2 rounded-lg' : ''}`}>
            <CaseStudyCard study={study} />
            {study.ai_analysis && (
              <CaseAnalysis 
                analysis={{
                  analysis: study.ai_analysis,
                  sections: study.generated_sections,
                  references: study.reference_list,
                  icf_codes: study.icf_codes
                }}
                defaultTab={study.id === newCaseId ? defaultTab : 'overview'}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStudies;