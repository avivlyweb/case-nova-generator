import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CaseStudyCard from "@/components/case-studies/CaseStudyCard";
import CaseAnalysis from "@/components/case-studies/CaseAnalysis";
import { getCaseStudies } from "@/lib/db";

const CaseStudies = () => {
  const { toast } = useToast();
  const { data: caseStudies, isLoading, error } = useQuery({
    queryKey: ['case-studies'],
    queryFn: getCaseStudies,
  });

  const analyzeCase = async (caseStudy: any) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-case-study', {
        body: {
          caseStudy,
          action: 'analyze'
        }
      });

      if (error) throw error;

      if (data) {
        // Update the case study with the analysis
        const { error: updateError } = await supabase
          .from('case_studies')
          .update({
            ai_analysis: data.analysis
          })
          .eq('id', caseStudy.id);

        if (updateError) throw updateError;

        toast({
          title: "Analysis Complete",
          description: "AI analysis has been generated for this case study.",
        });
      }
    } catch (error) {
      console.error('Error analyzing case:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze case study. Please try again.",
      });
    }
  };

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

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "Failed to load case studies",
    });
    return null;
  }

  return (
    <div className="space-y-8 max-w-full overflow-x-hidden">
      <h1 className="text-2xl md:text-3xl font-bold text-primary px-4 md:px-0">Case Studies</h1>
      <div className="grid gap-6 px-4 md:px-0">
        {caseStudies?.map((study) => (
          <div key={study.id}>
            <CaseStudyCard
              study={study}
              onAnalyze={() => analyzeCase(study)}
            />
            {study.ai_analysis && (
              <CaseAnalysis analysis={study.ai_analysis} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStudies;