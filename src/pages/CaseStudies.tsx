import { useState, useEffect } from "react";
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

  const processAllCaseStudies = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('extract-medical-entities');
      
      if (error) throw error;

      toast({
        title: "Success",
        description: "Medical entities have been extracted and saved for all case studies.",
      });

      // Refetch to get the updated data
      refetch();
    } catch (error) {
      console.error('Error processing case studies:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process case studies",
      });
    }
  };

  const generateCase = async (caseStudy: any) => {
    setAnalyzing(prev => ({ ...prev, [caseStudy.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('process-case-study', {
        body: { caseStudy, action: 'generate' }
      });

      if (error) throw error;

      // Ensure sections are in the correct format before saving
      const formattedSections = Array.isArray(data.sections) ? data.sections : 
        Object.entries(data.sections || {}).map(([title, content]) => ({
          title,
          content: typeof content === 'string' ? content : JSON.stringify(content)
        }));

      // Format ICF codes if they're not already in the correct format
      const formattedICFCodes = Array.isArray(data.icf_codes) ? data.icf_codes :
        typeof data.icf_codes === 'string' ? [data.icf_codes] : [];

      // Save all generated data to the database
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

  useEffect(() => {
    // Process all case studies when the component mounts
    processAllCaseStudies();
  }, []);

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
