import { useEffect, useState } from "react";

const DEMO_ORG = "Creative Minds Studio";

export default function OnboardingOrgStep({
  orgName,
  setOrgName,
  onNext,
  onSkip,
}) {
  const [error, setError] = useState("");
  useEffect(() => {
    if (!orgName) setOrgName(DEMO_ORG);
    // eslint-disable-next-line
  }, []);

  const handleNext = () => {
    if (!orgName.trim()) {
      setError("Organization name is required.");
      return;
    }
    setError("");
    onNext();
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-3xl font-bold font-serif text-cyan-900 mb-2">
        Welcome!
      </h2>
      <p className="text-cyan-800 font-sans mb-6">
        Let's set up your organization to get started.
      </p>
      <div className="mb-4">
        <label className="block text-cyan-900 font-sans mb-2 font-semibold">
          Organization Name
        </label>
        <input
          type="text"
          className="w-full px-4 py-3 rounded-xl border border-cyan-200 focus:outline-none focus:ring-2 focus:ring-green-500 font-sans text-lg"
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="e.g. Creative Minds Studio"
        />
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </div>
      <div className="flex justify-between mt-8">
        <button
          className="text-sm underline text-green-600 font-medium font-sans hover:text-orange-800 transition"
          onClick={onSkip}
        >
          Skip Onboarding
        </button>
        <button
          className="bg-orange-800 text-white px-8 py-2 rounded-xl font-semibold font-sans hover:bg-green-600 transition"
          onClick={handleNext}
        >
          Next
        </button>
      </div>
    </div>
  );
}
