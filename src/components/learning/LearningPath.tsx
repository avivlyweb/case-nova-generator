import type { Database } from "@/integrations/supabase/types";
import { LearningProgress } from "./LearningProgress";

type LearningSession = Database['public']['Tables']['learning_sessions']['Row'];

interface LearningPathProps {
  session: LearningSession | null;
}

export function LearningPath({ session }: LearningPathProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Learning Path</h3>
      {session ? (
        <LearningProgress hoacProgress={session.hoac_progress} />
      ) : (
        <p className="text-muted-foreground">
          Start a learning session to begin your personalized learning path.
        </p>
      )}
    </div>
  );
}