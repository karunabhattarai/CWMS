import { useState, useEffect } from "react";
import OnboardingStepper from "../components/onboarding/OnBoardingStepper";
import OnboardingRolesStep from "../components/onboarding/OnBoardingRolesStep";
import OnboardingProjectStep from "../components/onboarding/OnBoardingProjectStep";
import OnboardingSummaryStep from "../components/onboarding/OnBoardingSummaryStep";
import CreateManagerModal from "../components/onboarding/CreateManagerModal";
import { useAuth } from "../hooks/useAuth";

const LOCAL_KEY = "cwmis_onboarding_draft";

export default function OnboardingPage() {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const [step, setStep] = useState(1);
  const [roles, setRoles] = useState([]);
  const [project, setProject] = useState({
    name: "",
    subparts: [{ name: "", days: 1, role: "" }],
  });
  const [showManagerModal, setShowManagerModal] = useState(false);

  // Load draft if exists
  useEffect(() => {
    const draft = localStorage.getItem(LOCAL_KEY);
    if (draft) {
      const { roles, project, step } = JSON.parse(draft);
      setRoles(roles || []);
      setProject(
        project || { name: "", subparts: [{ name: "", days: 1, role: "" }] }
      );
      setStep(step || 1);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify({ roles, project, step }));
  }, [roles, project, step]);

  const handleSkip = () => {
    if (userRole === "superadmin") {
      setShowManagerModal(true);
    }
  };

  const handleSkipWithoutManager = () => {
    localStorage.removeItem(LOCAL_KEY);
    setShowManagerModal(false);
    window.location.href = "/dashboard";
  };

  const handleManagerCreated = () => {
    localStorage.removeItem(LOCAL_KEY);
    setShowManagerModal(false);
    window.location.href = "/dashboard";
  };

  const handleSubmit = async () => {
    localStorage.removeItem(LOCAL_KEY);
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-[#efeee8] flex flex-col items-center justify-center py-8">
      <OnboardingStepper step={step} />

      {/* Skip onboarding information - only for superadmins */}
      {step === 1 && userRole === "superadmin" && (
        <div className="w-full max-w-xl mx-auto mb-6 px-4">
          <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
            <p className="text-cyan-800 font-sans text-sm text-center">
              💡 <strong>Tip:</strong> You can skip the onboarding process and
              delegate it to a manager. This allows you to get started
              quickly while giving someone else the responsibility to set up
              your team structure.
            </p>
          </div>
        </div>
      )}

      {step === 1 && (
        <OnboardingRolesStep
          roles={roles}
          setRoles={setRoles} // This will get roles with _id after backend POST
          onNext={() => setStep(2)}
          onSkip={handleSkip}
        />
      )}
      {step === 2 && (
        <OnboardingProjectStep
          project={project}
          setProject={setProject}
          roles={roles}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <OnboardingSummaryStep
          roles={roles}
          project={project}
          onBack={() => setStep(2)}
          onSubmit={handleSubmit}
        />
      )}

      <CreateManagerModal
        isOpen={showManagerModal}
        onClose={() => setShowManagerModal(false)}
        onSkip={handleSkipWithoutManager}
        onManagerCreated={handleManagerCreated}
      />
    </div>
  );
}
