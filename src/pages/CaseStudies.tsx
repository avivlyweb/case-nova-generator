import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getCaseStudies } from "@/lib/db";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Brain, BookOpen } from "lucide-react";

const CaseStudies = () => {
  const { toast } = useToast();
  const [analyzing, setAnalyzing] = useState<{ [key: string]: boolean }>({});
  const [analyses, setAnalyses] = useState<{ [key: string]: any }>({});
  
  const { data: caseStudies, isLoading, error } = useQuery({
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

      setAnalyses(prev => ({
        ...prev,
        [caseStudy.id]: data
      }));

      toast({
        title: "Generation Complete",
        description: "Full case study has been generated.",
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

      setAnalyses(prev => ({
        ...prev,
        [caseStudy.id]: { analysis: data.analysis }
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
      <h1 className="text-3xl font-bold text-primary">Case Studies</h1>
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
                    {study.gender}, {study.age} years old | {study.condition}
                  </CardDescription>
                </div>
                <div className="space-x-2">
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
                        Quick Analysis
                      </>
                    )}
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => generateCase(study)}
                    disabled={analyzing[study.id]}
                  >
                    {analyzing[study.id] ? (
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
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {analyses[study.id] && (
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    {analyses[study.id].sections && (
                      <TabsTrigger value="full">Full Case Study</TabsTrigger>
                    )}
                  </TabsList>
                  <TabsContent value="overview">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-semibold mb-2">Quick Analysis</h3>
                      <p className="text-sm whitespace-pre-wrap">
                        {analyses[study.id].analysis}
                      </p>
                    </div>
                  </TabsContent>
                  {analyses[study.id].sections && (
                    <TabsContent value="full">
                      <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                        <div className="space-y-6">
                          {analyses[study.id].sections.map((section: any, index: number) => (
                            <div key={index} className="space-y-2">
                              <h3 className="font-semibold text-lg">{section.title}</h3>
                              <div className="text-sm whitespace-pre-wrap">
                                {section.content}
                              </div>
                            </div>
                          ))}
                          {analyses[study.id].references && (
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg">References</h3>
                              <div className="text-sm whitespace-pre-wrap">
                                {analyses[study.id].references}
                              </div>
                            </div>
                          )}
                          {analyses[study.id].icf_codes && (
                            <div className="space-y-2">
                              <h3 className="font-semibold text-lg">ICF Codes</h3>
                              <div className="text-sm whitespace-pre-wrap">
                                {analyses[study.id].icf_codes}
                              </div>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>
                  )}
                </Tabs>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CaseStudies;