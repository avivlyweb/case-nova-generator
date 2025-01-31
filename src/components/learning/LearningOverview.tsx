import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

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
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {caseStudy.condition}
      </h3>
      <p className="text-muted-foreground">
        This interactive learning module will guide you through the clinical reasoning process
        using the HOAC II framework. You'll analyze the case, form hypotheses, and develop
        intervention strategies based on evidence-based practice.
      </p>
      {!hasSession && (
        <Button 
          onClick={onStartSession}
          disabled={isStarting}
        >
          {isStarting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Starting...
            </>
          ) : (
            'Start Learning Session'
          )}
        </Button>
      )}
      {hasSession && (
        <Button onClick={onResumeSession} variant="outline">
          Resume Session
        </Button>
      )}
    </div>
  );
}