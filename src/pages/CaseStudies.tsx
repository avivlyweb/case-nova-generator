import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CaseStudyCard from "@/components/case-studies/CaseStudyCard";
import CaseAnalysis from "@/components/case-studies/CaseAnalysis";
import { getCaseStudies, updateCaseStudy } from "@/lib/db";

const CaseStudies = () => {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState<{ [key: string]: boolean }>({});
  const [analyses, setAnalyses] = useState<{ [key: string]: any }>({});
  
  const { data: caseStudies, isLoading, error, refetch } = useQuery({
    queryKey: ['case-studies'],
    queryFn: getCaseStudies,
  });

  const generateCase = async (caseStudy: any) => {
    setAnalyzing(prev => ({ ...prev, [caseStudy.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('process-case-study', {
        body: { caseStudy, action: 'generate' }
      });

      if (error) throw error;

      // Save the generated data to the database
      await updateCaseStudy(caseStudy.id, {
        generated_sections: data.sections,
        ai_analysis: data.analysis,
        reference_list: data.references,
        icf_codes: data.icf_codes
      });

      setAnalyses(prev => ({
        ...prev,
        [caseStudy.id]: data
      }));

      // Refetch to get the updated data
      refetch();

      toast({
        title: "Generation Complete",
        description: "Full case study has been generated and saved.",
      });
    } catch (error) {
      console.error('Error generating case:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate case study",
      });
    } finally {
      setAnalyzing(prev => ({ ...prev, [caseStudy.id]: false }));
    }
  };

  const analyzeCase = async (caseStudy: any) => {
    setAnalyzing(prev => ({ ...prev, [caseStudy.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('process-case-study', {
        body: { caseStudy, action: 'analyze' }
      });

      if (error) throw error;

      // Save the analysis to the database
      await updateCaseStudy(caseStudy.id, {
        ai_analysis: data.analysis
      });

      setAnalyses(prev => ({
        ...prev,
        [caseStudy.id]: { analysis: data.analysis }
      }));

      // Refetch to get the updated data
      refetch();

      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated and saved.",
      });
    } catch (error) {
      console.error('Error analyzing case:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to analyze case study",
      });
    } finally {
      setAnalyzing(prev => ({ ...prev, [caseStudy.id]: false }));
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
              analyzing={analyzing[study.id]}
              onAnalyze={() => analyzeCase(study)}
              onGenerate={() => generateCase(study)}
            />
            {(analyses[study.id] || study.ai_analysis || study.generated_sections) && (
              <CaseAnalysis analysis={{
                analysis: analyses[study.id]?.analysis || study.ai_analysis,
                sections: analyses[study.id]?.sections || study.generated_sections,
                references: analyses[study.id]?.references || study.reference_list,
                icf_codes: analyses[study.id]?.icf_codes || study.icf_codes
              }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStudies;