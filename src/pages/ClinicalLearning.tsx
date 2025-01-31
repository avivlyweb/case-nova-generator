import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, BookOpen, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ClinicalLearning = () => {
  const { id } = useParams();
  const { toast } = useToast();

  // Fetch case study details
  const { data: caseStudy, isLoading } = useQuery({
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

  // Start or resume learning session
  const startLearningSession = async () => {
    try {
      const { data, error } = await supabase
        .from('learning_sessions')
        .insert([
          {
            case_study_id: id,
            current_step: 'introduction',
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

  if (isLoading) {
    return (
      <div className="p-8">
        <Card className="w-full max-w-4xl mx-auto">
          <CardContent className="p-6">
            Loading...
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <TabsTrigger value="overview">
                <BookOpen className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="learning">
                <GraduationCap className="h-4 w-4 mr-2" />
                Learning Path
              </TabsTrigger>
              <TabsTrigger value="discussion">
                <MessageSquare className="h-4 w-4 mr-2" />
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
                  using the HOAC II framework.
                </p>
                <Button onClick={startLearningSession}>
                  Start Learning Session
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="learning">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Learning Path</h3>
                <p className="text-muted-foreground">
                  Your personalized learning path will be available here once you start a session.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="discussion">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Clinical Discussion</h3>
                <p className="text-muted-foreground">
                  Join the discussion about this case study and share your insights with peers.
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