import { useState, useEffect } from "react";
import OnboardingStepper from "../components/onboarding/OnBoardingStepper";
import OnboardingOrgStep from "../components/onboarding/OnBoardingOrgStep";
import OnboardingRolesStep from "../components/onboarding/OnBoardingRolesStep";
import OnboardingProjectStep from "../components/onboarding/OnBoardingProjectStep";
import OnboardingSummaryStep from "../components/onboarding/OnBoardingSummaryStep";

const LOCAL_KEY = "cwmis_onboarding_draft";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [roles, setRoles] = useState([]);
  const [project, setProject] = useState({
    name: "",
    subparts: [{ name: "", days: 1 }],
  });

  // Load draft if exists
  useEffect(() => {
    const draft = localStorage.getItem(LOCAL_KEY);
    if (draft) {
      const { orgName, roles, project, step } = JSON.parse(draft);
      setOrgName(orgName || "");
      setRoles(roles || []);
      setProject(project || { name: "", subparts: [{ name: "", days: 1 }] });
      setStep(step || 1);
    }
  }, []);

  // Save draft on change
  useEffect(() => {
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ orgName, roles, project, step })
    );
  }, [orgName, roles, project, step]);

  const handleSkip = () => {
    localStorage.removeItem(LOCAL_KEY);
    window.location.href = "/dashboard";
  };

  const handleSubmit = () => {
    // Here, send to backend if needed
    localStorage.removeItem(LOCAL_KEY);
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-[#efeee8] flex flex-col items-center justify-center py-8">
      <OnboardingStepper step={step} />
      {step === 1 && (
        <OnboardingOrgStep
          orgName={orgName}
          setOrgName={setOrgName}
          onNext={() => setStep(2)}
          onSkip={handleSkip}
        />
      )}
      {step === 2 && (
        <OnboardingRolesStep
          roles={roles}
          setRoles={setRoles}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <OnboardingProjectStep
          project={project}
          setProject={setProject}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <OnboardingSummaryStep
          orgName={orgName}
          roles={roles}
          project={project}
          onBack={() => setStep(3)}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}
