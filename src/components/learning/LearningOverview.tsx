import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type CaseStudy = Database['public']['Tables']['case_studies']['Row'];

interface LearningOverviewProps {
  caseStudy: CaseStudy;
  hasSession: boolean;
  isStarting: boolean;
  onStartSession: () => void;
  onResumeSession: () => void;
}

export function LearningOverview({ 
  caseStudy, 
  hasSession, 
  isStarting, 
  onStartSession,
  onResumeSession 
}: LearningOverviewProps) {
  const { toast } = useToast();
  const [showFullDetails, setShowFullDetails] = useState(false);

  const getInitialContext = () => {
    return `You are assessing a ${caseStudy.age}-year-old ${caseStudy.patient_background || 'patient'}, 
    ${caseStudy.patient_name}, who reports ${caseStudy.presenting_complaint}.
    What questions would you like to ask to gather more information?`;
  };

  const handleStartSession = async () => {
    try {
      onStartSession();
      toast({
        title: "Session Started",
        description: "Begin by asking questions to gather patient information.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to start learning session. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {caseStudy.condition}
      </h3>
      <div className="prose prose-sm max-w-none">
        {showFullDetails ? (
          <p className="text-muted-foreground">
            {caseStudy.medical_history}
          </p>
        ) : (
          <p className="text-muted-foreground">
            {getInitialContext()}
          </p>
        )}
      </div>
      
      {!hasSession && (
        <Button 
          onClick={handleStartSession}
          disabled={isStarting}
          className="w-full"
        >
          {isStarting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting Session...
            </>
          ) : (
            'Start Learning Session'
          )}
        </Button>
      )}
      
      {hasSession && (
        <Button 
          onClick={onResumeSession} 
          variant="outline"
          className="w-full"
        >
          Resume Session
        </Button>
      )}
    </div>
  );
}