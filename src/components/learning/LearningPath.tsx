import type { Database } from "@/integrations/supabase/types";
import { LearningProgress } from "./LearningProgress";

type LearningSession = Database['public']['Tables']['learning_sessions']['Row'];

interface LearningPathProps {
  session: LearningSession | null;
}

export function LearningPath({ session }: LearningPathProps) {
  const defaultProgress = {
    pattern_recognition: 0,
    hypothesis_generation: 0,
    hypothesis_testing: 0,
    intervention_planning: 0,
    outcome_evaluation: 0
  };

  const progress = session?.hoac_progress as typeof defaultProgress || defaultProgress;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Learning Path</h3>
      {session ? (
        <LearningProgress hoacProgress={progress} />
      ) : (
        <p className="text-muted-foreground">
          Start a learning session to begin your personalized learning path.
        </p>
      )}
    </div>
  );
}