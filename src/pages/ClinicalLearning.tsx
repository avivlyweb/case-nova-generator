import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { GraduationCap, BookOpen, MessageSquare, Brain } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ClinicalLearning = () => {
  const { id } = useParams();
  const { toast } = useToast();

  // Fetch case study details
  const { data: caseStudy, isLoading: loadingCase } = useQuery({
    queryKey: ['case-study', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('case_studies')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load case study",
        });
        throw error;
      }

      return data;
    },
  });

  // Fetch or create learning session
  const { data: session, isLoading: loadingSession } = useQuery({
    queryKey: ['learning-session', id],
    queryFn: async () => {
      const { data: existingSession, error: fetchError } = await supabase
        .from('learning_sessions')
        .select('*')
        .eq('case_study_id', id)
        .single();

      if (existingSession) return existingSession;

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      return null;
    },
  });

  // Start or resume learning session
  const startLearningSession = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert([
          {
            case_study_id: id,
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
        .single();

      if (error) throw error;

      toast({
        title: "Session Started",
        description: "Your learning session has begun",
      });

      return data;
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start learning session",
      });
    }
  };

  if (loadingCase || loadingSession) {
    return (
      <div className="p-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              <span>Loading...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderProgress = () => {
    if (!session?.hoac_progress) return null;
    
    const totalSteps = Object.keys(session.hoac_progress).length;
    const completedSteps = Object.values(session.hoac_progress).filter(v => v === 100).length;
    const progressPercentage = (completedSteps / totalSteps) * 100;

    return (
      <div className="space-y-2 mt-4">
        <div className="flex justify-between text-sm">
          <span>Overall Progress</span>
          <span>{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
    );
  };

  return (
    <div className="p-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            Clinical Learning Module
          </CardTitle>
          {renderProgress()}
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
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">
                  {caseStudy?.condition}
                </h3>
                <p className="text-muted-foreground">
                  This interactive learning module will guide you through the clinical reasoning process
                  using the HOAC II framework. You'll analyze the case, form hypotheses, and develop
                  intervention strategies based on evidence-based practice.
                </p>
                {!session && (
                  <Button onClick={startLearningSession}>
                    Start Learning Session
                  </Button>
                )}
                {session && (
                  <Button onClick={() => null} variant="outline">
                    Resume Session
                  </Button>
                )}
              </div>
            </TabsContent>
            <TabsContent value="learning" className="mt-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Learning Path</h3>
                {session ? (
                  <div className="space-y-6">
                    {Object.entries(session.hoac_progress).map(([step, progress]) => (
                      <div key={step} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{step.replace(/_/g, ' ')}</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Start a learning session to begin your personalized learning path.
                  </p>
                )}
              </div>
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