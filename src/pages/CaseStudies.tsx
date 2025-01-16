import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CaseStudyCard from "@/components/case-studies/CaseStudyCard";
import CaseAnalysis from "@/components/case-studies/CaseAnalysis";
import { getCaseStudies, updateCaseStudy } from "@/lib/db";
import { importClinicalCase } from "@/lib/clinical-reasoning";

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

      if (error) {
        console.error('Error generating case:', error);
        if (error.message?.includes('rate limit')) {
          toast({
            variant: "destructive",
            title: "Rate Limit Reached",
            description: "The AI service is currently at capacity. Please try again in 30 minutes.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to generate case study. Please try again later.",
          });
        }
        return;
      }

      // Ensure sections are in the correct format before saving
      const formattedSections = Array.isArray(data.sections) ? data.sections : 
        Object.entries(data.sections || {}).map(([title, content]) => ({
          title,
          content: typeof content === 'string' ? content : JSON.stringify(content)
        }));

      const formattedICFCodes = Array.isArray(data.icf_codes) ? data.icf_codes :
        typeof data.icf_codes === 'string' ? [data.icf_codes] : [];

      await updateCaseStudy(caseStudy.id, {
        generated_sections: formattedSections,
        ai_analysis: data.analysis,
        reference_list: data.references,
        icf_codes: formattedICFCodes,
        assessment_findings: data.assessment_findings,
        intervention_plan: data.intervention_plan,
        medical_entities: data.medical_entities || [],
        smart_goals: data.smart_goals || []
      });

      setAnalyses(prev => ({
        ...prev,
        [caseStudy.id]: {
          analysis: data.analysis,
          sections: formattedSections,
          references: data.references,
          icf_codes: formattedICFCodes
        }
      }));

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
        description: error.message || "Failed to generate case study",
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

      if (error) {
        console.error('Error analyzing case:', error);
        if (error.message?.includes('rate limit')) {
          toast({
            variant: "destructive",
            title: "Rate Limit Reached",
            description: "The AI service is currently at capacity. Please try again in 30 minutes.",
          });
        } else {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to analyze case study. Please try again later.",
          });
        }
        return;
      }

      await updateCaseStudy(caseStudy.id, {
        ai_analysis: data.analysis
      });

      setAnalyses(prev => ({
        ...prev,
        [caseStudy.id]: { analysis: data.analysis }
      }));

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
        description: error.message || "Failed to analyze case study",
      });
    } finally {
      setAnalyzing(prev => ({ ...prev, [caseStudy.id]: false }));
    }
  };

  const importCase = async (caseText: string) => {
    try {
      const { sections, analysis } = await importClinicalCase(caseText);
      
      // Here you can save to Supabase or handle the imported case as needed
      console.log('Imported case sections:', sections);
      console.log('Clinical analysis:', analysis);
      
      return { sections, analysis };
    } catch (error) {
      console.error('Error importing case:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        <Skeleton className="h-8 w-[200px]" />
        <div className="grid gap-6">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-[200px] w-full rounded-lg" />
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-primary-900 dark:text-primary-100 mb-8">
          Case Studies
        </h1>
        <div className="grid gap-8">
          {caseStudies?.map((study) => (
            <div key={study.id} className="animate-fade-in">
              <CaseStudyCard
                study={study}
                analyzing={analyzing[study.id]}
                onAnalyze={() => analyzeCase(study)}
                onGenerate={() => generateCase(study)}
              />
              {(analyses[study.id] || study.ai_analysis || study.generated_sections) && (
                <div className="mt-4">
                  <CaseAnalysis analysis={{
                    analysis: analyses[study.id]?.analysis || study.ai_analysis,
                    sections: analyses[study.id]?.sections || study.generated_sections,
                    references: analyses[study.id]?.references || study.reference_list,
                    icf_codes: analyses[study.id]?.icf_codes || study.icf_codes
                  }} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CaseStudies;