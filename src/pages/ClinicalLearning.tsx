import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, MessageSquare, GraduationCap, Loader2 } from "lucide-react";
import { CaseContext } from "@/components/learning/CaseContext";
import { ClinicalInquiry } from "@/components/learning/ClinicalInquiry";
import { LearningPath } from "@/components/learning/LearningPath";
import { LearningOverview } from "@/components/learning/LearningOverview";
import { useToast } from "@/hooks/use-toast";

const ClinicalLearning = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [isAsking, setIsAsking] = useState(false);

  // Fetch case study details
  const { data: caseStudy, isLoading: loadingCase } = useQuery({
    queryKey: ['case-study', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error("Case study not found");
      return data;
    },
  });

  // Fetch or get learning session
  const { data: session, isLoading: loadingSession } = useQuery({
    queryKey: ['learning-session', id],
    queryFn: async () => {
      const { data: existingSession, error } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('case_study_id', id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return existingSession;
    },
    enabled: !!caseStudy,
  });

  const handleAskQuestion = async (question: string) => {
    setIsAsking(true);
    try {
      const response = await fetch('/api/clinical-reasoning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, caseStudy }),
      });

      if (!response.ok) {
        throw new Error('Failed to process question');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error asking question:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process your question. Please try again.",
      });
    } finally {
      setIsAsking(false);
    }
  };

  if (loadingCase || loadingSession) {
    return (
      <div className="p-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading case study...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!caseStudy) return null;

  // Format initial context to show only essential information
  const initialContext = `You are assessing a ${caseStudy.age}-year-old ${caseStudy.patient_background || 'patient'}, 
    ${caseStudy.patient_name}, who reports ${caseStudy.presenting_complaint}.
    What questions would you like to ask to gather more information?`;

  return (
    <div className="p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Clinical Learning Module
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="assessment" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Clinical Assessment
              </TabsTrigger>
              <TabsTrigger value="progress" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Learning Progress
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <LearningOverview 
                caseStudy={caseStudy}
                hasSession={!!session}
                isStarting={false}
                onStartSession={() => {}}
                onResumeSession={() => {}}
              />
            </TabsContent>

            <TabsContent value="assessment" className="mt-6 space-y-6">
              <CaseContext 
                initialContext={initialContext}
                loading={loadingCase}
              />
              <ClinicalInquiry
                onAskQuestion={handleAskQuestion}
                isLoading={isAsking}
                caseContext={initialContext}
              />
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <LearningPath session={session} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalLearning;