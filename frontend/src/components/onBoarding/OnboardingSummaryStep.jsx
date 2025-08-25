import { useState } from "react";
import { clearDraft } from "../../utils/onboardingUtils";
import { OnboardingContainer, OnboardingNavigation } from "./OnboardingUI";

export default function OnboardingSummaryStep({
  roles,
  members,
  project,
  onBack,
  onSubmit,
}) {
  const [loading, setLoading] = useState(false);

  const handleFinalSubmit = async () => {
    setLoading(true);
    // Clear draft data and redirect
    clearDraft();
    setTimeout(() => {
      onSubmit();
    }, 1000);
  };

  return (
    <OnboardingContainer>
      <h2 className="text-2xl font-bold font-serif text-cyan-900 mb-2">
        Review Your Setup
      </h2>
      <p className="text-cyan-800 font-sans mb-6">
        Review your team structure before completing the onboarding.
      </p>

      {/* Roles Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold font-serif text-cyan-900 mb-4">
          Company Roles ({roles.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {roles.map((role, idx) => (
            <div
              key={role._id || idx}
              className="bg-cyan-50 border border-cyan-200 rounded-xl p-3"
            >
              <h4 className="font-medium text-cyan-900">{role.name}</h4>
              {role.description && (
                <p className="text-sm text-cyan-700 mt-1">{role.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Members Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold font-serif text-cyan-900 mb-4">
          Team Members ({members.length})
        </h3>
        <div className="space-y-3">
          {members.map((member, idx) => (
            <div
              key={member._id || idx}
              className="bg-[#efeee8] rounded-xl p-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="font-medium text-cyan-900">{member.name}</h4>
                  <p className="text-sm text-cyan-700">{member.email}</p>
                </div>
                <div className="mt-2 sm:mt-0">
                  <div className="flex flex-wrap gap-1">
                    {member.roles.map((roleId) => {
                      const role = roles.find((r) => r._id === roleId);
                      return role ? (
                        <span
                          key={roleId}
                          className="px-2 py-1 bg-green-600 text-white text-xs rounded-full"
                        >
                          {role.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Template Summary */}
      {project && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold font-serif text-cyan-900 mb-4">
            Project Template
          </h3>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <h4 className="font-medium text-orange-900">{project.name}</h4>
            {project.description && (
              <p className="text-sm text-orange-700 mt-1">
                {project.description}
              </p>
            )}
            <div className="mt-3">
              <p className="text-sm text-orange-700">
                <span className="font-medium">Subtasks:</span>{" "}
                {project.subparts?.length || 0}
              </p>
              {project.saved && (
                <p className="text-xs text-green-600 mt-1">
                  ✅ Template saved successfully
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
        <h4 className="font-medium text-green-800 mb-2">🎉 You're all set!</h4>
        <p className="text-sm text-green-700">
          Your company setup is complete. You can always modify roles, members,
          and project templates later from your dashboard.
        </p>
      </div>

      <OnboardingNavigation
        onPrevious={onBack}
        onNext={handleFinalSubmit}
        onSkip={null}
        nextLabel={loading ? "Finishing..." : "Complete Setup"}
        previousLabel="← Back to Project Template"
        nextDisabled={loading}
        showSkip={false}
        loading={loading}
        nextButtonStyle="bg-green-600 hover:bg-green-800"
      />
    </OnboardingContainer>
  );
}
