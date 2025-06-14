export default function OnboardingSummaryStep({
  orgName,
  roles,
  project,
  onBack,
  onSubmit,
}) {
  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-2xl shadow-lg p-8">
      <h2 className="text-2xl font-bold font-serif text-cyan-900 mb-4">
        Review & Submit
      </h2>
      <div className="mb-8">
        <h3 className="font-semibold text-lg font-serif text-cyan-900 mb-2">
          Organization
        </h3>
        <div className="font-sans text-cyan-900">{orgName}</div>
      </div>
      <div className="mb-8">
        <h3 className="font-semibold text-lg font-serif text-cyan-900 mb-2">
          Team
        </h3>
        {roles.map((role, idx) => (
          <div key={idx} className="mb-2">
            <span className="font-bold">{role.name}</span>
            <ul className="ml-4 list-disc">
              {role.employees.map((emp, empIdx) => (
                <li key={empIdx}>
                  {emp.name}{" "}
                  <span className="text-cyan-700">({emp.email})</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="mb-8">
        <h3 className="font-semibold text-lg font-serif text-cyan-900 mb-2">
          Project Template
        </h3>
        <div className="font-sans text-cyan-900 font-bold">{project.name}</div>
        <ul className="ml-4 list-disc">
          {project.subparts.map((sub, idx) => (
            <li key={idx}>
              {sub.name}:{" "}
              <span className="text-cyan-700">{sub.days} day(s)</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex justify-between mt-10">
        <button
          className="bg-cyan-100 text-cyan-900 px-6 py-2 rounded-xl font-medium font-sans hover:bg-cyan-200 transition"
          onClick={onBack}
        >
          Back
        </button>
        <button
          className="bg-orange-800 text-white px-8 py-2 rounded-xl font-semibold font-sans hover:bg-green-600 transition"
          onClick={onSubmit}
        >
          Finish & Go to Dashboard
        </button>
      </div>
    </div>
  );
}
