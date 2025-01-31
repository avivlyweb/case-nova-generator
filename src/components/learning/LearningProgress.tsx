import { Progress } from "@/components/ui/progress";

interface LearningProgressProps {
  hoacProgress: {
    pattern_recognition: number;
    hypothesis_generation: number;
    hypothesis_testing: number;
    intervention_planning: number;
    outcome_evaluation: number;
  } | null;
}

export function LearningProgress({ hoacProgress }: LearningProgressProps) {
  if (!hoacProgress) return null;

  const totalSteps = Object.keys(hoacProgress).length;
  const completedSteps = Object.values(hoacProgress).filter(v => v === 100).length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-2 mt-4">
      <div className="flex justify-between text-sm">
        <span>Overall Progress</span>
        <span>{Math.round(progressPercentage)}%</span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
      <div className="space-y-6 mt-4">
        {Object.entries(hoacProgress).map(([step, progress]) => (
          <div key={step} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="capitalize">{step.replace(/_/g, ' ')}</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
}