import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CaseStudyCard from "@/components/case-studies/CaseStudyCard";
import CaseAnalysis from "@/components/case-studies/CaseAnalysis";
import { getCaseStudies } from "@/lib/db";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const CaseStudies = () => {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState<{ [key: string]: boolean }>({});
  const [analyses, setAnalyses] = useState<{ [key: string]: any }>({});
  
  const { data: caseStudies, isLoading, error } = useQuery({
    queryKey: ['case-studies'],
    queryFn: getCaseStudies,
  });

  const invokeFunctionWithRetry = async (functionName: string, body: any, retries = 0) => {
    try {
      console.log(`Attempting to invoke ${functionName}, attempt ${retries + 1}`);
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: body,
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error(`Error invoking ${functionName}:`, error);
      
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY}ms...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        return invokeFunctionWithRetry(functionName, body, retries + 1);
      }
      
      return { data: null, error };
    }
  };

  const generateCase = async (caseStudy: any) => {
    setAnalyzing(prev => ({ ...prev, [caseStudy.id]: true }));
    try {
      const { data, error } = await invokeFunctionWithRetry('process-case-study', {
        caseStudy,
        action: 'generate'
      });

      if (error) throw error;

      if (data) {
        setAnalyses(prev => ({
          ...prev,
          [caseStudy.id]: data
        }));

        toast({
          title: "Generation Complete",
          description: "Full case study has been generated.",
        });
      }
    } catch (error) {
      console.error('Error generating case:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate case study. Please try again.",
      });
    } finally {
      setAnalyzing(prev => ({ ...prev, [caseStudy.id]: false }));
    }
  };

  const analyzeCase = async (caseStudy: any) => {
    setAnalyzing(prev => ({ ...prev, [caseStudy.id]: true }));
    try {
      const { data, error } = await invokeFunctionWithRetry('process-case-study', {
        caseStudy,
        action: 'analyze'
      });

      if (error) throw error;

      if (data) {
        setAnalyses(prev => ({
          ...prev,
          [caseStudy.id]: { analysis: data.analysis }
        }));

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
            {analyses[study.id] && (
              <CaseAnalysis analysis={analyses[study.id]} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CaseStudies;