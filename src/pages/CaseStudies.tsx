import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import CaseStudyCard from "@/components/case-studies/CaseStudyCard";
import CaseAnalysis from "@/components/case-studies/CaseAnalysis";
import { getCaseStudies } from "@/lib/db";

const CaseStudies = () => {
  const { toast } = useToast();
  
  const { data: caseStudies, isLoading, error } = useQuery({
    queryKey: ['case-studies'],
    queryFn: getCaseStudies,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-6">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-[200px] w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load case studies",
    });
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Case Studies</h1>
      </div>
      <div className="grid gap-6">
        {caseStudies?.map((study) => (
          <div key={study.id} className="space-y-4">
            <CaseStudyCard
              study={study}
              analyzing={false}
              onAnalyze={() => {}} // Remove analyze functionality since data is already saved
              onGenerate={() => {}} // Remove generate functionality since data is already saved
            />
            {study.generated_sections && (
              <CaseAnalysis 
                analysis={{
                  analysis: study.ai_analysis,
                  sections: Object.entries(study.generated_sections).map(([title, content]) => ({
                    title,
                    content: content as string,
                  })),
                  references: study.reference_list,
                  icf_codes: study.icf_codes as string,
                }} 
              />
            )}
          </div>
        ))}
        {caseStudies?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No case studies found. Generate your first case study to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseStudies;