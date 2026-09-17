import { cn } from "@/lib/utils";

const STEPS = ["Delivery", "Zone", "Payment", "Review"] as const;

export function CheckoutSteps({ currentStep }: { currentStep: number }) {
  return (
    <ol className="flex items-center gap-2 sm:gap-4">
      {STEPS.map((label, index) => {
        const stepNumber = index + 1;
        const isActive = stepNumber === currentStep;
        const isComplete = stepNumber < currentStep;

        return (
          <li
            key={label}
            aria-current={isActive ? "step" : undefined}
            className="flex items-center gap-2"
          >
            <span
              aria-hidden="true"
              className={cn(
                "font-stencil flex size-8 shrink-0 items-center justify-center rounded-full border text-sm",
                isActive
                  ? "border-murram bg-murram text-savanna"
                  : isComplete
                    ? "border-acacia bg-acacia text-savanna"
                    : "border-steel/40 text-tarmac/70"
              )}
            >
              {stepNumber}
            </span>
            <span
              className={cn(
                "hidden text-sm sm:inline",
                isActive ? "font-medium text-tarmac" : "text-tarmac/70"
              )}
            >
              {label}
            </span>
            {stepNumber < STEPS.length && (
              <span aria-hidden="true" className="mx-1 h-px w-4 bg-steel/40 sm:w-8" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
