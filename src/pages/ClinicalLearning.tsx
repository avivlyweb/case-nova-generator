import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, MessageSquare, Brain, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LearningOverview } from "@/components/learning/LearningOverview";
import { LearningPath } from "@/components/learning/LearningPath";

const ClinicalLearning = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth check
  const { data: user } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        navigate('/auth');
        throw new Error('Authentication required');
      }
      return user;
    },
  });

  // Fetch case study details
  const { data: caseStudy, isLoading: loadingCase } = useQuery({
    queryKey: ['case-study', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load case study",
        });
        throw error;
      }

      if (!data) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Case study not found",
        });
        throw new Error("Case study not found");
      }

      return data;
    },
    enabled: !!user,
  });

  // Fetch or create learning session
  const { data: session, isLoading: loadingSession } = useQuery({
    queryKey: ['learning-session', id],
    queryFn: async () => {
      const { data: existingSession, error: fetchError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('case_study_id', id)
        .eq('user_id', user!.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      return existingSession;
    },
    enabled: !!user && !!caseStudy,
  });

  // Start learning session
  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert([
          {
            case_study_id: id,
            user_id: user!.id,
            current_step: 'introduction',
            hoac_progress: {
              pattern_recognition: 0,
              hypothesis_generation: 0,
              hypothesis_testing: 0,
              intervention_planning: 0,
              outcome_evaluation: 0
            }
          },
        ])
        .select()
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Session Started",
        description: "Your learning session has begun",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start learning session: " + error.message,
      });
    },
  });

  if (loadingCase || loadingSession) {
    return (
      <div className="p-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!caseStudy) return null;

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
                <BookOpen className="h-4 w-4" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="learning" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Learning Path
              </TabsTrigger>
              <TabsTrigger value="discussion" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Discussion
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="mt-6">
              <LearningOverview 
                caseStudy={caseStudy}
                hasSession={!!session}
                isStarting={startSessionMutation.isPending}
                onStartSession={() => startSessionMutation.mutate()}
                onResumeSession={() => null} // TODO: Implement resume functionality
              />
            </TabsContent>
            <TabsContent value="learning" className="mt-6">
              <LearningPath session={session} />
            </TabsContent>
            <TabsContent value="discussion" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Clinical Discussion</h3>
                <p className="text-muted-foreground">
                  Join the discussion about this case study and share your insights with peers.
                  Discussion features will be available soon.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClinicalLearning;