import { ReactNode } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  title: string;
  description: string;
  icon?: ReactNode;
}

interface StepWizardProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  className?: string;
}

export const StepWizard = ({ steps, currentStep, onStepClick, className }: StepWizardProps) => {
  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Horizontal Steps */}
      <div className="hidden md:flex items-center justify-between mb-8">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div
              className={cn(
                "flex items-center cursor-pointer transition-all duration-200",
                onStepClick && "hover:scale-105"
              )}
              onClick={() => onStepClick?.(index)}
            >
              {/* Step Circle */}
              <div
                className={cn(
                  "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200",
                  index < currentStep
                    ? "bg-primary border-primary text-white"
                    : index === currentStep
                    ? "bg-primary/10 border-primary text-primary"
                    : "bg-gray-100 border-gray-300 text-gray-400"
                )}
              >
                {index < currentStep ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>

              {/* Step Info */}
              <div className="ml-4 text-left">
                <div
                  className={cn(
                    "text-sm font-semibold transition-colors",
                    index <= currentStep ? "text-primary" : "text-gray-400"
                  )}
                >
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground max-w-32">
                  {step.description}
                </div>
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div className="flex-1 mx-4">
                <div
                  className={cn(
                    "h-0.5 transition-colors duration-200",
                    index < currentStep ? "bg-primary" : "bg-gray-300"
                  )}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Mobile Vertical Steps */}
      <div className="md:hidden mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">
            Step {currentStep + 1} of {steps.length}
          </h3>
          <div className="text-sm text-muted-foreground">
            {Math.round(((currentStep + 1) / steps.length) * 100)}% Complete
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div
            className="bg-medical-gradient h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>

        {/* Current Step Info */}
        <div className="bg-white p-4 rounded-lg border border-primary/20">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-semibold">
              {currentStep + 1}
            </div>
            <div>
              <div className="font-semibold text-primary">{steps[currentStep]?.title}</div>
              <div className="text-sm text-muted-foreground">{steps[currentStep]?.description}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepWizard;