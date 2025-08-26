import { useState, useEffect } from "react";
import axios from "axios";
import OnboardingStepper from "../components/onboarding/OnboardingStepper";
import OnboardingRolesStep from "../components/onboarding/OnboardingRolesStep";
import OnboardingMembersStep from "../components/onboarding/OnboardingMembersStep";
import OnboardingProjectStep from "../components/onboarding/OnboardingProjectStep";
import OnboardingSummaryStep from "../components/onboarding/OnboardingSummaryStep";
import AddManagerModal from "../components/AddManagerModal";
import { useAuth } from "../hooks/useAuth";
import {
  ONBOARDING_STORAGE_KEY,
  API_BASE,
  getAuthHeaders,
  redirectToDashboard,
  saveDraft,
  loadDraft,
  clearDraft,
} from "../utils/onboardingUtils";

export default function OnboardingPage() {
  const { getUserRole } = useAuth();
  const userRole = getUserRole();
  const [step, setStep] = useState(1);
  const [roles, setRoles] = useState([]);
  const [members, setMembers] = useState([]);
  const [project, setProject] = useState({
    name: "",
    subparts: [{ name: "", days: 1, role: "" }],
  });
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Check if onboarding is needed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        // Check for existing roles and members
        const [rolesRes, membersRes] = await Promise.all([
          axios.get(`${API_BASE}/api/role`, getAuthHeaders()),
          axios.get(`${API_BASE}/api/member`, getAuthHeaders()),
        ]);

        const existingRoles = rolesRes.data || [];
        const existingMembers = membersRes.data || [];

        // If company already has roles or members, redirect to dashboard
        if (existingRoles.length > 0 || existingMembers.length > 0) {
          setShouldRedirect(true);
          setTimeout(redirectToDashboard, 2000);
          return;
        }

        // Otherwise, proceed with onboarding
        setLoading(false);
      } catch (error) {
        console.error("Error checking onboarding status:", error);
        // If there's an error, assume onboarding is needed
        setLoading(false);
      }
    };

    checkOnboardingStatus();
  }, []);

  // Load draft if exists (only after onboarding check passes)
  useEffect(() => {
    if (!loading && !shouldRedirect) {
      const draft = loadDraft();
      if (draft) {
        setRoles(draft.roles || []);
        setMembers(draft.members || []);
        setProject(
          draft.project || {
            name: "",
            subparts: [{ name: "", days: 1, role: "" }],
          }
        );
        setStep(draft.step || 1);
      }
    }
  }, [loading, shouldRedirect]);

  // Save draft on change
  useEffect(() => {
    if (!loading && !shouldRedirect) {
      saveDraft({ roles, members, project, step });
    }
  }, [roles, members, project, step, loading, shouldRedirect]);

  const handleSkip = () => {
    if (userRole === "superadmin") {
      setShowManagerModal(true);
    } else {
      handleSkipWithoutManager();
    }
  };

  const handleSkipWithoutManager = () => {
    clearDraft();
    setShowManagerModal(false);
    window.location.href = "/dashboard";
  };

  const handleManagerCreated = () => {
    clearDraft();
    setShowManagerModal(false);
    window.location.href = "/dashboard";
  };

  const handleSubmit = async () => {
    clearDraft();
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen bg-[#efeee8] flex flex-col items-center justify-center py-8">
      {loading && (
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-bold text-cyan-900 mb-2">
              Checking Company Setup...
            </h2>
            <p className="text-cyan-700">
              Verifying if onboarding is needed for your company.
            </p>
          </div>
        </div>
      )}

      {shouldRedirect && (
        <div className="w-full max-w-xl mx-auto">
          <div className="bg-green-50 border border-green-200 rounded-2xl shadow-lg p-8 text-center">
            <div className="text-green-600 text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-green-900 mb-2">
              Company Already Set Up!
            </h2>
            <p className="text-green-700 mb-4">
              Your company already has roles and members configured. Redirecting
              you to the dashboard...
            </p>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full animate-pulse"
                style={{ width: "100%" }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {!loading && !shouldRedirect && (
        <>
          <OnboardingStepper step={step} />

          {/* Skip onboarding information */}
          {step === 1 && (
            <div className="w-full max-w-xl mx-auto mb-6 px-4">
              <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                <p className="text-cyan-800 font-sans text-sm text-center">
                  💡 <strong>Tip:</strong> You can skip the onboarding process
                  and set up your team structure later from the dashboard.
                  {userRole === "superadmin" &&
                    " As a superadmin, you can also delegate the setup to a manager."}
                </p>
              </div>
            </div>
          )}

          {step === 1 && (
            <OnboardingRolesStep
              roles={roles}
              setRoles={setRoles}
              onNext={() => setStep(2)}
              onSkip={handleSkip}
            />
          )}
          {step === 2 && (
            <OnboardingMembersStep
              members={members}
              setMembers={setMembers}
              roles={roles}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              onSkip={handleSkip}
            />
          )}
          {step === 3 && (
            <OnboardingProjectStep
              project={project}
              setProject={setProject}
              roles={roles}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
              onSkip={handleSkip}
            />
          )}
          {step === 4 && (
            <OnboardingSummaryStep
              roles={roles}
              members={members}
              project={project}
              onBack={() => setStep(3)}
              onSubmit={handleSubmit}
            />
          )}

          <AddManagerModal
            isOpen={showManagerModal}
            onClose={() => setShowManagerModal(false)}
            onSkip={handleSkipWithoutManager}
            onManagerCreated={handleManagerCreated}
            variant="onboarding"
          />
        </>
      )}
    </div>
  );
}
