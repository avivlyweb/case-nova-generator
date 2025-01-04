import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCaseStudies } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Brain } from "lucide-react";

const CaseStudies = () => {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState<{ [key: string]: boolean }>({});
  const [analyses, setAnalyses] = useState<{ [key: string]: string }>({});
  
  const { data: caseStudies, isLoading, error } = useQuery({
    queryKey: ['case-studies'],
    queryFn: getCaseStudies,
  });

  const analyzeCase = async (caseStudy: any) => {
    setAnalyzing(prev => ({ ...prev, [caseStudy.id]: true }));
    try {
      const { data, error } = await supabase.functions.invoke('process-case-study', {
        body: { caseStudy }
      });

      if (error) throw error;

      setAnalyses(prev => ({
        ...prev,
        [caseStudy.id]: data.analysis
      }));

      toast({
        title: "Analysis Complete",
        description: "AI analysis has been generated for this case study.",
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
      <h1 className="text-3xl font-bold text-primary">My Case Studies</h1>
      <div className="grid gap-6">
        {caseStudies?.map((study) => (
          <Card key={study.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">
                    Patient: {study.patient_name}
                  </CardTitle>
                  <CardDescription>
                    {study.gender}, {study.age} years old
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => analyzeCase(study)}
                  disabled={analyzing[study.id]}
                >
                  {analyzing[study.id] ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="mr-2 h-4 w-4" />
                      Analyze
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Medical Details</h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Condition</dt>
                      <dd>{study.condition || "Not specified"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Medical History</dt>
                      <dd>{study.medical_history || "None recorded"}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Presenting Complaint</dt>
                      <dd>{study.presenting_complaint || "Not specified"}</dd>
                    </div>
                  </dl>
                </div>
                {analyses[study.id] && (
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-semibold mb-2">AI Analysis</h3>
                    <p className="text-sm">{analyses[study.id]}</p>
                  </div>
                )}
              </div>
              <div className="text-sm text-gray-500">
                Created: {new Date(study.created_at).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CaseStudies;