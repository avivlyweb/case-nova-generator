import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CaseStudyCard from "@/components/case-studies/CaseStudyCard";
import CaseAnalysis from "@/components/case-studies/CaseAnalysis";
import { getCaseStudies, updateCaseStudy } from "@/lib/db";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const CaseStudies = () => {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState<{ [key: string]: boolean }>({});
  const [analyses, setAnalyses] = useState<{ [key: string]: any }>({});
  
  const { data: caseStudies, isLoading, error, refetch } = useQuery({
    queryKey: ['case-studies'],
    queryFn: getCaseStudies,
  });

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const invokeWithRetry = async (functionName: string, body: any, retries = MAX_RETRIES) => {
    try {
      // Clean and validate the request body
      const cleanBody = {
        caseStudy: {
          id: body.caseStudy.id,
          patient_name: body.caseStudy.patient_name,
          age: body.caseStudy.age,
          gender: body.caseStudy.gender,
          condition: body.caseStudy.condition,
          presenting_complaint: body.caseStudy.presenting_complaint,
          specialization: body.caseStudy.specialization,
          ai_role: body.caseStudy.ai_role
        },
        action: body.action
      };

      console.log('Sending request with body:', JSON.stringify(cleanBody));
      
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: cleanBody,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      console.error(`Attempt ${MAX_RETRIES - retries + 1} failed:`, error);
      
      if (retries > 1) {
        await delay(RETRY_DELAY);
        return invokeWithRetry(functionName, body, retries - 1);
      }
      
      return { data: null, error };
    }
  };

  const generateCase = async (caseStudy: any) => {
    setAnalyzing(prev => ({ ...prev, [caseStudy.id]: true }));
    try {
      // Prepare the request body with only necessary fields
      const requestBody = {
        caseStudy: {
          id: caseStudy.id,
          patient_name: caseStudy.patient_name,
          age: caseStudy.age,
          gender: caseStudy.gender,
          medical_history: caseStudy.medical_history,
          presenting_complaint: caseStudy.presenting_complaint,
          condition: caseStudy.condition,
          specialization: caseStudy.specialization,
          ai_role: caseStudy.ai_role,
          adl_problem: caseStudy.adl_problem,
          patient_background: caseStudy.patient_background,
          comorbidities: caseStudy.comorbidities,
          psychosocial_factors: caseStudy.psychosocial_factors
        },
        action: 'generate'
      };

      const { data, error } = await invokeWithRetry('process-case-study', requestBody);

      if (error) {
        console.error('Error generating case:', error);
        let errorMessage = 'Failed to generate case study.';
        
        if (error.message?.includes('timeout')) {
          errorMessage = 'The request took too long. Please try with a shorter description.';
        } else if (error.message?.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a few minutes and try again.';
        }
        
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
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
    } catch (error: any) {
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
      const { data, error } = await invokeWithRetry('process-case-study', {
        caseStudy,
        action: 'analyze'
      });

      if (error) {
        console.error('Error analyzing case:', error);
        let errorMessage = 'Failed to analyze case study.';
        
        if (error.message?.includes('timeout')) {
          errorMessage = 'The request took too long. Please try with a shorter description.';
        } else if (error.message?.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a few minutes and try again.';
        }
        
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage,
        });
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
    } catch (error: any) {
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