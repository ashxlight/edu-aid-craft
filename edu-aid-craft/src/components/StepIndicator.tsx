import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
}

const StepIndicator = ({ steps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 py-6">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isActive = i === currentStep;
        return (
          <div key={step} className="flex items-center gap-2">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? "bg-teal text-primary-foreground"
                    : isActive
                    ? "bg-orange text-foreground shadow-lg shadow-orange/30"
                    : "bg-card text-muted-foreground border border-border"
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${
                isActive ? "text-orange" : isCompleted ? "text-teal" : "text-muted-foreground"
              }`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-10 md:w-16 h-0.5 mb-6 rounded ${isCompleted ? "bg-teal" : "bg-border"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default StepIndicator;
