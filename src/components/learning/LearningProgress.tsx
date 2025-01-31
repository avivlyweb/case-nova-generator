import { Progress } from "@/components/ui/progress";

interface HOACProgress {
  pattern_recognition: number;
  hypothesis_generation: number;
  hypothesis_testing: number;
  intervention_planning: number;
  outcome_evaluation: number;
}

interface LearningProgressProps {
  hoacProgress: HOACProgress;
}

export function LearningProgress({ hoacProgress }: LearningProgressProps) {
  const progressItems = [
    { label: "Pattern Recognition", value: hoacProgress.pattern_recognition },
    { label: "Hypothesis Generation", value: hoacProgress.hypothesis_generation },
    { label: "Hypothesis Testing", value: hoacProgress.hypothesis_testing },
    { label: "Intervention Planning", value: hoacProgress.intervention_planning },
    { label: "Outcome Evaluation", value: hoacProgress.outcome_evaluation }
  ];

  return (
    <div className="space-y-4">
      {progressItems.map((item) => (
        <div key={item.label} className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{item.label}</span>
            <span className="text-muted-foreground">{item.value}%</span>
          </div>
          <Progress value={item.value} className="h-2" />
        </div>
      ))}
    </div>
  );
}