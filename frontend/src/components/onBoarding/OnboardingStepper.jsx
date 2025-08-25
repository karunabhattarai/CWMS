export default function OnboardingStepper({ step }) {
  const steps = ["Roles", "Members", "Project Template", "Summary"];
  return (
    <div className="w-full flex justify-center mb-8">
      <div className="flex w-full max-w-2xl overflow-x-auto px-2">
        {steps.map((label, idx) => (
          <div
            key={label}
            className="flex-1 flex flex-col items-center min-w-[70px] relative"
          >
            {/* Connector line (except first step) */}
            {idx > 0 && (
              <div className="hidden sm:block absolute left-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-cyan-200 z-0" />
            )}
            {/* Step circle */}
            <div
              className={`relative z-10 flex items-center justify-center rounded-full transition-all duration-300
                ${
                  step === idx + 1
                    ? "bg-orange-800 text-white shadow-lg"
                    : step > idx + 1
                    ? "bg-green-600 text-white"
                    : "bg-cyan-100 text-cyan-900"
                }
                w-8 h-8 sm:w-10 sm:h-10 text-base sm:text-lg font-bold
              `}
            >
              {idx + 1}
            </div>
            {/* Label */}
            <span
              className={`mt-2 text-xs sm:text-sm text-center font-sans transition
                ${
                  step === idx + 1
                    ? "font-bold text-orange-800"
                    : "font-normal text-cyan-900"
                }
              `}
            >
              {label}
            </span>
            {/* Connector line (except last step) */}
            {idx < steps.length - 1 && (
              <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-1/2 h-1 bg-cyan-200 z-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
