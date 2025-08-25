// Common UI components for onboarding

export function OnboardingContainer({ children, title, subtitle }) {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <h2 className="text-2xl font-bold font-serif text-cyan-900 mb-2">
        {title}
      </h2>
      {subtitle && <p className="text-cyan-800 font-sans mb-6">{subtitle}</p>}
      {children}
    </div>
  );
}

export function OnboardingButton({
  variant = "primary",
  loading = false,
  disabled = false,
  children,
  ...props
}) {
  const baseClasses =
    "px-8 py-2 rounded-xl font-semibold font-sans transition disabled:opacity-50";

  const variants = {
    primary: "bg-orange-800 text-white hover:bg-green-600",
    secondary:
      "text-sm underline text-cyan-600 font-medium hover:text-cyan-800",
    success: "bg-green-600 text-white hover:bg-green-800",
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]}`}
      disabled={loading || disabled}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}

export function OnboardingNavigation({
  onBack,
  onNext,
  backText = "← Back",
  nextText = "Next",
  loading = false,
}) {
  return (
    <div className="flex flex-col sm:flex-row justify-between mt-10 gap-2">
      {onBack && (
        <OnboardingButton
          variant="secondary"
          onClick={onBack}
          disabled={loading}
        >
          {backText}
        </OnboardingButton>
      )}
      {onNext && (
        <OnboardingButton loading={loading} onClick={onNext}>
          {nextText}
        </OnboardingButton>
      )}
    </div>
  );
}

export function ErrorMessage({ error }) {
  if (!error) return null;
  return <div className="text-red-600 text-sm mt-4">{error}</div>;
}

export function LoadingSpinner({ text = "Loading..." }) {
  return (
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-600 mx-auto mb-2"></div>
      <p className="text-cyan-700 text-sm">{text}</p>
    </div>
  );
}
